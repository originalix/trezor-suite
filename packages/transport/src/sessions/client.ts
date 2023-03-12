import { getWeakRandomId } from '@trezor/utils';
import { TypedEmitter } from '../types/typed-emitter';
import { Descriptor, ErrorGeneric } from '../types';
import {
    EnumerateDoneRequest,
    AcquireIntentRequest,
    ReleaseIntentRequest,
    ReleaseDoneRequest,
    AcquireDoneRequest,
    GetPathBySessionRequest,
    HandshakeResponse,
} from './types';
import { SessionsBackground } from './background';
import * as SESSION_ERROR from './errors';

type HandshakeTimeoutResponse = ErrorGeneric<typeof SESSION_ERROR.TIMEOUT>;

type RegisterCallbackOnDescriptorsChange = (callback: (descriptor: Descriptor[]) => any) => void;

/**
 * SessionsClient gives you API for communication with SessionsBackground.
 * You should provide your own communication method in requestFn param (direct module access, sharedworker messages...)
 */
export class SessionsClient extends TypedEmitter<{
    ['descriptors']: Descriptor[];
}> {
    // request method responsible for communication with sessions background.
    private request: SessionsBackground['handleMessage'];

    // used only for debugging - discriminating sessions clients in sessions background log
    private caller = getWeakRandomId(3);
    private id: number;

    constructor({
        requestFn,
        registerCallbackOnDescriptorsChange,
    }: {
        requestFn: SessionsBackground['handleMessage'];
        registerCallbackOnDescriptorsChange?: RegisterCallbackOnDescriptorsChange;
    }) {
        super();
        this.id = 0;
        this.request = params => {
            params.caller = this.caller;
            params.id = this.id;
            this.id++;
            // @ts-expect-error
            return requestFn(params);
        };

        if (registerCallbackOnDescriptorsChange) {
            registerCallbackOnDescriptorsChange(descriptors => {
                this.emit('descriptors', descriptors);
            });
        }
    }

    async handshake() {
        // todo: this Promise.race timeout mechanism could be applied to all methods (useful in case background worker dies during app lifetime)
        const response = await Promise.race<HandshakeResponse | HandshakeTimeoutResponse>([
            this.request({ type: 'handshake', payload: undefined }),
            new Promise(resolve => {
                setTimeout(
                    () =>
                        resolve({
                            success: false,
                            error: SESSION_ERROR.TIMEOUT,
                        }),
                    5000,
                );
            }),
        ]);
        return response;
    }

    enumerateIntent() {
        return this.request({
            type: 'enumerateIntent' as const,
            payload: undefined,
        });
    }
    enumerateDone(payload: EnumerateDoneRequest) {
        return this.request({ type: 'enumerateDone', payload });
    }
    acquireIntent(payload: AcquireIntentRequest) {
        return this.request({ type: 'acquireIntent', payload });
    }
    acquireDone(payload: AcquireDoneRequest) {
        return this.request({ type: 'acquireDone', payload });
    }
    releaseIntent(payload: ReleaseIntentRequest) {
        return this.request({ type: 'releaseIntent', payload });
    }
    releaseDone(payload: ReleaseDoneRequest) {
        return this.request({ type: 'releaseDone', payload });
    }
    getSessions() {
        return this.request({ type: 'getSessions', payload: undefined });
    }
    getPathBySession(payload: GetPathBySessionRequest) {
        return this.request({ type: 'getPathBySession', payload });
    }
}
