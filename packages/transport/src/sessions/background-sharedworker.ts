/// <reference lib="webworker" />

import { SessionsBackground } from './background';

declare let self: SharedWorkerGlobalScope;

const background = new SessionsBackground();
const ports: MessagePort[] = [];

background.on('descriptors', descriptors => {
    ports.forEach(p => {
        p.postMessage({ type: 'descriptors', payload: descriptors });
    });
});

const handleMessage = async (
    message: Parameters<SessionsBackground['handleMessage']>[0],
    port: MessagePort,
) => {
    const res = await background.handleMessage(message);
    port.postMessage(res);
};

self.onconnect = function (e) {
    const port = e.ports[0];

    ports.push(port);

    port.addEventListener('message', e => {
        handleMessage(e.data, port);
    });

    port.start();
};
