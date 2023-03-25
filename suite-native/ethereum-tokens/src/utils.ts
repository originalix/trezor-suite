import { NetworkSymbol } from '@suite-common/wallet-config';
import { ethereumTokenIcons, EthereumTokenIconName } from '@trezor/icons';

import { EthereumTokenSymbol } from './types';

export const isEthereumAccountSymbol = (symbol: NetworkSymbol) => symbol === 'eth';

export const getEthereumTokenIconName = (symbol: EthereumTokenSymbol) =>
    (symbol in ethereumTokenIcons ? symbol : 'erc20') as EthereumTokenIconName;

export const convertTokenValueToDecimal = (value: string | number, decimals: number) =>
    Number(value) / 10 ** decimals;
