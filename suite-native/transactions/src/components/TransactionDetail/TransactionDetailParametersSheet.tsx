import React from 'react';
import { useSelector } from 'react-redux';

import { fromWei } from 'web3-utils';

import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { WalletAccountTransaction } from '@suite-common/wallet-types';
import { Box, Card, IconButton, Text, VStack } from '@suite-native/atoms';
import { Icon } from '@trezor/icons';
import { getConfirmations, getFeeRate, getFeeUnits } from '@suite-common/wallet-utils';
import { BlockchainRootState, selectBlockchainHeightBySymbol } from '@suite-common/wallet-core';
import { useCopyToClipboard } from '@suite-native/helpers';
import { TransactionIdFormatter } from '@suite-native/formatters';
import { networks, NetworkType } from '@suite-common/wallet-config';

import { TransactionDetailSheet } from './TransactionDetailSheet';
import { TransactionDetailRow } from './TransactionDetailRow';

type TransactionDetailParametersSheetProps = {
    isVisible: boolean;
    transaction: WalletAccountTransaction;
    onSheetVisibilityChange: () => void;
};

const transactionIdStyle = prepareNativeStyle(_ => ({
    maxWidth: '72%',
}));

type TransactionParameter =
    | 'feeRate'
    | 'broadcast'
    | 'rbf'
    | 'locktime'
    | 'gasLimit'
    | 'gasPrice'
    | 'gasUsed'
    | 'nonce';

const networkTypeToDisplayedParametersMap: Record<NetworkType, TransactionParameter[]> = {
    bitcoin: ['feeRate', 'broadcast', 'rbf', 'locktime'],
    ethereum: ['gasLimit', 'gasUsed', 'gasPrice', 'nonce', 'broadcast'],
    ripple: ['broadcast'],
    cardano: [],
};

const getEnabledTitle = (enabled: boolean) => (enabled ? 'Enabled' : 'Disabled');

export const TransactionDetailParametersSheet = ({
    isVisible,
    onSheetVisibilityChange,
    transaction,
}: TransactionDetailParametersSheetProps) => {
    const copyToClipboard = useCopyToClipboard();
    const { applyStyle } = useNativeStyles();
    const blockchainHeight = useSelector((state: BlockchainRootState) =>
        selectBlockchainHeightBySymbol(state, transaction.symbol),
    );

    const { networkType } = networks[transaction.symbol];
    const displayedParameters = networkTypeToDisplayedParametersMap[networkType];
    const parametersCardIsDisplayed = displayedParameters.length !== 0;
    const confirmationsCount = getConfirmations(transaction, blockchainHeight);

    const handleClickCopy = () => copyToClipboard(transaction.txid, 'Transaction ID copied');

    return (
        <TransactionDetailSheet
            isVisible={isVisible}
            onVisibilityChange={onSheetVisibilityChange}
            title="Parameters"
            iconName="warningCircle"
            transactionId={transaction.txid}
        >
            <VStack>
                <Card>
                    <TransactionDetailRow title="Transaction ID">
                        <Box
                            flexDirection="row"
                            alignItems="center"
                            paddingLeft="medium"
                            style={applyStyle(transactionIdStyle)}
                        >
                            <TransactionIdFormatter value={transaction.txid} />
                            <Box marginLeft="medium">
                                <IconButton
                                    iconName="copy"
                                    onPress={handleClickCopy}
                                    colorScheme="tertiaryElevation1"
                                    size="medium"
                                />
                            </Box>
                        </Box>
                    </TransactionDetailRow>
                    <TransactionDetailRow title="Confirmations">
                        <Text>{confirmationsCount} </Text>
                        <Box marginLeft="small">
                            <Icon name="confirmation" />
                        </Box>
                    </TransactionDetailRow>
                </Card>

                {parametersCardIsDisplayed && (
                    <Card>
                        {displayedParameters.includes('gasLimit') && (
                            <TransactionDetailRow title="Gas limit">
                                {transaction.ethereumSpecific?.gasLimit}
                            </TransactionDetailRow>
                        )}

                        {displayedParameters.includes('gasUsed') && (
                            <TransactionDetailRow title="Gas used">
                                {transaction.ethereumSpecific?.gasUsed}
                            </TransactionDetailRow>
                        )}
                        {/* TODO: The `feeRate` and `gasPrice` parameters should be handled inside of a fee formatter. */}
                        {/* https://github.com/trezor/trezor-suite/issues/7385 */}
                        {displayedParameters.includes('gasPrice') && (
                            <TransactionDetailRow title="Gas price">
                                {`${fromWei(
                                    transaction.ethereumSpecific?.gasPrice ?? '',
                                    'gwei',
                                )} ${getFeeUnits('ethereum')}`}
                            </TransactionDetailRow>
                        )}
                        {displayedParameters.includes('feeRate') && (
                            <TransactionDetailRow title="Fee rate">
                                {`${getFeeRate(transaction)} ${getFeeUnits(networkType)}`}
                            </TransactionDetailRow>
                        )}
                        {displayedParameters.includes('nonce') && (
                            <TransactionDetailRow title="Nonce">
                                {transaction.ethereumSpecific?.nonce}
                            </TransactionDetailRow>
                        )}
                        {displayedParameters.includes('broadcast') && (
                            <TransactionDetailRow title="Broadcast">
                                {getEnabledTitle(!!transaction.blockHeight)}
                            </TransactionDetailRow>
                        )}
                        {displayedParameters.includes('rbf') && transaction.rbf && (
                            <TransactionDetailRow title="RBF">
                                {getEnabledTitle(!!transaction.rbf)}
                            </TransactionDetailRow>
                        )}
                        {displayedParameters.includes('locktime') && (
                            <TransactionDetailRow title="Locktime">
                                {getEnabledTitle(!!transaction.lockTime)}
                            </TransactionDetailRow>
                        )}
                    </Card>
                )}
            </VStack>
        </TransactionDetailSheet>
    );
};
