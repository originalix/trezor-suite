// original file https://github.com/trezor/connect/blob/develop/src/js/device/DeviceList.js

/* eslint-disable no-restricted-syntax */

import EventEmitter from 'events';

import {
    BridgeTransport,
    WebUsbTransport,
    Transport,
    TrezorDeviceInfoWithSession as DeviceDescriptor,
    TRANSPORT,
    Descriptor,
    TRANSPORT_ERROR,
} from '@trezor/transport';
import { ERRORS } from '../constants';
import { DEVICE, TransportInfo } from '../events';
import { Device } from './Device';
import type { Device as DeviceTyped } from '../types';
import { DataManager } from '../data/DataManager';
import { getBridgeInfo } from '../data/transportInfo';
import { initLog } from '../utils/debug';
import { resolveAfter } from '../utils/promiseUtils';

// custom log
const _log = initLog('DeviceList');
interface DeviceListEvents {
    [TRANSPORT.START]: TransportInfo;
    [TRANSPORT.ERROR]: string;
    [DEVICE.CONNECT]: DeviceTyped;
    [DEVICE.CONNECT_UNACQUIRED]: DeviceTyped;
    [DEVICE.DISCONNECT]: DeviceTyped;
    [DEVICE.CHANGED]: DeviceTyped;
    [DEVICE.RELEASED]: DeviceTyped;
    [DEVICE.ACQUIRED]: DeviceTyped;
}

export interface DeviceList {
    on<K extends keyof DeviceListEvents>(
        type: K,
        listener: (event: DeviceListEvents[K]) => void,
    ): this;
    off<K extends keyof DeviceListEvents>(
        type: K,
        listener: (event: DeviceListEvents[K]) => void,
    ): this;
    emit<K extends keyof DeviceListEvents>(type: K, args: DeviceListEvents[K]): boolean;
}

export class DeviceList extends EventEmitter {
    // @ts-expect-error has no initializer
    transport: Transport;

    // array of transport that might be used in this environment
    transports: Transport[] = [];

    devices: { [path: string]: Device } = {};

    messages: JSON | Record<string, any>;
    creatingDevicesDescriptors: { [k: string]: Descriptor } = {};

    transportStartPending = 0;

    penalizedDevices: { [deviceID: string]: number } = {};

    constructor() {
        super();
        let { transports } = DataManager.settings;
        this.messages = DataManager.getProtobufMessages();

        // we fill in `transports` with a reasonable fallback in src/index.
        // since web index is released into npm, we can not rely
        // on that that transports will be always set here. We need to provide a 'fallback of the last resort'
        if (!transports?.length) {
            transports = ['BridgeTransport', 'WebUsbTransport'];
        }

        // mapping of provided transports[] to @trezor/transport classes
        transports.forEach(transportType => {
            if (typeof transportType === 'string') {
                switch (transportType) {
                    case 'WebUsbTransport':
                        this.transports.push(
                            new WebUsbTransport({
                                messages: this.messages,
                            }),
                        );
                        break;
                    case 'BridgeTransport':
                        this.transports.push(
                            new BridgeTransport({
                                latestVersion: getBridgeInfo().version.join('.'),
                                messages: this.messages,
                            }),
                        );
                        break;
                    default:
                        throw ERRORS.TypedError(
                            'Runtime',
                            `DeviceList.init: transports[] of unexpected type: ${transportType}`,
                        );
                    // not implemented
                    // case 'UdpTransport':
                }
            } else if (transportType instanceof Transport) {
                this.transports.unshift(transportType);
            } else {
                // runtime check
                throw ERRORS.TypedError(
                    'Runtime',
                    'DeviceList.init: transports[] of unexpected type',
                );
            }
        });
    }

