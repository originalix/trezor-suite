import commonFixtures from '../../../../submodules/trezor-common/tests/fixtures/ethereum/getaddress.json';

const legacyResults = {
    'Ledger Live legacy path': [
        {
            // 'Forbidden key path between these versions (t1 does not have starting fw, too much effort to find)
            rules: ['2.3.4-2.5.4', '<1.12.2'],
            success: false,
        },
    ],
};

export default {
    method: 'ethereumGetAddress',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    tests: commonFixtures.tests.flatMap(({ parameters: params, result, name }) => ({
        description: params.path,
        params,
        result,
        legacyResults: name ? legacyResults[name] : undefined,
    })),
};
