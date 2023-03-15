import type { Transport } from '../src/transports/abstract';
import { UsbTransport, UsbTransportConstructorParams } from '../src/transports/abstractUsb';
import { TransportUsbInterface } from '../src/interfaces/usb';
import { SessionsClient } from '../src/sessions/client';
import { SessionsBackground } from '../src/sessions/background';
import * as messages from '../messages.json';

// we cant directly use abstract class (UsbTransport)
class TestUsbTransport extends UsbTransport {
    public name = 'WebUsbTransport' as const;

    constructor({ messages, usbInterface, sessionsClient, signal }: UsbTransportConstructorParams) {
        super({
            messages,
            usbInterface,
            sessionsClient,
            signal,
        });
    }
}

// create devices otherwise returned from navigator.usb.getDevices
const createMockedDevice = (optional = {}) => ({
    vendorId: 0x1209,
    productId: 0x53c1,
    serialNumber: '123',
    open: () => Promise.resolve(),
    selectConfiguration: () => Promise.resolve(),
    claimInterface: () => Promise.resolve(),
    transferOut: () => Promise.resolve({ status: 'ok' }),
    transferIn: () => {
        const buffer = Buffer.alloc(64);
        // encoded valid "Success" message
        buffer.write(
            '3f23230002000000060a046d656f7700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            'hex',
        );
        return Promise.resolve({
            data: buffer,
        });
    },
    releaseInterface: () => Promise.resolve(),
    close: () => Promise.resolve(),
    ...optional,
});

// mock of navigator.usb
const createUsbMock = (optional = {}) => ({
    getDevices: () =>
        Promise.resolve([createMockedDevice(), createMockedDevice({ serialNumber: null })]),
    ...optional,
});

describe('Usb', () => {
    beforeEach(async () => {});

    afterEach(() => {});

    afterAll(async () => {});

    describe('without initiated transport', () => {
        it('init error', async () => {
            const sessionsClient = new SessionsClient({
                // @ts-expect-error
                requestFn: _params => ({ type: 'meow' }),
                registerCallbackOnDescriptorsChange: () => {},
            });

            // create usb interface with navigator.usb mock
            const testUsbInterface = new TransportUsbInterface({
                // @ts-expect-error
                usbInterface: createUsbMock(),
            });

            const transport = new TestUsbTransport({
                usbInterface: testUsbInterface,
                sessionsClient,
                messages,
            });

            const res = await transport.init();
            expect(res).toMatchObject({
                success: false,
            });
        });

        it('enumerate error', async () => {
            const sessionsBackground = new SessionsBackground();
            const sessionsClient = new SessionsClient({
                // @ts-expect-error
                requestFn: params => sessionsBackground.handleMessage(params),
                registerCallbackOnDescriptorsChange: () => {},
            });

            // create usb interface with navigator.usb mock
            const testUsbInterface = new TransportUsbInterface({
                // @ts-expect-error
                usbInterface: createUsbMock({
                    getDevices: () => {
                        throw new Error('crazy error nobody expects');
                    },
                }),
            });

            const transport = new TestUsbTransport({
                usbInterface: testUsbInterface,
                sessionsClient,
                messages,
            });

            await transport.init();
            const res = await transport.enumerate();

            expect(res).toEqual({
                success: false,
                error: 'unexpected error',
                message: 'crazy error nobody expects',
            });
        });
    });

    describe('with initiated transport', () => {
        let sessionsBackground: SessionsBackground;
        let sessionsClient: SessionsClient;
        let transport: Transport;
        let testUsbInterface: TransportUsbInterface;
        let abortController: AbortController;

        beforeEach(async () => {
            sessionsBackground = new SessionsBackground();

            sessionsClient = new SessionsClient({
                // @ts-expect-error
                requestFn: params => sessionsBackground.handleMessage(params),
                registerCallbackOnDescriptorsChange: () => {},
            });

            sessionsBackground.on('descriptors', descriptors => {
                sessionsClient.emit('descriptors', descriptors);
            });

            // create usb interface with navigator.usb mock
            testUsbInterface = new TransportUsbInterface({
                // @ts-expect-error
                usbInterface: createUsbMock(),
            });

            abortController = new AbortController();

            transport = new TestUsbTransport({
                usbInterface: testUsbInterface,
                sessionsClient,
                messages,
                signal: abortController.signal,
            });

            await transport.init();
        });

        it('listen twice -> error', async () => {
            const res1 = await transport.listen();
            expect(res1.success).toEqual(true);
            const res2 = await transport.listen();
            expect(res2.success).toEqual(false);
        });

        it('enumerate', async () => {
            const res = await transport.enumerate();
            expect(res).toEqual({
                success: true,
                payload: [
                    {
                        path: '123',
                        session: undefined,
                    },
                    {
                        path: 'bootloader1',
                        session: undefined,
                    },
                ],
            });
        });

        it('acquire. transport is not listening', async () => {
            await transport.enumerate();

            expect(transport.acquire({ input: { path: '123', previous: null } })).resolves.toEqual({
                success: true,
                payload: '1',
            });
        });

        it('acquire. transport listening', async () => {
            jest.useFakeTimers();
            const spy = jest.fn();
            transport.on('transport-update', spy);

            await transport.enumerate();

            transport.listen();

            jest.runAllTimers();

            expect(transport.acquire({ input: { path: '123', previous: null } })).resolves.toEqual({
                success: true,
                payload: '1',
            });

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('call error - called without acquire.', async () => {
            const res = await transport.call({ name: 'GetAddress', data: {}, session: '1' });
            expect(res).toEqual({ success: false, error: 'device disconnected during action' });
        });

        it('call - with valid message.', async () => {
            await transport.enumerate();
            const acquireRes = await transport.acquire({ input: { path: '123', previous: null } });
            expect(acquireRes.success).toEqual(true);
            if (!acquireRes.success) return;

            expect(acquireRes.payload).toEqual('1');

            // doesn't really matter what what message we send
            const res = await transport.call({
                name: 'GetAddress',
                data: {},
                session: acquireRes.payload,
            });
            expect(res).toEqual({
                success: true,
                payload: {
                    type: 'Success',
                    message: {
                        message: 'meow',
                    },
                },
            });
        });

        it('send and receive.', async () => {
            await transport.enumerate();
            const acquireRes = await transport.acquire({ input: { path: '123', previous: null } });
            expect(acquireRes.success).toEqual(true);
            if (!acquireRes.success) return;

            expect(acquireRes.payload).toEqual('1');

            // doesn't really matter what what message we send
            const sendRes = await transport.send({
                name: 'GetAddress',
                data: {},
                session: acquireRes.payload,
            });
            expect(sendRes).toEqual({
                success: true,
                payload: undefined,
            });
            const receiveRes = await transport.receive({
                session: acquireRes.payload,
            });
            expect(receiveRes).toEqual({
                success: true,
                payload: {
                    type: 'Success',
                    message: {
                        message: 'meow',
                    },
                },
            });
        });

        it('release', async () => {
            await transport.enumerate();
            const acquireRes = await transport.acquire({ input: { path: '123', previous: null } });
            expect(acquireRes.success).toEqual(true);
            if (!acquireRes.success) return;

            expect(acquireRes.payload).toEqual('1');

            // doesn't really matter what what message we send
            const res = await transport.release(acquireRes.payload, false);
            expect(res).toEqual({
                success: true,
                payload: undefined,
            });
        });
    });
});
