import React from 'react';

import { Box } from '@suite-native/atoms';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { TransactionType } from '@suite-common/wallet-types';
import {
    CryptoIcon,
    Icon,
    IconName,
    ethereumTokenIcons,
    EthereumTokenIcon,
    EthereumTokenIconName,
} from '@trezor/icons';
import { Color } from '@trezor/theme';
import { EthereumTokenSymbol } from '@suite-native/ethereum-tokens';
import { networks, NetworkSymbol } from '@suite-common/wallet-config';

import { TransactionIconSpinner } from './TransactionIconSpinner';

type TransactionIconProps = {
    symbol: NetworkSymbol | EthereumTokenSymbol;
    transactionType: TransactionType;
    isAnimated?: boolean;
    iconColor?: Color;
    backgroundColor?: Color;
};

const ICON_SIZE = 48;
const COIN_ICON_SIZE = 'extraSmall';

const transactionIconMap: Record<TransactionType, IconName> = {
    recv: 'receive',
    sent: 'send',
    joint: 'placeholder',
    self: 'placeholder',
    failed: 'placeholder',
    unknown: 'placeholder',
};

type TransactionIconStyleProps = {
    backgroundColor: Color;
};

const transactionIconStyle = prepareNativeStyle<TransactionIconStyleProps>(
    (utils, { backgroundColor }) => ({
        width: ICON_SIZE,
        height: ICON_SIZE,
        backgroundColor: utils.colors[backgroundColor],
        borderRadius: utils.borders.radii.round,
        padding: 14.5,
    }),
);

const cryptoIconStyle = prepareNativeStyle<TransactionIconStyleProps>(
    (utils, { backgroundColor }) => ({
        position: 'absolute',
        right: -2,
        bottom: -2,
        padding: 2,
        backgroundColor: utils.colors[backgroundColor],
        borderRadius: utils.borders.radii.round,
    }),
);

const CoinIcon = ({ symbol }: { symbol: NetworkSymbol | EthereumTokenSymbol }) => {
    if (symbol in networks) {
        return <CryptoIcon name={symbol as NetworkSymbol} size={COIN_ICON_SIZE} />;
    }

    return (
        <EthereumTokenIcon
            name={(symbol in ethereumTokenIcons ? symbol : 'erc20') as EthereumTokenIconName}
            size={COIN_ICON_SIZE}
        />
    );
};

export const TransactionIcon = ({
    symbol,
    transactionType,
    isAnimated = false,
    iconColor = 'iconSubdued',
    backgroundColor = 'backgroundSurfaceElevation2',
}: TransactionIconProps) => {
    const { applyStyle } = useNativeStyles();

    return (
        <Box>
            <Box style={applyStyle(transactionIconStyle, { backgroundColor })}>
                <Icon
                    name={transactionIconMap[transactionType]}
                    color={iconColor}
                    size="mediumLarge"
                />
            </Box>
            {isAnimated && <TransactionIconSpinner radius={ICON_SIZE / 2} color={iconColor} />}
            <Box style={applyStyle(cryptoIconStyle, { backgroundColor })}>
                <CoinIcon symbol={symbol} />
            </Box>
        </Box>
    );
};
