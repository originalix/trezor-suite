import React from 'react';

import { atom, useAtomValue } from 'jotai';

import { Box, Text } from '@suite-native/atoms';
import { FiatAmountFormatter } from '@suite-native/formatters';
import {
    emptyGraphPoint,
    EnhancedGraphPoint,
    GraphDateFormatter,
    percentageDiff,
    PriceChangeIndicator,
} from '@suite-native/graph';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';

// use atomic jotai structure for absolute minimum re-renders and maximum performance
// otherwise graph will be freezing on slower device while point swipe gesture
export const selectedPointAtom = atom<EnhancedGraphPoint>(emptyGraphPoint);

// reference is usually first point, same as Revolut does in their app
export const referencePointAtom = atom<EnhancedGraphPoint>(emptyGraphPoint);

const percentageChangeAtom = atom(get => {
    const selectedPoint = get(selectedPointAtom);
    const referencePoint = get(referencePointAtom);
    return percentageDiff(referencePoint.value, selectedPoint.value);
});

const hasPriceIncreasedAtom = atom(get => {
    const percentageChange = get(percentageChangeAtom);
    return percentageChange >= 0;
});

const headerStyle = prepareNativeStyle(utils => ({
    marginBottom: utils.spacings.small,
}));

const Balance = () => {
    const point = useAtomValue(selectedPointAtom);

    return (
        <FiatAmountFormatter value={String(point.value)} variant="titleLarge" color="textDefault" />
    );
};

export const PortfolioGraphHeader = () => {
    const { applyStyle } = useNativeStyles();
    const { originalDate: firstPointDate } = useAtomValue(referencePointAtom);

    return (
        <Box flexDirection="row" justifyContent="center">
            <Box alignItems="center">
                <Text color="textSubdued" variant="hint" style={applyStyle(headerStyle)}>
                    My portfolio balance
                </Text>
                <Text variant="titleLarge">
                    <Balance />
                </Text>
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
        </Box>
    );
};
