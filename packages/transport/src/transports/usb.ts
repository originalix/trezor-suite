import { createDeferred, AbortablePromise } from '@trezor/utils';

import { Transport, AcquireInput } from './abstract';
import { buildAndSend } from '../lowlevel/send';
import { receiveAndParse } from '../lowlevel/receive';
import { SessionsClient } from '../sessions/client';
import { MessageFromTrezor, Descriptor, Success, ErrorGeneric } from '../types';

import * as TRANSPORT_ERRORS from './errors';
import * as COMMON_ERRORS from '../errors';
import * as INTERFACE_ERRORS from '../interfaces/errors';
import * as SESSION_ERRORS from '../sessions/errors';

import type { TransportUsbInterface } from '../interfaces/usb';

type UsbTransportConstructorParams = ConstructorParameters<typeof Transport>[0] & {
    usbInterface: TransportUsbInterface;
    sessionsClient: (typeof SessionsClient)['prototype'];
};

/**
 *
 * Abstract class for transports with direct usb access (webusb, nodeusb).
 *
 */
export abstract class UsbTransport extends Transport {
    // sessions client is a standardized interface for communicating with sessions backend
    // which can live in couple of context (shared worker, local module, websocket server etc)
    private sessionsClient: UsbTransportConstructorParams['sessionsClient'];
    private transportInterface: TransportUsbInterface;

    constructor({ messages, usbInterface, sessionsClient, signal }: UsbTransportConstructorParams) {
        super({ messages, signal });
        this.sessionsClient = sessionsClient;
        this.transportInterface = usbInterface;
    }

    public async init() {
        const handshakeRes = await this.sessionsClient.handshake();

        if (!handshakeRes.success) {
            return this.error({ error: TRANSPORT_ERRORS.SESSIONS_BACKGROUND_NOT_AVAILABLE });
        }

        return this.success(undefined);
    }

    public listen() {
        if (this.listening) {
            return this.error({ error: TRANSPORT_ERRORS.ALREADY_LISTENING });
        }

        this.listening = true;

        // 1. transport interface reports descriptors change
        this.transportInterface.on('transport-interface-change', devices => {
            // 2. we signal this to sessions background
            this.sessionsClient.enumerateDone({
                paths: devices.map(d => d.path),
            });
        });
        // 3. based on 2.sessions background distributes information about descriptors change to all clients
        this.sessionsClient.on('descriptors', descriptors => {
            // 4. we propagate new descriptors to higher levels
            this.handleDescriptorsChange(descriptors);
        });

        return this.success(undefined);
    }

    public enumerate() {
        return new AbortablePromise<
            Success<Descriptor[]> | ErrorGeneric<typeof COMMON_ERRORS.UNEXPECTED_ERROR>
        >(async resolve => {
            // notify sessions background that a client is going to access usb
            await this.sessionsClient.enumerateIntent();

            // enumerate usb interface
            const enumerateResult = await this.transportInterface.enumerate();

            if (!enumerateResult.success) {
                return resolve(enumerateResult);
            }
            const occupiedPaths = enumerateResult.payload;

            // inform sessions background about occupied paths and get descriptors back
            const enumerateDoneResponse = await this.sessionsClient.enumerateDone({
                paths: occupiedPaths,
            });

            resolve(this.success(enumerateDoneResponse.payload.descriptors));
        }, this.abortController.signal);
    }

    public acquire = ({ input }: { input: AcquireInput }) =>
        new AbortablePromise<
            | Success<string>
            // webusb
            | ErrorGeneric<
                  | typeof INTERFACE_ERRORS.UNABLE_TO_CLAIM_INTERFACE
                  | typeof INTERFACE_ERRORS.UNABLE_TO_OPEN_DEVICE
                  | typeof INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB

                  // webusb + bridge
                  | typeof INTERFACE_ERRORS.DEVICE_NOT_FOUND
                  | typeof SESSION_ERRORS.WRONG_PREVIOUS_SESSION
                  | typeof COMMON_ERRORS.UNEXPECTED_ERROR
              >
        >(async resolve => {
            // listenPromise is resolved on next listen
            this.listenPromise = createDeferred();

            const acquireIntentResponse = await this.sessionsClient.acquireIntent(input);
            if (!acquireIntentResponse.success) {
                // connect expects us to throw here
                return resolve(this.error({ error: acquireIntentResponse.error }));
            }

            this.acquiringPath = input.path;

            const reset = !!input.previous;

            const { path } = input;

            const openDeviceResult = await this.transportInterface.openDevice(path, reset);

            if (!openDeviceResult.success) {
                return resolve(openDeviceResult);
            }

            const acquireDoneResult = await this.sessionsClient.acquireDone({ path });

            const expectedSessionId = acquireDoneResult.payload.session;
            this.acquiringSession = expectedSessionId;

            if (!this.listening) {
                return resolve(this.success(expectedSessionId));
            }

            return this.listenPromise.promise
                .then(sessionId => {
                    resolve(this.success(sessionId));
                    delete this.listenPromise;
                })
                .catch(err => {
                    resolve(this.error(err));
                    delete this.listenPromise;
                });
        }, this.abortController.signal);

