import { A, G, pipe } from '@mobily/ts-belt';

import {
    AccountsRootState,
    selectAccountByKey,
    selectAccountTransactions,
    TransactionsRootState,
} from '@suite-common/wallet-core';
import { AccountKey, WalletAccountTransaction } from '@suite-common/wallet-types';
import { TokenInfo, TokenTransfer } from '@trezor/blockchain-link';

import { EthereumTokenAccountWithBalance, EthereumTokenSymbol } from './types';
import { isEthereumAccountSymbol } from './utils';

export const filterTokenHasBalance = (token: TokenInfo) => !!token.balance && token.balance !== '0';

export const selectEthereumAccountsTokensWithBalance = (
    state: AccountsRootState,
    ethereumAccountKey: string,
): EthereumTokenAccountWithBalance[] => {
    const account = selectAccountByKey(state, ethereumAccountKey);
    if (!account || !isEthereumAccountSymbol(account.symbol)) return [];
    return A.filter(
        account.tokens ?? [],
        filterTokenHasBalance,
    ) as EthereumTokenAccountWithBalance[];
};

// If account item is ethereum which has tokens with non-zero balance,
// we want to adjust styling to display token items.
export const selectIsEthereumAccountWithTokensWithBalance = (
    state: AccountsRootState,
    ethereumAccountKey: AccountKey,
): boolean => {
    const account = selectAccountByKey(state, ethereumAccountKey);
    return (
        !!account &&
        isEthereumAccountSymbol(account.symbol) &&
        G.isArray(account.tokens) &&
        A.isNotEmpty(account.tokens.filter(filterTokenHasBalance))
    );
};

export const selectEthereumAccountToken = (
    state: AccountsRootState,
    accountKey: AccountKey,
    tokenSymbol?: EthereumTokenSymbol,
): TokenInfo | null => {
    const account = selectAccountByKey(state, accountKey);
    return account?.tokens
        ? (A.find(account?.tokens, (token: TokenInfo) => token.symbol === tokenSymbol) as TokenInfo)
        : null;
};

export const selectEthereumAccountTokenTransactions = (
    state: TransactionsRootState,
    accountKey: AccountKey,
    tokenSymbol: EthereumTokenSymbol,
): WalletAccountTransaction[] =>
    pipe(
        selectAccountTransactions(state, accountKey),
        A.filter(transaction =>
            A.some(
                transaction.tokens,
                (tokenTransfer: TokenTransfer) =>
                    tokenTransfer.symbol.toLowerCase() === tokenSymbol.toLowerCase(),
            ),
        ),
    ) as WalletAccountTransaction[];
