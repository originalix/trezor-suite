import * as Messages from './messages';
import * as SESSION_ERROR from '../sessions/errors';
import * as INTERFACE_ERROR from '../interfaces/errors';
import * as TRANSPORT_ERROR from '../transports/errors';

export type AnyError =
    | (typeof TRANSPORT_ERROR)[keyof typeof TRANSPORT_ERROR]
    | (typeof TRANSPORT_ERROR)[keyof typeof TRANSPORT_ERROR]
    | (typeof SESSION_ERROR)[keyof typeof SESSION_ERROR]
    | (typeof INTERFACE_ERROR)[keyof typeof INTERFACE_ERROR];

export type MessageFromTrezor = {
    type: keyof Messages.MessageType;
    message: Record<string, unknown>;
};

export type Session = null | string;
export type Descriptor = { path: string; session?: Session };

export interface Success<T> {
    success: true;
    payload: T;
}

export type ErrorGeneric<ErrorType> = ErrorType extends AnyError
    ? {
        success: false;
        // todo: maybe code? for unification with connect?
        error: ErrorType;
    }
    : {
        success: false;
        error: ErrorType;
        message?: string;
    };

export type ResultWithTypedError<T, E> = Success<T> | ErrorGeneric<E>;
export type AsyncResultWithTypedError<T, E> = Promise<Success<T> | ErrorGeneric<E>>;

export interface Logger {
    debug(...args: any): void;
    log(...args: any): void;
    warn(...args: any): void;
    error(...args: any): void;
}