    /**
     * Init @trezor/transport and do something with its results
     */
    async init() {
        try {
            _log.debug('Initializing transports');
            let lastError: any = null;

            for (const transport of this.transports) {
                this.transport = transport;
                const result = await this.transport.init();
                if (result.success) {
                    lastError = '';
                    break;
                } else {
                    lastError = result.error;
                }
            }

            if (lastError || !this.transport) {
                this.emit(
                    TRANSPORT.ERROR,
                    lastError ||
                        ERRORS.TypedError(
                            'Runtime',
                            'DeviceList.init: No transport could be initialized.',
                        ),
                );
                return;
            }

            if (DataManager.settings.debug) {
                this.transport.setLogger(initLog('@trezor/transport', DataManager.settings.debug));
            }

            /**
             * listen to change of descriptors reported by @trezor/transport
             * we can say that this part lets connect know about
             * "external activities with trezor devices" such as device was connected/disconnected
             * or it was acquired or released by another application.
             * releasing/acquiring device by this application is not solved here but directly
             * where transport.acquire, transport.release is called
             */
            this.transport.on(TRANSPORT.UPDATE, diff => {
                diff.connected.forEach(async descriptor => {
                    const path = descriptor.path.toString();
                    const priority = DataManager.getSettings('priority');
                    const penalty = this.getAuthPenalty();

                    if (priority || penalty) {
                        await resolveAfter(501 + penalty + 100 * priority, null);
                    }
                    if (descriptor.session == null) {
                        await this._createAndSaveDevice(descriptor);
                    } else {
                        const device = this._createUnacquiredDevice(descriptor);
                        this.devices[path] = device;
                        this.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
                    }
                });

                diff.acquired.forEach(descriptor => {
                    const path = descriptor.path.toString();
                    if (this.creatingDevicesDescriptors[path]) {
                        this.creatingDevicesDescriptors[path] = descriptor;
                    }
                });

                diff.acquiredElsewhere.forEach((descriptor: Descriptor) => {
                    const path = descriptor.path.toString();
                    const device = this.devices[path];

                    if (device) {
                        device.featuresNeedsReload = true;
                        device.interruptionFromOutside();
                    }
                });

                // todo: not sure if this part is needed.
                diff.released.forEach(descriptor => {
                    const path = descriptor.path.toString();
                    const device = this.devices[path];
                    if (device) {
                        device.keepSession = false;
                    }
                });

                diff.releasedElsewhere.forEach(async descriptor => {
                    const path = descriptor.path.toString();
                    const device = this.devices[path];
                    if (device) {
                        if (device.isUnacquired() && !device.isInconsistent()) {
                            // wait for publish changes
                            await resolveAfter(501, null);
                            _log.debug('Create device from unacquired', device);
                            await this._createAndSaveDevice(descriptor);
                        }
                    }
                });

                const events = [
                    {
                        d: diff.changedSessions,
                        e: DEVICE.CHANGED,
                    },
                    {
                        d: diff.acquired,
                        e: DEVICE.ACQUIRED,
                    },
                    {
                        d: diff.released,
                        e: DEVICE.RELEASED,
                    },
                ];

                events.forEach(({ d, e }) => {
                    d.forEach(descriptor => {
                        const path = descriptor.path.toString();
                        const device = this.devices[path];
                        _log.debug('Event', e, device);
                        if (device) {
                            this.emit(e, device.toMessageObject());
                        }
                    });
                });

                diff.disconnected.forEach(descriptor => {
                    const path = descriptor.path.toString();
                    const device = this.devices[path];
                    if (device != null) {
                        device.disconnect();
                        delete this.devices[path];
                        this.emit(DEVICE.DISCONNECT, device.toMessageObject());
                    }
                });

                // todo: not sure if this is correct, it might be duplication of writes to
                // this.devices[d.path].activitySessionID in case of acquired/release by myself
                // maybe, updating of descriptors should be done only in diff.acquiredElsewhere,
                // diff.releasedElsewhere blocks

                // whenever descriptors change we need to update them so that we can use them
                // in subsequent transport.acquire calls
                diff.descriptors.forEach(d => {
                    if (this.devices[d.path]) {
                        this.devices[d.path].originalDescriptor = {
                            session: d.session,
                            path: d.path,
                        };
                        // todo: not sure about updating activitySessionID, imho this should
                        // be done only after acquire/release
                        this.devices[d.path].activitySessionID = d.session;
                    }
                });
            });

            // just like transport emits updates, it may also start producing errors, for example bridge process crashes.
            this.transport.on(TRANSPORT.ERROR, error => {
                this.emit(TRANSPORT.ERROR, error);
            });

            // enumerating for the first time. we intentionally postpone emitting TRANSPORT_START
            // event until we read descriptors for the first time
            const enumerateResult = await this.transport.enumerate();
            console.log('enumerateResult', enumerateResult);
            if (!enumerateResult.success) {
                this.emit(TRANSPORT.ERROR, enumerateResult.error);
                return;
            }

            const descriptors = enumerateResult.payload;
            console.log('DEVICE.LIST, enumerate done', descriptors);

            if (descriptors.length > 0 && DataManager.getSettings('pendingTransportEvent')) {
                console.log('DEVICE.LIST START PENDING!');
                this.transportStartPending = descriptors.length;
                // listen for self emitted events and resolve pending transport event if needed
                this.on(DEVICE.CONNECT, this.resolveTransportEvent.bind(this));
                this.on(DEVICE.CONNECT_UNACQUIRED, this.resolveTransportEvent.bind(this));
            } else {
                this.emit(TRANSPORT.START, this.getTransportInfo());
            }
            this.transport.handleDescriptorsChange(descriptors);
            this.transport.listen();
        } catch (error) {
            // transport should never. lets observe it but we could even remove try catch from here
            console.error('DeviceList init error', error);
        }
    }

