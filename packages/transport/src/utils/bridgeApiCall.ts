import fetch from 'cross-fetch';

import { success, error, unknownError } from './result';

import * as SESSION_ERRORS from '../sessions/errors';
import * as TRANSPORT_ERRORS from '../transports/errors';
import * as INTERFACE_ERRORS from '../interfaces/errors';

export type HttpRequestOptions = {
    body?: Array<any> | Record<string, unknown> | string;
    url: string;
    method: 'POST' | 'GET';
    skipContentTypeHeader?: boolean;
    signal?: AbortSignal;
};

const _isNode = typeof process !== 'undefined' && typeof window === 'undefined';

function contentType(body: string | unknown) {
    if (typeof body === 'string') {
        if (body === '') {
            return 'text/plain';
        }
        return 'application/octet-stream';
    }
    return 'application/json';
}

function wrapBody(body: unknown) {
    if (typeof body === 'string') {
        return body;
    }
    return JSON.stringify(body);
}

function parseResult(text: string): JSON | string {
    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
}

export async function bridgeApiCall(options: HttpRequestOptions) {
    const fetchOptions = {
        method: options.method,
        body: wrapBody(options.body),
        credentials: 'same-origin' as const,
        headers: {},
        signal: options.signal,
    };

    if (options.skipContentTypeHeader == null || options.skipContentTypeHeader === false) {
        fetchOptions.headers = {
            ...fetchOptions.headers,
            'Content-Type': contentType(options.body == null ? '' : options.body),
        };
    }

    // Node applications must spoof origin for bridge CORS
    if (_isNode) {
        fetchOptions.headers = {
            ...fetchOptions.headers,
            Origin: 'https://node.trezor.io',
        };
    }

    let res: Response;
    try {
        res = await fetch(options.url, fetchOptions);
    } catch (err) {
        return error({ error: TRANSPORT_ERRORS.HTTP_ERROR, message: err.message });
    }

    let resText: string;
    try {
        resText = await res.text();
    } catch (err) {
        return error({ error: TRANSPORT_ERRORS.HTTP_ERROR, message: err.message });
    }

    if (res.ok) {
        return success(parseResult(resText));
    }
    const resJson = parseResult(resText);

    const bridgeErrors = [
        INTERFACE_ERRORS.DEVICE_NOT_FOUND,
        TRANSPORT_ERRORS.HTTP_ERROR,
        TRANSPORT_ERRORS.DEVICE_DISCONNECTED_DURING_ACTION,
        TRANSPORT_ERRORS.DEVICE_CLOSED,
        TRANSPORT_ERRORS.OTHER_CALL_IN_PROGRESS,
        SESSION_ERRORS.SESSION_NOT_FOUND,
        SESSION_ERRORS.WRONG_PREVIOUS_SESSION,
        // todo: list more errors from trezor-d. all can occur on this level!
    ];
    if (typeof resJson !== 'string' && 'error' in resJson) {
        return unknownError(new Error(resJson.error as string), bridgeErrors);
    }
    return unknownError(new Error(resText), bridgeErrors);
}
