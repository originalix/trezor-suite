import * as protobuf from 'protobufjs/light';

import { Deferred } from '@trezor/utils';
import {
    MessageFromTrezor,
    Session,
    Descriptor,
    AsyncResultWithTypedError,
    ResultWithTypedError,
    Success,
    AnyError,
    Logger,
} from '../types';
import { TypedEmitter } from '../types/typed-emitter';
import { getAbortController } from '../utils/abortController';
import { success, error, unknownError } from '../utils/result';

import * as SESSION_ERRORS from '../sessions/errors';
import * as TRANSPORT_ERRORS from './errors';
import * as COMMON_ERRORS from '../errors';
import * as INTERFACE_ERRORS from '../interfaces/errors';

export type AcquireInput = {
    path: string;
    previous?: Session;
};

type DeviceDescriptorDiff = {
    didUpdate: boolean;
    descriptors: Descriptor[];
    connected: Descriptor[];
    disconnected: Descriptor[];
    changedSessions: Descriptor[];
    acquired: Descriptor[];
    acquiredByMyself: Descriptor[];
    acquiredElsewhere: Descriptor[];
    released: Descriptor[];
    releasedByMyself: Descriptor[];
    releasedElsewhere: Descriptor[];
};

export const TRANSPORT = {
    START: 'transport-start',
    ERROR: 'transport-error',
    UPDATE: 'transport-update',
    DISABLE_WEBUSB: 'transport-disable_webusb',
    REQUEST_DEVICE: 'transport-request_device',
} as const;

type ConstructorParams = {
    messages: Record<string, any>;
    signal?: AbortSignal;
    logger?: Logger;
};

