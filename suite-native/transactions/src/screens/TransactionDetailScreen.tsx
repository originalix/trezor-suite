import React from 'react';
import { useSelector } from 'react-redux';
import { Linking } from 'react-native';

import { Button, VStack } from '@suite-native/atoms';
import {
    RootStackParamList,
    RootStackRoutes,
    Screen,
    ScreenHeader,
    StackProps,
} from '@suite-native/navigation';
import {
    BlockchainRootState,
    selectBlockchainExplorerBySymbol,
    selectTransactionByTxidAndAccountKey,
    TransactionsRootState,
} from '@suite-common/wallet-core';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';

import { TransactionDetailHeader } from '../components/TransactionDetail/TransactionDetailHeader';
import { TransactionDetailData } from '../components/TransactionDetail/TransactionDetailData';
import { TransactionDetailSheets } from '../components/TransactionDetail/TransactionDetailSheets';

const buttonStyle = prepareNativeStyle(utils => ({
    marginTop: utils.spacings.large,
}));

export const TransactionDetailScreen = ({
    route,
}: StackProps<RootStackParamList, RootStackRoutes.TransactionDetail>) => {
    const { applyStyle, utils } = useNativeStyles();
    const { txid, accountKey } = route.params;
    const transaction = useSelector((state: TransactionsRootState) =>
        selectTransactionByTxidAndAccountKey(state, txid, accountKey),
    );
    const blockchainExplorer = useSelector((state: BlockchainRootState) =>
        selectBlockchainExplorerBySymbol(state, transaction?.symbol),
    );

    if (!transaction) return null;

    const handleOpenBlockchain = () => {
        if (!blockchainExplorer) return;
        Linking.openURL(`${blockchainExplorer.tx}${transaction.txid}`);
    };

    return (
        <Screen customHorizontalPadding={utils.spacings.small} header={<ScreenHeader />}>
            <VStack spacing="large">
                <TransactionDetailHeader transaction={transaction} />
                <TransactionDetailData transaction={transaction} accountKey={accountKey} />
            </VStack>
            <TransactionDetailSheets transaction={transaction} />
            <Button
                iconLeft="arrowUpRight"
                onPress={handleOpenBlockchain}
                colorScheme="tertiaryElevation0"
                style={applyStyle(buttonStyle)}
            >
                Explore in blockchain
            </Button>
        </Screen>
    );
};
