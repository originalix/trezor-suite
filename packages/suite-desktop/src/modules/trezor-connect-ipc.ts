import { app, ipcMain } from 'electron';
import TrezorConnect, {
    DEVICE_EVENT,
    UI_EVENT,
    TRANSPORT_EVENT,
    BLOCKCHAIN_EVENT,
} from '@trezor/connect';
import type { Module } from './index';

type Call = [keyof typeof TrezorConnect, string, ...any[]];

const SERVICE_NAME = 'trezor-connect-ipc';

const init: Module = ({ mainWindow, store }) => {
    const { logger } = global;
    logger.info(SERVICE_NAME, `Starting service`);

    app.on('before-quit', TrezorConnect.dispose);

    const setProxy = (ifRunning = false) => {
        const tor = store.getTorSettings();
        if (ifRunning && !tor.running) return Promise.resolve();
        const payload = tor.running
            ? {
                  proxy: `socks://${tor.address}`,
                  useOnionLinks: true,
              }
            : { proxy: '', useOnionLinks: false };
        logger.info(SERVICE_NAME, `${tor.running ? 'Enable' : 'Disable'} proxy ${payload.proxy}`);
        return TrezorConnect.setProxy(payload);
    };

    ipcMain.on(
        'trezor-connect-call',
        async ({ reply }: Electron.IpcMainEvent, [method, responseEvent, ...params]: Call) => {
            logger.debug(SERVICE_NAME, `TrezorConnect.${method}`);

            // @ts-expect-error method name union
            const response = await TrezorConnect[method](...params);

            if (method === 'init') {
                await setProxy(true);
            }
            reply(responseEvent, response);
        },
    );

    // It would be much easier to use ipcRenderer.invoke and return a promise directly from TrezorConnect[method]
    // BUT unfortunately ipcRenderer.invoke and ipcRenderer.on event listener works asynchronously and results with race conditions (possible electron bug)
    // instead of cycle of messages: START > progress > progress > progress > RESULT the Renderer process receives: START > progress > progress > RESULT > progress
    // ipcMain.handle('trezor-connect-call', (_event: any, [method, ...params]: Call) => {
    //     logger.info(SERVICE_NAME, `Call ${method}`);
    //     // @ts-ignore method name union
    //     return TrezorConnect[method](...params);
    // });

    return () => {
        // reset previous instance, possible left over after renderer refresh (F5)
        TrezorConnect.dispose();

        // DesktopApi is now too strict :)
        // this channel is not declared in DesktopApi, it will be moved in to @trezor/connect-electron
        const channel: any = 'trezor-connect-event';

        // propagate all events using trezor-connect-event channel
        // listeners references are managed by desktopApi (see ./src/modules/trezor-connect-preload)
        TrezorConnect.on(DEVICE_EVENT, event => {
            logger.debug(SERVICE_NAME, `DEVICE_EVENT ${event.type}`);
            mainWindow.webContents.send(channel, event);
        });

        TrezorConnect.on(UI_EVENT, event => {
            logger.debug(SERVICE_NAME, `UI_EVENT ${event.type}`);
            mainWindow.webContents.send(channel, event);
        });

        TrezorConnect.on(TRANSPORT_EVENT, event => {
            logger.debug(SERVICE_NAME, `TRANSPORT_EVENT ${event.type}`);
            mainWindow.webContents.send(channel, event);
        });

        TrezorConnect.on(BLOCKCHAIN_EVENT, event => {
            logger.debug(SERVICE_NAME, `BLOCKCHAIN_EVENT ${event.type}`);
            mainWindow.webContents.send(channel, event);
        });
    };
};

export default init;