import http from 'http';
import { getWeakRandomId } from '@trezor/utils';
import { InterceptorOptions } from './types';

export class RequestPool {
    timeConsiderTooMuch = 1000 * 3;
    requestPool: any[] = [];
    isNetworkMisbehaving = false;
    interceptorOptions;

    constructor(interceptorOptions: InterceptorOptions) {
        this.interceptorOptions = interceptorOptions;
    }

    /**
     *
        interceptorOptions.handler({
            type: 'NETWORK_MISBEHAVING',
        });

     */

    addRequest(request: http.ClientRequest) {
        const id = getWeakRandomId(10);
        const { host } = request;
        this.requestPool.push({
            id,
            requestTime: new Date().getTime(),
            host,
        });
        request.on('response', (response: any) => {
            const requestFromPool = this.requestPool.find((req: any) => req.id === id);
            if (requestFromPool) {
                const timeRequestTook = new Date().getTime() - requestFromPool.requestTime;
                const { statusCode } = response;
                this.isNetworkMisbehaving =
                    timeRequestTook > this.timeConsiderTooMuch || statusCode >= 400;
                this.interceptorOptions.handler({
                    type: 'INTERCEPTED_RESPONSE',
                    host: requestFromPool.host,
                    time: timeRequestTook,
                    statusCode,
                });
                // Removing completed request.
                this.requestPool = this.requestPool.filter((req: any) => req.id !== id);
            }
        });
        request.on('end', (_response: any) => {
            console.log('end in interceptor');
            // console.log('end', response);
        });
        request.on('error', (error: any) => {
            console.log('error in interceptor');
            const isProxyConnectionTimedout = error.message.includes('Proxy connection timed out');
            console.log('isProxyConnectionTimedout', isProxyConnectionTimedout);
            const isProxyRejectedConnection = error.message.includes(
                'Socks5 proxy rejected connection',
            );
            console.log('isProxyRejectedConnection', isProxyRejectedConnection);
        });
    }
}
