import { exec } from 'child_process';

const checkTCP = () =>
    new Promise(resolve => {
        try {
            exec('lsof -i TCP | grep trezor-su', (error, stdout, stderr) => {
                const outputGroupParser = message =>
                    message && message.trim().match(/trezor-su .*/gm);
                const group = outputGroupParser(stdout);
                if (group) {
                    const groupParsed = group.map(output => {
                        const parsed = output.trim().match(/^trezor-su .* TCP.*->(?<url>[\s\S]* )/);
                        return parsed?.groups?.url ?? '';
                    });
                    // console.log('groupParsed', groupParsed);
                    resolve(groupParsed);
                }
            });
        } catch (error) {
            // console.log('error', error);
        }
    });

setInterval(async () => {
    const tcp = await checkTCP();
    console.log('tcp', tcp);
}, 1000);