    private resolveTransportEvent() {
        console.log('DEVICE.LIST resolve transport event', this.transportStartPending);
        this.transportStartPending--;

        if (this.transportStartPending === 0) {
            this.emit(TRANSPORT.START, this.getTransportInfo());
        }
    }

    async waitForTransportFirstEvent() {
        await new Promise<void>(resolve => {
            const handler = () => {
                this.removeListener(TRANSPORT.START, handler);
                this.removeListener(TRANSPORT.ERROR, handler);
                resolve();
            };
            this.on(TRANSPORT.START, handler);
            this.on(TRANSPORT.ERROR, handler);
        });
    }

    private async _createAndSaveDevice(descriptor: Descriptor) {
        _log.debug('Creating Device', descriptor);
        console.log('_createAndSaveDevice CreateDeviceHandler.handle() waiting');
        await this.handle(descriptor);
        console.log('_createAndSaveDevice CreateDeviceHandler.handle() done');
    }

    private _createUnacquiredDevice(descriptor: Descriptor) {
        _log.debug('Creating Unacquired Device', descriptor);
        const device = Device.createUnacquired(this.transport, descriptor);
        device.once(DEVICE.ACQUIRED, () => {
            // emit connect event once device becomes acquired
            this.emit(DEVICE.CONNECT, device.toMessageObject());
        });
        return device;
    }

    private _createUnreadableDevice(descriptor: Descriptor, unreadableError: string) {
        _log.debug('Creating Unreadable Device', descriptor, unreadableError);
        return Device.createUnacquired(this.transport, descriptor, unreadableError);
    }

    getDevice(path: string) {
        return this.devices[path];
    }

    getFirstDevicePath() {
        return this.asArray()[0].path;
    }

    asArray(): DeviceTyped[] {
        return this.allDevices().map(device => device.toMessageObject());
    }

    allDevices(): Device[] {
        return Object.keys(this.devices).map(key => this.devices[key]);
    }

    length() {
        return this.asArray().length;
    }

    transportType() {
        return this.transport.name;
    }

    getTransportInfo(): TransportInfo {
        return {
            type: this.transportType(),
            version: this.transport.version,
            outdated: this.transport.isOutdated,
        };
    }

    async dispose() {
        this.removeAllListeners();

        // release all devices
        await Promise.all(this.allDevices().map(device => device.dispose()));
        // now we can be relatively sure that release calls have been dispatched
        // and we can safely kill all async subscriptions in transport layer
        this.transport.stop();
    }

    disconnectDevices() {
        this.allDevices().forEach(device => {
            // device.disconnect();
            this.emit(DEVICE.DISCONNECT, device.toMessageObject());
        });
    }

