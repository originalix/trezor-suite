const REGTEST_URL = 'https://dev-coinjoin.trezor.io/'; // 'https://coinjoin-dev.sldev.cz/'; // 'http://localhost:8081/';
const MIDDLEWARE_URL = 'http://127.0.0.1:37128/';

export const COINJOIN_NETWORKS: Record<string, any> = {
    regtest: {
        network: 'regtest',
        coordinatorName: 'CoinJoinCoordinatorIdentifier',
        coordinatorUrl: `${REGTEST_URL}WabiSabi/`,
        // backend settings
        blockbookUrls: [`${REGTEST_URL}blockbook/api/v2`],
        baseBlockHeight: 0,
        baseBlockHash: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
        // client settings
        middlewareUrl: `${MIDDLEWARE_URL}Cryptography/`,
    },
};
