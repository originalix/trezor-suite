import React from 'react';
import { useSelector } from 'react-redux';

import { atom, useAtomValue } from 'jotai';

import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { Box, Divider, Text } from '@suite-native/atoms';
import { CryptoIcon } from '@trezor/icons';
import { AccountsRootState, selectAccountByKey } from '@suite-common/wallet-core';
import {
    emptyGraphPoint,
    EnhancedGraphPointWithCryptoBalance,
    GraphDateFormatter,
    percentageDiff,
    PriceChangeIndicator,
} from '@suite-native/graph';
import { CryptoAmountFormatter, FiatAmountFormatter } from '@suite-native/formatters';
import { NetworkSymbol } from '@suite-common/wallet-config';

type AccountBalanceProps = {
    accountKey: string;
};

const cryptoIconStyle = prepareNativeStyle(utils => ({
    marginRight: utils.spacings.small / 2,
}));

export const selectedPointAtom = atom<EnhancedGraphPointWithCryptoBalance>(emptyGraphPoint);

// reference is usually first point, same as Revolut does in their app
export const referencePointAtom = atom<EnhancedGraphPointWithCryptoBalance>(emptyGraphPoint);

const percentageChangeAtom = atom(get => {
    const selectedPoint = get(selectedPointAtom);
    const referencePoint = get(referencePointAtom);
    return percentageDiff(referencePoint.value, selectedPoint.value);
});

const hasPriceIncreasedAtom = atom(get => {
    const percentageChange = get(percentageChangeAtom);
    return percentageChange >= 0;
});

const CryptoBalance = ({ accountSymbol }: { accountSymbol: NetworkSymbol }) => {
    const selectedPoint = useAtomValue(selectedPointAtom);

    return <CryptoAmountFormatter value={selectedPoint.cryptoBalance} network={accountSymbol} />;
};

const FiatBalance = ({ accountSymbol }: { accountSymbol: NetworkSymbol }) => {
    const selectedPoint = useAtomValue(selectedPointAtom);

    return (
        <FiatAmountFormatter
            value={String(selectedPoint.value)}
            network={accountSymbol}
            variant="titleLarge"
        />
    );
};

export const AccountDetailGraphHeader = ({ accountKey }: AccountBalanceProps) => {
    const { applyStyle } = useNativeStyles();
    const account = useSelector((state: AccountsRootState) =>
        selectAccountByKey(state, accountKey),
    );
    const { originalDate: firstPointDate } = useAtomValue(referencePointAtom);

    if (!account) return null;

    return (
        <Box>
            <Box marginBottom="large" justifyContent="center" alignItems="center">
                <Box flexDirection="row" alignItems="center" marginBottom="small">
                    <Box style={applyStyle(cryptoIconStyle)}>
                        <CryptoIcon name={account.symbol} />
                    </Box>
                    <CryptoBalance accountSymbol={account.symbol} />
                </Box>
                <Box>
                    <FiatBalance accountSymbol={account.symbol} />
                </Box>
                <Box flexDirection="row" alignItems="center">
                    <Box marginRight="small">
                        <Text variant="hint" color="textSubdued">
                            <GraphDateFormatter
                                firstPointDate={firstPointDate}
                                selectedPointAtom={selectedPointAtom}
                            />
                        </Text>
                    </Box>
                    <PriceChangeIndicator
                        hasPriceIncreasedAtom={hasPriceIncreasedAtom}
                        percentageChangeAtom={percentageChangeAtom}
                    />
                </Box>
            </Box>
            <Box marginBottom="large">
                <Divider />
            </Box>
        </Box>
    );
};