    call({
        session,
        name,
        data,
    }: {
        session: string;
        name: string;
        data: Record<string, unknown>;
    }) {
        return new AbortablePromise<
            | Success<MessageFromTrezor>
            | ErrorGeneric<
                  | typeof TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION
                  | typeof COMMON_ERRORS.UNEXPECTED_ERROR
              >
        >(async resolve => {
            const getPathBySessionResponse = await this.sessionsClient.getPathBySession({
                session,
            });
            if (!getPathBySessionResponse.success) {
                // session not found means that device was disconnected
                if (getPathBySessionResponse.error === 'session not found') {
                    return resolve(this.error({ error: 'device disconnected during action' }));
                }
                // should never happen
                return resolve(this.error({ error: 'unexpected error' }));
            }
            const { path } = getPathBySessionResponse.payload;

            try {
                await buildAndSend(
                    this.messages,
                    (buffer: Buffer) =>
                        this.transportInterface.write(path, buffer).then(result => {
                            if (!result.success) {
                                // todo:
                                throw new Error(result.error);
                            }
                        }),
                    name,
                    data,
                );

                const message = await receiveAndParse(this.messages, () =>
                    this.transportInterface.read(path).then(result => {
                        if (result.success) {
                            return result.payload;
                        }
                        // todo:
                        throw new Error(result.error);
                    }),
                );

                resolve(this.success(message));
            } catch (err) {
                // if user revokes usb permissions in browser we need a way how propagate that the device was technically disconnected,
                if (err.message === INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB) {
                    this.enumerate();
                    return resolve(
                        this.error({ error: TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION }),
                    );
                }

                resolve(this.unknownError(err, []));
            }
        }, this.abortController.signal);
    }

    send({
        data,
        session,
        name,
    }: {
        data: Record<string, unknown>;
        session: string;
        name: string;
    }) {
        return new AbortablePromise<
            | Success<undefined>
            | ErrorGeneric<
                  | typeof SESSION_ERRORS.SESSION_NOT_FOUND
                  | typeof COMMON_ERRORS.UNEXPECTED_ERROR
                  | typeof TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION
              >
        >(async resolve => {
            const getPathBySessionResponse = await this.sessionsClient.getPathBySession({
                session,
            });
            if (!getPathBySessionResponse.success) {
                return resolve(this.error({ error: getPathBySessionResponse.error }));
            }
            const { path } = getPathBySessionResponse.payload;

            try {
                await buildAndSend(
                    this.messages,
                    (buffer: Buffer) =>
                        this.transportInterface.write(path, buffer).then(result => {
                            if (!result.success) {
                                throw new Error(result.error);
                            }
                        }),
                    name,
                    data,
                );
                resolve(this.success(undefined));
            } catch (err) {
                if (err.message === INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB) {
                    this.enumerate();
                    return resolve(
                        this.error({ error: TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION }),
                    );
                }
                return resolve(this.unknownError(err, []));
            }
        }, this.abortController.signal);
    }

    receive({ session }: { session: string }) {
        return new AbortablePromise<
            | Success<MessageFromTrezor>
            | ErrorGeneric<
                  | typeof TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION
                  | typeof SESSION_ERRORS.SESSION_NOT_FOUND
                  | typeof COMMON_ERRORS.UNEXPECTED_ERROR
              >
        >(async resolve => {
            try {
                const getPathBySessionResponse = await this.sessionsClient.getPathBySession({
                    session,
                });
                if (!getPathBySessionResponse.success) {
                    return resolve(this.error({ error: getPathBySessionResponse.error }));
                }
                const { path } = getPathBySessionResponse.payload;

                const message = await receiveAndParse(this.messages, () =>
                    this.transportInterface.read(path).then(result => {
                        if (!result.success) {
                            throw new Error(result.error);
                        }
                        return result.payload;
                    }),
                );

                resolve(this.success(message));
            } catch (err) {
                if (err.message === INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB) {
                    this.enumerate();
                    return resolve(
                        this.error({ error: TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION }),
                    );
                }
                resolve(this.error(err));
            }
        }, this.abortController.signal);
    }

    release(session: string) {
        return new AbortablePromise<
            | Success<undefined>
            | ErrorGeneric<
                  typeof SESSION_ERRORS.SESSION_NOT_FOUND | typeof COMMON_ERRORS.UNEXPECTED_ERROR
              >
        >(async resolve => {
            if (this.listening) {
                this.releasingSession = session;
                this.releasePromise = createDeferred();
            }

            const releaseIntentResponse = await this.sessionsClient.releaseIntent({ session });

            if (!releaseIntentResponse.success) {
                return resolve(this.error({ error: releaseIntentResponse.error }));
            }

            await this.releaseDevice(releaseIntentResponse.payload.path);

            await this.sessionsClient.releaseDone({
                path: releaseIntentResponse.payload.path,
            });

            if (this.releasePromise?.promise) {
                await this.releasePromise.promise;
                delete this.releasePromise;
            }
            resolve(this.success(undefined));
        }, this.abortController.signal);
    }

    releaseDevice(path: string) {
        return this.transportInterface.closeDevice(path);
    }

    stop() {
        this.transportInterface.on('transport-interface-change', () => {
            this.logger.debug('device connected after transport stopped');
        });
        this.stopped = true;
        this.abortController.abort();
    }
}
