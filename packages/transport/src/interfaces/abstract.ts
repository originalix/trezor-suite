import { TypedEmitter } from '../types/typed-emitter';
import type { AsyncResultWithTypedError, Success } from '../types';
import { success, error, unknownError } from '../utils/result';
import * as INTERFACE_ERRORS from './errors';
import * as COMMON_ERRORS from '../errors';
import * as TRANSPORT_ERRORS from '../transports/errors';

type TransportInterfaceDevice<DeviceType> = {
    session?: null | string;
    path: string;
    device: DeviceType;
};

/**
 * This class defines shape for native transport interfaces (navigator.usb, etc)
 */
export abstract class TransportAbstractInterface<DeviceType> extends TypedEmitter<{
    'transport-interface-change': TransportInterfaceDevice<DeviceType>[];
    'transport-interface-error':
        | typeof INTERFACE_ERRORS.DEVICE_NOT_FOUND
        | typeof INTERFACE_ERRORS.DEVICE_UNREADABLE;
}> {
    devices: TransportInterfaceDevice<DeviceType>[] = [];

    /**
     * enumerate connected devices
     */
    abstract enumerate(): AsyncResultWithTypedError<string[], string>;

    /**
     * read from device on path
     */
    abstract read(
        path: string,
    ): AsyncResultWithTypedError<
        ArrayBuffer,
        | typeof INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB
        | typeof INTERFACE_ERRORS.UNABLE_TO_OPEN_DEVICE
        | typeof INTERFACE_ERRORS.UNABLE_TO_CLAIM_INTERFACE
        | typeof INTERFACE_ERRORS.DATA_TRANSFER_ERROR
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
    >;

    /**
     * write to device on path
     */
    abstract write(
        path: string,
        buffers: Buffer,
    ): AsyncResultWithTypedError<
        undefined,
        | typeof INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB
        | typeof INTERFACE_ERRORS.UNABLE_TO_OPEN_DEVICE
        | typeof INTERFACE_ERRORS.UNABLE_TO_CLAIM_INTERFACE
        | typeof INTERFACE_ERRORS.DATA_TRANSFER_ERROR
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
    >;

    /**
     * set device to the state when it is available to read/write
     */
    abstract openDevice(
        path: string,
        first: boolean,
    ): AsyncResultWithTypedError<
        undefined,
        | typeof INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB
        | typeof INTERFACE_ERRORS.UNABLE_TO_OPEN_DEVICE
        | typeof INTERFACE_ERRORS.UNABLE_TO_CLAIM_INTERFACE
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
        | typeof TRANSPORT_ERRORS.ABORTED_BY_TIMEOUT
        | typeof TRANSPORT_ERRORS.ABORTED_BY_SIGNAL
    >;

    /**
     * set device to the state when it is available to openDevice again
     */
    abstract closeDevice(
        path: string,
    ): AsyncResultWithTypedError<
        undefined,
        | typeof INTERFACE_ERRORS.DEVICE_DISCONNECTED_WEBUSB
        | typeof INTERFACE_ERRORS.UNABLE_TO_CLOSE_DEVICE
        | typeof COMMON_ERRORS.UNEXPECTED_ERROR
    >;

    protected success<T>(payload: T): Success<T> {
        return success(payload);
    }

    protected error<
        E extends
            | (typeof INTERFACE_ERRORS)[keyof typeof INTERFACE_ERRORS]
            | (typeof COMMON_ERRORS)[keyof typeof COMMON_ERRORS],
    >(payload: { error: E; message?: string }) {
        return error(payload);
    }

    protected unknownError<E extends (typeof INTERFACE_ERRORS)[keyof typeof INTERFACE_ERRORS]>(
        err: Error,
        expectedErrors: E[],
    ) {
        return unknownError(err, expectedErrors);
    }
}