export abstract class Transport extends TypedEmitter<{
    [TRANSPORT.UPDATE]: DeviceDescriptorDiff;
    [TRANSPORT.ERROR]: // most common error - bridge was killed
    | typeof TRANSPORT_ERRORS.HTTP_ERROR
    // probably never happens, wrong shape of data came from bridge
    | typeof TRANSPORT_ERRORS.WRONG_RESULT_TYPE;
}> {
    public abstract name: 'BridgeTransport' | 'NodeUsbTransport' | 'WebUsbTransport';
    /**
     * transports with "external element" such as bridge can be outdated.
     */
    public isOutdated = false;
    /**
     * transports with "external element" such as bridge can have version.
     */
    public version = '';
    /**
     * once transport has been stopped, it does not emit any events
     */
    protected stopped = false;
    /**
     * once transport is listening, it will be emitting TRANSPORT.UPDATE events
     */
    protected listening = false;
    protected messages: protobuf.Root;
    /**
     * minimal data to track device on transport layer
     */
    protected descriptors: Descriptor[];
    /**
     * when calling acquire, after it resolves successfully, we store the result (session)
     * and wait for next descriptors update (/listen in case of bridge or 'descriptors' message from sessions background)
     * and compare it with acquiringSession. Typically both values would equal but in certain edgecases
     * another application might have acquired session right after this application which means that
     * the originally received session is not longer valid and device is used by another application
     */
    protected acquiringSession?: string;
    /**
     * used in combination with acquiringSession - acquiring path is used to find Descriptor in next
     * reported descriptor, which is then used to compare its session with acquiringSession
     *
     */
    protected acquiringPath?: string;
    /**
     * promise that resolves on when next descriptors are delivered
     */
    protected listenPromise?: Deferred<string>;

    /**
     * used to postpone resolving of transport.release until next descriptors are delivered
     */
    protected releasePromise?: Deferred<any>;
    /**
     * transport.release resolves after releasingSession arrives within next descriptors
     */
    protected releasingSession?: string; // session
    /**
     * each transport class accepts signal parameter in constructor and implements it's own abort controller.
     * whenever signal event is fired, transport passes this down by aborting its won abort controller.
     */
    protected abortController: AbortController;
    /**
     * and instance of logger from @trezor/connect/src/utils/debug could be passed to activate logs from transport
     */
    protected logger: any;

    constructor({ messages, signal, logger }: ConstructorParams) {
        super();
        this.descriptors = [];
        this.messages = protobuf.Root.fromJSON(messages as protobuf.INamespace);

        // @ts-expect-error
        // I would like to use native AbortController (which should be available also in node)
        // but tests in trezor-connect are somehow misconfigured and they need this fallback
        this.abortController = getAbortController();

        if (signal) {
            signal.addEventListener('abort', () => {
                this.abortController.abort();
            });
        }

        // some abstract inactive logger
        this.logger = logger || {
            debug: (..._args: string[]) => { },
            log: (..._args: string[]) => { },
            warn: (..._args: string[]) => { },
            error: (..._args: string[]) => { },
        };
    }

    /**
     * Tries to initiate transport. Transport might not be available e.g. bridge not running.
     */
    abstract init(): AsyncResultWithTypedError<
        undefined,
        // webusb only
        | typeof TRANSPORT_ERRORS.SESSIONS_BACKGROUND_NOT_AVAILABLE
        | typeof TRANSPORT_ERRORS.WRONG_ENVIRONMENT
        // bridge only
        | typeof TRANSPORT_ERRORS.WRONG_RESULT_TYPE
        | typeof TRANSPORT_ERRORS.HTTP_ERROR
        // bridge + webusb
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
    >;

    /**
     * Setup listeners for device changes (connect, disconnect, change?).
     * What should it do? Will start emitting DEVICE events after this is fired?
     * - should call onDescriptorsUpdated in the end
     */
    abstract listen(): ResultWithTypedError<undefined, typeof TRANSPORT_ERRORS.ALREADY_LISTENING>;

    /**
     * List Trezor devices
     */
    abstract enumerate(): AsyncResultWithTypedError<
        Descriptor[],
        | typeof TRANSPORT_ERRORS.HTTP_ERROR
        | typeof TRANSPORT_ERRORS.WRONG_RESULT_TYPE
        | typeof TRANSPORT_ERRORS.ABORTED_BY_TIMEOUT
        | typeof TRANSPORT_ERRORS.ABORTED_BY_SIGNAL
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
    >;

    /**
     * Acquire session
     */
    abstract acquire({ input }: { input: AcquireInput }): AsyncResultWithTypedError<
        string,
        // webusb
        | typeof INTERFACE_ERRORS.UNABLE_TO_CLAIM_INTERFACE
        | typeof INTERFACE_ERRORS.UNABLE_TO_OPEN_DEVICE
        | typeof INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB

        // bridge
        | typeof TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION
        | typeof TRANSPORT_ERRORS.DEVICE_CLOSED
        | typeof TRANSPORT_ERRORS.WRONG_RESULT_TYPE // local
        | typeof TRANSPORT_ERRORS.HTTP_ERROR
        // webusb + bridge
        // | typeof INTERFACE_ERRORS.DEVICE_NOT_FOUND
        | typeof SESSION_ERRORS.WRONG_PREVIOUS_SESSION
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
        | typeof TRANSPORT_ERRORS.ABORTED_BY_TIMEOUT
        | typeof TRANSPORT_ERRORS.ABORTED_BY_SIGNAL
    >;

    /**
     * Release session
     */
    abstract release(
        session: string,
        onclose: boolean,
    ): AsyncResultWithTypedError<
        void,
        | typeof SESSION_ERRORS.SESSION_NOT_FOUND
        // bridge
        | typeof TRANSPORT_ERRORS.HTTP_ERROR
        | typeof TRANSPORT_ERRORS.WRONG_RESULT_TYPE
        // webusb + bridge
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
        | typeof TRANSPORT_ERRORS.ABORTED_BY_TIMEOUT
        | typeof TRANSPORT_ERRORS.ABORTED_BY_SIGNAL
    >;

    /**
     * Release device
     * This does nothing for transports using "external element" such as bridge
     * For transports with native access (webusb), this informs lower transport layer
     * that device is not going to be used anymore
     */
    abstract releaseDevice(path: string): AsyncResultWithTypedError<void, string>;

    /**
     * Encode data and write it to transport layer
     */
    abstract send({
        path,
        session,
        data,
        name,
    }: {
        path?: string;
        session?: string;
        name: string;
        data: Record<string, unknown>;
    }): AsyncResultWithTypedError<
        undefined,
        | typeof TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION
        // bridge
        | typeof TRANSPORT_ERRORS.HTTP_ERROR
        | typeof TRANSPORT_ERRORS.WRONG_RESULT_TYPE
        // webusb + bridge
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
        | typeof SESSION_ERRORS.SESSION_NOT_FOUND
        | typeof TRANSPORT_ERRORS.ABORTED_BY_TIMEOUT
        | typeof TRANSPORT_ERRORS.ABORTED_BY_SIGNAL
    >;

    /**
     * Only read from transport
     */
    abstract receive({
        path,
        session,
    }: {
        path?: string;
        session?: string;
    }): AsyncResultWithTypedError<
        MessageFromTrezor,
        // bridge
        | typeof TRANSPORT_ERRORS.HTTP_ERROR
        | typeof TRANSPORT_ERRORS.WRONG_RESULT_TYPE
        // webusb + bridge
        | typeof TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
        | typeof SESSION_ERRORS.SESSION_NOT_FOUND
        | typeof TRANSPORT_ERRORS.ABORTED_BY_TIMEOUT
        | typeof TRANSPORT_ERRORS.ABORTED_BY_SIGNAL
    >;

    /**
     * Send and read after that
     */
    abstract call({
        session,
        name,
        data,
    }: {
        session: string;
        name: string;
        data: Record<string, unknown>;
    }): AsyncResultWithTypedError<
        MessageFromTrezor,
        | typeof TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION
        // bridge
        | typeof TRANSPORT_ERRORS.HTTP_ERROR
        | typeof TRANSPORT_ERRORS.WRONG_RESULT_TYPE
        // webusb + bridge
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
        | typeof TRANSPORT_ERRORS.ABORTED_BY_TIMEOUT
        | typeof TRANSPORT_ERRORS.ABORTED_BY_SIGNAL
    >;

    /**
     * Stop transport = remove all listeners + try to release session + cancel all requests
     */
    abstract stop(): void;

    private _getDiff(nextDescriptors: Descriptor[]): DeviceDescriptorDiff {
        const connected = nextDescriptors.filter(
            nextDescriptor =>
                !this.descriptors.find(descriptor => descriptor.path === nextDescriptor.path),
        );
        const disconnected = this.descriptors.filter(
            d => nextDescriptors.find(x => x.path === d.path) === undefined,
        );
        const changedSessions = nextDescriptors.filter(d => {
            const currentDescriptor = this.descriptors.find(x => x.path === d.path);
            if (currentDescriptor) {
                return currentDescriptor.session !== d.session;
            }
            return false;
        });

        const acquired = changedSessions.filter(d => typeof d.session === 'string');
        const acquiredByMyself = acquired.filter(d => d.session === this.acquiringSession);
        const acquiredElsewhere = acquired.filter(d => d.session !== this.acquiringSession);

        const released = changedSessions.filter(d => typeof d.session !== 'string');
        const releasedByMyself = released.filter(
            d =>
                this.descriptors.find(prevD => prevD.path === d.path)?.session ===
                this.releasingSession,
        );
        const releasedElsewhere = released.filter(
            d =>
                this.descriptors.find(prevD => prevD.path === d.path)?.session !==
                this.releasingSession,
        );

        const didUpdate = connected.length + disconnected.length + changedSessions.length > 0;

        return {
            connected,
            disconnected,
            // changedSessions is superset of acquired
            changedSessions,
            // acquired is acquiredByMyself + acquiredElsewhere
            acquired,
            acquiredByMyself,
            acquiredElsewhere,

            released,
            releasedByMyself,
            releasedElsewhere,
            didUpdate,
            descriptors: nextDescriptors,
        };
    }

    /**
     * common method for all types of transports. should be called whenever descriptors change:
     * - after enumeration (new descriptors without session)
     * - after acquire (some descriptor changed session number)
     * - after release (some descriptor changed session number)
     */
    handleDescriptorsChange(nextDescriptors: Descriptor[]) {
        if (this.stopped) {
            return;
        }

        const diff = this._getDiff(nextDescriptors);

        this.logger.debug('nextDescriptors', nextDescriptors, 'diff', diff);

        this.descriptors = nextDescriptors;

        if (diff.didUpdate) {
            if (this.listenPromise && this.acquiringSession) {
                const descriptor = nextDescriptors.find(
                    device => device.path === this.acquiringPath,
                );

                if (!descriptor) {
                    return this.listenPromise.reject(
                        new Error(TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION),
                    );
                }

                const reportedNextSession = descriptor.session;

                if (reportedNextSession === this.acquiringSession) {
                    this.listenPromise.resolve(this.acquiringSession);
                } else {
                    this.listenPromise.reject(new Error(SESSION_ERRORS.WRONG_PREVIOUS_SESSION));
                }
            }

            if (this.releasePromise) {
                this.releasePromise.resolve(undefined);
            }
            this.emit(TRANSPORT.UPDATE, diff);
            this.releasingSession = undefined;
            this.acquiringSession = undefined;
        }
    }

    protected success<T>(payload: T): Success<T> {
        return success(payload);
    }

    // todo: I am thinking if all those cryptic errors should not be converted / narrowed to something more
    // intelligible to higher layers
    protected error<
        E extends
        | (typeof INTERFACE_ERRORS)[keyof typeof INTERFACE_ERRORS]
        | (typeof SESSION_ERRORS)[keyof typeof SESSION_ERRORS]
        | (typeof TRANSPORT_ERRORS)[keyof typeof TRANSPORT_ERRORS]
        | (typeof COMMON_ERRORS)[keyof typeof COMMON_ERRORS],
    >(payload: { error: E; message?: string }) {
        return error<E>(payload);
    }

    protected unknownError = <E extends AnyError>(err: Error, expectedErrors: E[]) =>
        unknownError(err, expectedErrors);
}
