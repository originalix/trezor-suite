import type { WebUSB, WebUSBDevice } from 'usb';

import { TransportAbstractInterface } from './abstract';
import { AsyncResultWithTypedError } from '../types';
import {
    CONFIGURATION_ID,
    ENDPOINT_ID,
    INTERFACE_ID,
    T1_HID_VENDOR,
    TREZOR_USB_DESCRIPTORS,
} from '../constants';
import { scheduleAction } from '../utils/scheduleAction';

import * as COMMON_ERRORS from '../errors';
import * as INTERFACE_ERRORS from './errors';

export class TransportUsbInterface extends TransportAbstractInterface<WebUSBDevice> {
    usbInterface: WebUSB;

    constructor({ usbInterface }: { usbInterface: WebUSB }) {
        super();

        this.usbInterface = usbInterface;

        if (!this.usbInterface) {
            return;
        }

        this.usbInterface.onconnect = event => {
            // @ts-expect-error
            this.devices = [...this.devices, ...this.createDevices([event.device])];
            this.emit('transport-interface-change', this.devices);
        };

        this.usbInterface.ondisconnect = event => {
            if (event.device.serialNumber) {
                const index = this.devices.findIndex(d => d.path === event.device.serialNumber!);
                if (index > -1) {
                    this.devices.splice(index, 1);
                    this.emit('transport-interface-change', this.devices);
                } else {
                    this.emit('transport-interface-error', INTERFACE_ERRORS.DEVICE_NOT_FOUND);
                    console.error('device that should be removed does not exist in state');
                }
            } else {
                // this should never happen, if it does, it means, that there is something that passes
                // filters (TREZOR_USB_DESCRIPTORS) but does not have serial number. this could indicate error in fw
                this.emit('transport-interface-error', INTERFACE_ERRORS.DEVICE_UNREADABLE);
                console.error('device does not have serial number');
            }
        };
    }

    public async enumerate() {
        try {
            const devices = await this.usbInterface.getDevices();

            const [hidDevices, nonHidDevices] = this.filterDevices(devices);

            if (hidDevices.length) {
                // hidDevices that do not support webusb. these are very very old. we used to emit unreadable
                // device for these but I am not sure if it is still worth the effort.
                console.error('unreadable hid device connected');
            }
            this.devices = this.createDevices(nonHidDevices);

            return this.success(this.devices.map(d => d.path));
        } catch (err) {
            // this shouldn't throw
            return this.unknownError(err, []);
        }
    }

    public async read(
        path: string,
    ): AsyncResultWithTypedError<
        ArrayBuffer,
        | typeof INTERFACE_ERRORS.UNABLE_TO_OPEN_DEVICE
        | typeof INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB
        | typeof INTERFACE_ERRORS.UNABLE_TO_CLAIM_INTERFACE
        | typeof INTERFACE_ERRORS.DATA_TRANSFER_ERROR
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
    > {
        const device = this.findDevice(path);
        if (!device) {
            return this.error({ error: INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB });
        }

        try {
            const res = await device.transferIn(ENDPOINT_ID, 64);

            if (!res.data) {
                return this.error({ error: INTERFACE_ERRORS.DATA_TRANSFER_ERROR });
            }

            if (res.data.byteLength === 0) {
                return this.read(path);
            }

            // todo:  this slicing shouldn't not belong to this layer but to the protocol layer
            return this.success(res.data.buffer.slice(1));
        } catch (err) {
            return this.unknownError(err, [
                INTERFACE_ERRORS.DATA_TRANSFER_ERROR,
                INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB,
            ]);
        }
    }

    public async write(path: string, buffer: Buffer) {
        const device = this.findDevice(path);
        if (!device) {
            return this.error({ error: INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB });
        }

        const newArray = new Uint8Array(64);
        newArray[0] = 63;
        newArray.set(new Uint8Array(buffer), 1);

        try {
            // https://wicg.github.io/webusb/#ref-for-dom-usbdevice-transferout
            const result = await device.transferOut(ENDPOINT_ID, newArray);
            if (result.status !== 'ok') {
                // should not happen, but could be source of troubles so lets observe it
                console.error('transport', 'usbInterface', 'write', 'result.status', result.status);
            }
            return this.success(undefined);
        } catch (err) {
            return this.unknownError(err, [
                INTERFACE_ERRORS.DATA_TRANSFER_ERROR,
                INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB,
            ]);
        }
    }

    public openDevice(path: string, first: boolean) {
        // multiple retries to open device, let me explain why.
        // when another window acquires device,
        return scheduleAction(() => this.openInternal(path, first), {
            attempts: [{ gap: 200 }, { gap: 400 }, { gap: 600 }, { gap: 800 }, { gap: 1000 }],
        });
    }

    public async openInternal(path: string, first: boolean) {
        // todo: this was previously run in a loop with increasing timeout for each iteration. I am not sure it is
        // needed so I removed it for now
        const device = this.findDevice(path);
        if (!device) {
            return this.error({ error: INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB });
        }

        try {
            await device.open();
        } catch (err) {
            return this.error({
                error: INTERFACE_ERRORS.UNABLE_TO_OPEN_DEVICE,
                message: err.message,
            });
        }

        if (first) {
            try {
                await device.selectConfiguration(CONFIGURATION_ID);
                // reset fails on ChromeOS and windows
                await device.reset();
            } catch (err) {}
        }
        try {
            // claim device for exclusive access by this app
            await device.claimInterface(INTERFACE_ID);
        } catch (err) {
            return this.error({
                error: INTERFACE_ERRORS.UNABLE_TO_CLAIM_INTERFACE,
                message: err.message,
            });
        }

        return this.success(undefined);
    }

    public async closeDevice(path: string) {
        const device = this.findDevice(path);
        if (!device) {
            return this.error({ error: INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB });
        }

        try {
            const interfaceId = INTERFACE_ID;
            await device.releaseInterface(interfaceId);
        } catch (err) {
            // ignore
        }

        if (device.opened) {
            try {
                await device.close();
            } catch (err) {
                return this.error({
                    error: INTERFACE_ERRORS.UNABLE_TO_CLOSE_DEVICE,
                    message: err.message,
                });
            }
        }
        return this.success(undefined);
    }

    private findDevice(path: string) {
        const device = this.devices.find(d => d.path === path);
        if (!device) {
            return;
        }
        return device.device;
    }

    private createDevices(nonHidDevices: WebUSBDevice[]) {
        let bootloaderId = 0;

        return nonHidDevices.map(device => {
            // path is just serial number
            // more bootloaders => number them, hope for the best
            const { serialNumber } = device;
            let path = serialNumber == null || serialNumber === '' ? 'bootloader' : serialNumber;
            if (path === 'bootloader') {
                bootloaderId++;
                path += bootloaderId;
            }
            return { path, device };
        });
    }

    private deviceIsHid(device: WebUSBDevice) {
        return device.vendorId === T1_HID_VENDOR;
    }

    private filterDevices(devices: any[]) {
        const trezorDevices = devices.filter(dev => {
            const isTrezor = TREZOR_USB_DESCRIPTORS.some(
                desc => dev.vendorId === desc.vendorId && dev.productId === desc.productId,
            );
            return isTrezor;
        });
        const hidDevices = trezorDevices.filter(dev => this.deviceIsHid(dev));
        const nonHidDevices = trezorDevices.filter(dev => !this.deviceIsHid(dev));
        return [hidDevices, nonHidDevices];
    }
}
