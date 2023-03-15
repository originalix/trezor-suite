import { AbstractTransport } from './abstract';
import { AbstractUsbTransport } from './abstractUsb';
import { SessionsClient } from '../sessions/client';
import { UsbInterface } from '../interfaces/usb';

import { initBackgroundInBrowser } from '../sessions/background-browser';

type UsbTransportConstructorParams = ConstructorParameters<typeof AbstractTransport>[0];

/**
 * WebUsbTransport
 * - chrome supported
 * - firefox not supported https://mozilla.github.io/standards-positions/#webusb
 */
export class WebUsbTransport extends AbstractUsbTransport {
    public name = 'WebUsbTransport' as const;

    constructor({ messages }: UsbTransportConstructorParams) {
        const { requestFn, registerCallbackOnDescriptorsChange } = initBackgroundInBrowser();

        super({
            messages,
            usbInterface: new UsbInterface({
                // @ts-expect-error mismatch between nodeusb and navigator.usb types
                usbInterface: navigator.usb,
            }),

            // sessions client with a request fn facilitating communication with a session backend (shared worker in case of webusb)
            sessionsClient: new SessionsClient({
                // @ts-expect-error
                requestFn,
                registerCallbackOnDescriptorsChange,
            }),
        });
    }
}
