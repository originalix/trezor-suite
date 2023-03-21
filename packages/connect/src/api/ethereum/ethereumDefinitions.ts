import fetch from 'cross-fetch';

import { EthereumDefinitions } from '@trezor/transport/lib/types/messages';

// considerations:
// - use request module, just like when downloading firmwares?
// - caching?
// - whitelist of baked ins? for example chain_id 1 will always be there. but this whitelist will change from version to version, not sure if
//   it is worth maintaining
// - offline use in suite desktop? seeing unknown token is probably enough?

/**
 * For given chainId and optionally contractAddress download ethereum definitions for transaction signing.
 * Definitions are only required to display correct information on display. If definitions
 * are not provided UNKNOWN is shown. This means that should this method fail we only log this but don't return error.
 */
export const getEthereumDefinitions = async (chainId: number, contractAddress?: string) => {
    let definitions: EthereumDefinitions = {};

    try {
        const networkDefinition = await fetch(
            `https://data.trezor.io/firmware/eth-definitions/chain-id/${chainId}/network.dat`,
        );

        // other
        if (networkDefinition.status === 200) {
            definitions.encoded_network = await networkDefinition.arrayBuffer();
        } else if (networkDefinition.status !== 404) {
            throw new Error(`unexpected status: $${networkDefinition.status}`);
        }
    } catch (err) {
        console.warn(`unable to download or parse ${chainId} definition. detail: ${err.message}`);
    }

    try {
        if (contractAddress) {
            const tokenDefinition = await fetch(
                `https://data.trezor.io/firmware/eth-definitions/chain-id/${chainId}/token-${contractAddress}.dat`,
            );
            if (tokenDefinition.status === 200) {
                definitions.encoded_token = await tokenDefinition.arrayBuffer();
            } else if (tokenDefinition.status !== 404) {
                throw new Error(`unexpected status: $${tokenDefinition.status}`);
            }
        }
    } catch (err) {
        console.warn(
            `unable to download or parse ${chainId}/${contractAddress} definition. detail: ${err.message}`,
        );
    }

    return definitions;
};
