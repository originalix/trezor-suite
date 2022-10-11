import fetch from 'node-fetch';

import BaseProcess, { Status } from './BaseProcess';

class CoinjoinProcess extends BaseProcess {
    constructor() {
        super('coinjoin', 'WalletWasabi.WabiSabiClientLibrary', {
            startupCooldown: 3,
        });
    }

    async status(): Promise<Status> {
        // service
        try {
            const resp = await fetch(`http://127.0.0.1:37128/Cryptography/analyze-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json-patch+json',
                },
                body: JSON.stringify({ transactions: [] }),
            });
            this.logger.debug(this.logTopic, `Checking status (${resp.status})`);
            if (resp.status === 200) {
                const data = await resp.json();
                if (data?.version) {
                    return {
                        service: true,
                        process: true,
                    };
                }
            }
        } catch (err) {
            this.logger.debug(this.logTopic, `Status error: ${err.message}`);
        }

        // process
        return {
            service: false,
            process: Boolean(this.process),
        };
    }
}

export default CoinjoinProcess;
