import type { AcquireInput } from '../transports/abstract';
import type { Session, Descriptor, ResultWithTypedError, Success } from '../types';
import * as SESSION_ERRORS from './errors';

type BackgroundResponseWithError<T, E> = ResultWithTypedError<T, E> & { id: number };
type BackgroundResponse<T> = Success<T> & { id: number };

export type Sessions = Record<string, Session | undefined>;

export type HandshakeRequest = {};
export type HandshakeResponse = BackgroundResponse<undefined>;

export type EnumerateIntentRequest = {};
export type EnumerateIntentResponse = BackgroundResponse<{
    sessions: Sessions;
}>;

export type EnumerateDoneRequest = {
    paths: string[];
};

export type EnumerateDoneResponse = BackgroundResponse<{
    sessions: Sessions;
    descriptors: Descriptor[];
}>;

export type AcquireIntentRequest = AcquireInput;

export type AcquireIntentResponse = BackgroundResponseWithError<
    undefined,
    typeof SESSION_ERRORS.WRONG_PREVIOUS_SESSION
>;
export interface AcquireDoneRequest {
    path: string;
}

export type AcquireDoneResponse = BackgroundResponse<{
    session: string;
    descriptors: Descriptor[];
}>;
export interface ReleaseIntentRequest {
    session: string;
}

export type ReleaseIntentResponse = BackgroundResponseWithError<
    { path: string },
    typeof SESSION_ERRORS.SESSION_NOT_FOUND
>;

export interface ReleaseDoneRequest {
    path: string;
}

export type ReleaseDoneResponse = BackgroundResponse<{
    descriptors: Descriptor[];
}>;

export type GetSessionsRequest = {};
export type GetSessionsResponse = BackgroundResponse<{
    sessions: Sessions;
}>;
export interface GetPathBySessionRequest {
    session: string;
}

export type GetPathBySessionResponse = BackgroundResponseWithError<
    {
        path: string;
    },
    typeof SESSION_ERRORS.SESSION_NOT_FOUND
>;

export type Params<T> = T & {
    /* caller is used for identification/debugging */
    caller?: string;
    /* id is used for request - response pairing */
    id?: number;
};

export type ClientRequestParams =
    | Params<{ type: 'handshake'; payload: undefined }>
    | Params<{ type: 'enumerateIntent'; payload: undefined }>
    | Params<{ type: 'enumerateDone'; payload: EnumerateDoneRequest }>
    | Params<{ type: 'acquireIntent'; payload: AcquireIntentRequest }>
    | Params<{ type: 'acquireDone'; payload: AcquireDoneRequest }>
    | Params<{ type: 'releaseIntent'; payload: ReleaseIntentRequest }>
    | Params<{ type: 'releaseDone'; payload: ReleaseDoneRequest }>
    | Params<{ type: 'getSessions'; payload: undefined }>
    | Params<{ type: 'getPathBySession'; payload: GetPathBySessionRequest }>;
