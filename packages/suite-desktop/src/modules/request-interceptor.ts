/**
 * Request Interceptor
 * This module intercepts requests from electron nodejs main process and
 * lets request-manager interceptor knows if Tor is enable so it has to use Tor or not.
 *
 *
 * Differences from request-filter module is that it intercepts all requests from electron nodejs main process,
 * whereas request-filter logs and filters allowed requests from electron renderer process.
 */
import { createInterceptor, InterceptedEvent } from '@trezor/request-manager';
import { isDevEnv } from '@suite-common/suite-utils';

import { Module } from './index';

export const init: Module = ({ store }) => {
    const { logger } = global;

    const options = {
        handler: (event: InterceptedEvent) => {
            if (event.type === 'INTERCEPTED_REQUEST') {
                logger.debug('request-interceptor', `${event.method} - ${event.details}`);
            }
            if (event.type === 'INTERCEPTED_RESPONSE') {
                logger.debug(
                    'request-interceptor',
                    `request to ${event.host} took ${event.time}ms and responded with status code ${event.statusCode}`,
                );
            }
            if (event.type === 'NETWORK_MISBEHAVING') {
                // TODO: send an event to renderer so it knows there are network issues and can display to user.
            }
        },
        getIsTorEnabled: () => store.getTorSettings().running,
        isDevEnv,
    };

    createInterceptor(options);

    // setInterval(() => {
    //     // TODO: MAYBE instead of returning boolean it could return a string that could be 'NETWORK_SLOW', 'NETWORK_ERRORS' ....
    //     const isNetworkMisbehaving = requestPool.getIsNetworkMisbehaving();
    //     if (isNetworkMisbehaving) {
    //         logger.debug('request-interceptor', 'network is misbehaving');
    //         // TODO: if network is misbehaving we want to let the user know that is the reason it is slow
    //         // TODO: But we know that all is working but just slow.
    //         // TODO:
    //     }
    // }, 5 * 1000);
};
