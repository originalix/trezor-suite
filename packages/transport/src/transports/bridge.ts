import { versionUtils, createTimeoutPromise, createDeferred, Deferred } from '@trezor/utils';

import { bridgeApiCall } from '../utils/bridgeApiCall';
import * as bridgeApiResult from '../utils/bridgeApiResult';
import { scheduleAction } from '../utils/scheduleAction';
import { buildOne } from '../lowlevel/send';
import { receiveOne } from '../lowlevel/receive';
import { Transport, AcquireInput } from './abstract';

import * as TRANSPORT_ERRORS from './errors';
import { ACTION_TIMEOUT } from '../constants';

const DEFAULT_URL = 'http://127.0.0.1:21325';

// todo: this type of error can happen for 'call' and maybe 'acquire'. check onboarding tt recovery test
// I suspect it is an error on bridge
// | typeof TRANSPORT_ERRORS.OTHER_CALL_IN_PROGRESS

type BridgeEndpoint =
    | '/'
    | '/listen'
    | '/acquire'
    | '/post'
    | '/call'
    | '/enumerate'
    | '/release'
    | '/read';

type IncompleteRequestOptions = {
    params?: string;
    body?: any;
    abortable?: boolean;
    timeout?: boolean;
};

type BridgeConstructorParameters = ConstructorParameters<typeof Transport>[0] & {
    // bridge url
    url?: string;
    latestVersion?: string;
};

export class BridgeTransport extends Transport {
    /**
     * information about  the latest version of trezord.
     */
    private latestVersion?: string;
    /**
     * url of trezord server.
     */
    private url: string;

    /**
     * means that /acquire call is in progress. this is used to postpone /listen call so that it can be
     * fired with updated descriptor
     */
    protected acquirePromise?: Deferred<any>;

    public name = 'BridgeTransport' as const;

    constructor({ url = DEFAULT_URL, latestVersion, ...args }: BridgeConstructorParameters) {
        super(args);
        this.url = url;
        this.latestVersion = latestVersion;
    }

    public async init() {
        const response = await this._post('/', {
            abortable: true,
            timeout: true,
        });

        if (!response.success) {
            return response;
        }

        this.version = response.payload.version;

        if (this.latestVersion) {
            this.isOutdated = versionUtils.isNewer(this.latestVersion, this.version);
        }

        return this.success(undefined);
    }

    // https://github.dev/trezor/trezord-go/blob/f559ee5079679aeb5f897c65318d3310f78223ca/core/core.go#L373
    public listen() {
        if (this.listening) {
            return this.error({ error: TRANSPORT_ERRORS.ALREADY_LISTENING });
        }

        this.listening = true;
        this._listen();
        return this.success(undefined);
    }

    private async _listen(): Promise<void> {
        if (this.stopped) {
            return;
        }
        const listenTimestamp = new Date().getTime();

        const response = await this._post('/listen', {
            body: this.descriptors,
            abortable: true,
            timeout: false,
        });

        if (!response.success) {
            // todo: comment
            const time = new Date().getTime() - listenTimestamp;
            if (time > 1100) {
                await createTimeoutPromise(1000);
                return this._listen();
            }
            this.emit('transport-error', response.error);
            return;
        }

        if (this.acquirePromise?.promise) {
            await this.acquirePromise.promise;
        }

        this.handleDescriptorsChange(response.payload);
        return this._listen();
    }

    // https://github.dev/trezor/trezord-go/blob/f559ee5079679aeb5f897c65318d3310f78223ca/core/core.go#L235
    public enumerate() {
        return this._post('/enumerate', {
            abortable: true,
            timeout: true,
        });
    }

    // https://github.dev/trezor/trezord-go/blob/f559ee5079679aeb5f897c65318d3310f78223ca/core/core.go#L420
    public async acquire({ input }: { input: AcquireInput }) {
        const previous = input.previous == null ? 'null' : input.previous;

        // listenPromise is resolved on next listen
        this.listenPromise = createDeferred<string>();
        // acquire promise is resolved after acquire returns
        this.acquirePromise = createDeferred<undefined>();

        const response = await this._post('/acquire', {
            params: `${input.path}/${previous}`,
            abortable: true,
            timeout: true,
        });

        if (this.acquirePromise) {
            this.acquirePromise.resolve(undefined);
        }

        if (!response.success) {
            return response;
        }
        this.acquiringSession = response.payload;
        this.acquiringPath = input.path;

        if (!this.listening) {
            return this.success(this.acquiringSession);
        }

        return this.listenPromise.promise
            .then(sessionIdReturnedFromListen => {
                delete this.listenPromise;
                return this.success(sessionIdReturnedFromListen);
            })
            .catch(err => {
                delete this.listenPromise;
                return this.error({ error: err.message });
            });
    }

