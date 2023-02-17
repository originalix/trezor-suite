import TrezorConnect from '@trezor/connect/lib/index';

self.addEventListener('install', event => {
    console.log('event install', event);
});

self.addEventListener('message', async event => {
    console.log('message event', event);
    console.log('event.data.type', event.data.type);

    if (event.data && event.data.type === 'INIT') {
        console.log('INIT');
        console.log('initialization TrezorConnect');
        try {
            await TrezorConnect.init({
                lazyLoad: true,
                manifest: {
                    email: 'developer@xyz.com',
                    appUrl: 'http://your.application.com',
                },
            });
        } catch (error) {
            console.error('error', error);
        }
    }

    if (event.data && event.data.type === 'get-address') {
        // do something
        console.log('get-address');
        console.log('getting address TrezorConnect');
        try {
            const address = await TrezorConnect.getAddress({
                path: "m/49'/0'/0'/0/2",
                coin: 'btc',
            });
            console.log('address', address);
        } catch (error) {
            console.error('error', error);
        }
    }

    if (event.data && event.data.type === 'get-features') {
        // do something
        console.log('get-features');
        console.log('getting features TrezorConnect');
        try {
            const features = await TrezorConnect.getFeatures();
            console.log('features', features);
        } catch (error) {
            console.error('error', error);
        }
    }

    if (event.data && event.data.type === 'set-pin') {
        TrezorConnect.uiResponse({ type: 'ui-receive_pin', payload: event.data.pin });
    }

    if (event.data && event.data.type === 'set-passphrase') {
        console.log('setting passphrase');
        console.log('event.data.passphrase', event.data.passphrase);
        TrezorConnect.uiResponse({
            type: 'ui-receive_passphrase',
            payload: {
                passphraseOnDevice: false,
                value: event.data.passphrase,
            },
        });
    }

    TrezorConnect.on('UI_EVENT', event => {
        console.log('UI_EVENT', event);

        if (event.type === 'ui-request_pin') {
            // example how to respond to pin request
            console.log('Pin is required!!!!');
        }

        if (event.type === 'ui-request_passphrase') {
            console.log('Passphrase is requested!!!');
        }
    });
});

export default TrezorConnect;
export * from '@trezor/connect/lib/exports';
