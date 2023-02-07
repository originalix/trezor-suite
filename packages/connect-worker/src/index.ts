import EventEmitter from 'events';

import TrezorConnect from '@trezor/connect/lib/index';
import { factory } from '@trezor/connect/lib/factory';
import {
    parseConnectSettings,
    CallMethod,
    Manifest,
    ConnectSettings,
    UiResponseEvent,
} from '@trezor/connect/lib/exports';
import { createDeferred, Deferred } from '@trezor/utils';

const eventEmitter = new EventEmitter();

// eslint-disable-next-line no-underscore-dangle
let _settings = parseConnectSettings();

const id = 0;
let requestPromise: Deferred<any> | undefined;

const call: CallMethod = async params => {
    // const params = {
    //     meow_id: 10,
    //     type: 'iframe-call',
    //     payload: {
    //         method,
    //     },
    // };

    // id++;
    console.log('call method id', id, params);

    requestPromise = createDeferred(id);

    // worker.postMessage({
    //     type: 'iframe-call',
    //     id,
    //     payload: {
    //         ...params,
    //     },
    // });

    return requestPromise.promise;
};

const init = async (settings: Partial<ConnectSettings> = {}): Promise<void> => {};

const manifest = (data: Manifest) => {
    _settings = parseConnectSettings({
        ..._settings,
        manifest: data,
    });
};

const uiResponse = (response: UiResponseEvent) => {
    console.log('uiResponse');
    console.log('response', response);
    // if (!worker) {
    //     throw ERRORS.TypedError('Init_NotInitialized');
    // }
    // const { type, payload } = response;
    // self.postMessage({ event: UI_EVENT, type, payload });
};

// const TrezorConnect = factory({
//     eventEmitter,
//     manifest,
//     init,
//     call,
//     // @ts-expect-error
//     requestLogin: () => {},
//     uiResponse,
//     renderWebUSBButton: () => {
//         console.log('renderWebUSBButton');
//     },
//     disableWebUSB: () => {
//         console.log('disableWebUSB');
//     },
//     cancel: () => {},
//     // @ts-expect-error
//     dispose: () => {},
// });

export default TrezorConnect;
export * from '@trezor/connect/lib/exports';
