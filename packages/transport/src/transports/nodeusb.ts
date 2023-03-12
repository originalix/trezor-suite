import { WebUSB } from 'usb';

import { Transport } from './abstract';
import { UsbTransport } from './usb';
import { SessionsClient } from '../sessions/client';
import { SessionsBackground } from '../sessions/background';
import { TransportUsbInterface } from '../interfaces/usb';

// notes:
// to make it work I needed to run `sudo chmod -R 777 /dev/bus/usb/`

export class NodeUsbTransport extends UsbTransport {
    public name = 'NodeUsbTransport' as const;

    constructor({ messages }: ConstructorParameters<typeof Transport>[0]) {
        const sessionsBackground = new SessionsBackground();

        // in nodeusb there is no synchronization yet. this is a followup and needs to be decided
        // so far, sessionsClient has direct access to sessionBackground
        const sessionsClient = new SessionsClient({
            // @ts-expect-error
            requestFn: args => sessionsBackground.handleMessage(args),
            registerCallbackOnDescriptorsChange: () => {},
        });

        sessionsBackground.on('descriptors', descriptors => {
            sessionsClient.emit('descriptors', descriptors);
        });

        super({
            messages,
            usbInterface: new TransportUsbInterface({
                usbInterface: new WebUSB({
                    allowAllDevices: true, // return all devices, not only authorized
                }),
            }),

            sessionsClient,
        });
    }
}