    async enumerate() {
        console.log('deviceList.enumerate');

        const res = await this.transport.enumerate();

        if (!res.success) {
            return;
        }

        res.payload.forEach(d => {
            if (this.devices[d.path]) {
                this.devices[d.path].originalDescriptor = {
                    session: d.session,
                    path: d.path,
                };
                this.devices[d.path].activitySessionID = d.session;
            }
        });
    }

    addAuthPenalty(device: Device) {
        if (!device.isInitialized() || device.isBootloader() || !device.features.device_id) return;
        const deviceID = device.features.device_id;
        const penalty = this.penalizedDevices[deviceID]
            ? this.penalizedDevices[deviceID] + 500
            : 2000;
        this.penalizedDevices[deviceID] = Math.min(penalty, 5000);
    }

    private getAuthPenalty() {
        const { penalizedDevices } = this;
        return Object.keys(penalizedDevices).reduce(
            (penalty, key) => Math.max(penalty, penalizedDevices[key]),
            0,
        );
    }

    removeAuthPenalty(device: Device) {
        if (!device.isInitialized() || device.isBootloader() || !device.features.device_id) return;
        const deviceID = device.features.device_id;
        delete this.penalizedDevices[deviceID];
    }

    // main logic
    private async handle(descriptor: Descriptor) {
        // creatingDevicesDescriptors is needed, so that if *during* creating of Device,
        // other application acquires the device and changes the descriptor,
        // the new unacquired device has correct descriptor
        const path = descriptor.path.toString();
        this.creatingDevicesDescriptors[path] = descriptor;

        try {
            // "regular" device creation
            console.log('this._takeAndCreateDevice()');
            await this._takeAndCreateDevice(descriptor);
            console.log('this._takeAndCreateDevice() done');
        } catch (error) {
            console.log('handle:error:code', error.code);
            console.log('handle:error:message', error.message);

            _log.debug('Cannot create device', error);

            if (
                error.code === 'Device_NotFound' ||
                error.message === TRANSPORT_ERROR.DEVICE_DISCONNECTED_DURING_ACTION ||
                error.message === TRANSPORT_ERROR.DEVICE_DISCONNECTED_WEBUSB ||
                error.message === TRANSPORT_ERROR.UNEXPECTED_ERROR
            ) {
                // do nothing
                // it's a race condition between "device_changed" and "device_disconnected"
            } else if (
                error.message === TRANSPORT_ERROR.WRONG_PREVIOUS_SESSION ||
                error.message === TRANSPORT_ERROR.UNABLE_TO_CLAIM_INTERFACE
            ) {
                this.enumerate();
                this._handleUsedElsewhere(descriptor);
            } else if (error.message?.indexOf(ERRORS.LIBUSB_ERROR_MESSAGE) >= 0) {
                // catch one of trezord LIBUSB_ERRORs
                const device = this._createUnreadableDevice(
                    this.creatingDevicesDescriptors[path],
                    error.message,
                );
                this.devices[path] = device;
                this.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
            } else if (error.code === 'Device_InitializeFailed') {
                // firmware bug - device is in "show address" state which cannot be cancelled
                this._handleUsedElsewhere(descriptor);
            } else if (error.code === 'Device_UsedElsewhere') {
                // most common error - someone else took the device at the same time
                this._handleUsedElsewhere(descriptor);
            } else {
                await resolveAfter(501, null);
                await this.handle(descriptor);
            }
        }
        delete this.creatingDevicesDescriptors[path];
    }

    private async _takeAndCreateDevice(descriptor: Descriptor) {
        const device = Device.fromDescriptor(this.transport, descriptor);
        const path = descriptor.path.toString();

        this.devices[path] = device;
        const promise = device.run();
        await promise;

        this.emit(DEVICE.CONNECT, device.toMessageObject());
    }

    private _handleUsedElsewhere(descriptor: Descriptor) {
        const path = descriptor.path.toString();

        const device = this._createUnacquiredDevice(this.creatingDevicesDescriptors[path]);
        this.devices[path] = device;
        this.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
    }
}