    // https://github.dev/trezor/trezord-go/blob/f559ee5079679aeb5f897c65318d3310f78223ca/core/core.go#L354
    public async release(session: string, onclose?: boolean) {
        if (this.listening) {
            this.releasingSession = session;
            this.releasePromise = createDeferred();
        }

        this._post('/release', {
            params: session,
            abortable: false,
            timeout: true,
        });

        if (onclose || !this.listening) {
            // we need release request to reach bridge so that bridge state can update
            // otherwise we would risk 'unacquired device' after reloading application
            await createTimeoutPromise(1);
            return this.success(undefined);
        }

        if (this.releasePromise?.promise) {
            await this.releasePromise.promise;
            delete this.releasePromise;
        }

        return this.success(undefined);
    }

    public releaseDevice() {
        return Promise.resolve(this.success(undefined));
    }

    // https://github.dev/trezor/trezord-go/blob/f559ee5079679aeb5f897c65318d3310f78223ca/core/core.go#L534
    public async call({
        session,
        name,
        data,
    }: {
        session: string;
        name: string;
        data: Record<string, unknown>;
    }) {
        const { messages } = this;
        const o = buildOne(messages, name, data);
        const outData = o.toString('hex');
        const response = await this._post(`/call`, {
            params: session,
            body: outData,
            abortable: true,
            timeout: false,
        });
        if (!response.success) {
            return response;
        }
        const jsonData = receiveOne(this.messages, response.payload);
        return this.success(jsonData);
    }

    public async send({
        session,
        name,
        data,
    }: {
        session: string;
        data: Record<string, unknown>;
        name: string;
    }) {
        const { messages } = this;
        const outData = buildOne(messages, name, data).toString('hex');
        const response = await this._post('/post', {
            params: session,
            body: outData,
            abortable: true,
            timeout: true,
        });
        if (!response.success) {
            return response;
        }
        return this.success(undefined);
    }

    public async receive({ session }: { session: string }) {
        const response = await this._post('/read', {
            params: session,
            abortable: true,
            timeout: true,
        });

        if (!response.success) {
            return response;
        }
        const jsonData = receiveOne(this.messages, response.payload);

        return this.success(jsonData);
    }

    public stop() {
        this.stopped = true;
        this.listening = false;
        this.abortController.abort();
    }

    /**
     * All bridge endpoints use POST methods
     * For documentation, look here: https://github.com/trezor/trezord-go#api-documentation
     */
    private async _post(
        endpoint: '/',
        options: IncompleteRequestOptions,
    ): Promise<ReturnType<(typeof bridgeApiResult)['info']>>;
    private async _post(
        endpoint: '/acquire',
        options: IncompleteRequestOptions,
    ): Promise<ReturnType<(typeof bridgeApiResult)['acquire']>>;
    private async _post(
        endpoint: '/call',
        options: IncompleteRequestOptions,
    ): Promise<ReturnType<(typeof bridgeApiResult)['call']>>;
    private async _post(
        endpoint: '/release',
        options: IncompleteRequestOptions,
    ): Promise<ReturnType<(typeof bridgeApiResult)['empty']>>;
    private async _post(
        endpoint: '/post',
        options: IncompleteRequestOptions,
    ): Promise<ReturnType<(typeof bridgeApiResult)['empty']>>;
    private async _post(
        endpoint: '/read',
        options: IncompleteRequestOptions,
    ): Promise<ReturnType<(typeof bridgeApiResult)['call']>>;
    private async _post(
        endpoint: '/listen',
        options?: IncompleteRequestOptions,
    ): Promise<ReturnType<(typeof bridgeApiResult)['devices']>>;
    private async _post(
        endpoint: '/enumerate',
        options: IncompleteRequestOptions,
    ): Promise<ReturnType<(typeof bridgeApiResult)['devices']>>;
    private async _post(endpoint: BridgeEndpoint, options: IncompleteRequestOptions): Promise<any> {
        const { abortable, timeout, ...restOptions } = options;

        const response = await scheduleAction(
            () =>
                bridgeApiCall({
                    ...restOptions,
                    signal: abortable ? this.abortController.signal : undefined,
                    method: 'POST',
                    url: `${this.url + endpoint}${options?.params ? `/${options.params}` : ''}`,
                    skipContentTypeHeader: true,
                }),
            {
                /**
                 * All requests (except /listen endpoint) to local instance of bridge
                 * don't have right to take long. If so, this is probably some kind of
                 * error with bridge. I have seen this to happen that the first request
                 * to bridge ('/' endpoint) did not respond. This leads to not
                 * emitting transport.start event in time and suite rendering
                 * "loading takes too long" error screen.
                 */
                timeout: timeout ? ACTION_TIMEOUT : undefined,
                signal: abortable ? this.abortController.signal : undefined,
            },
        );

        if (!response.success) {
            return this.error({ error: response.error, message: response.message });
        }

        switch (endpoint) {
            case '/':
                return bridgeApiResult.info(response.payload);
            case '/acquire':
                return bridgeApiResult.acquire(response.payload);
            case '/read':
            case '/call': {
                return bridgeApiResult.call(response.payload);
            }
            case '/enumerate':
            case '/listen':
                return bridgeApiResult.devices(response.payload);
            case '/post':
            case '/release':
                return bridgeApiResult.empty(response.payload);
            default:
            // should never get here
        }
    }
}
