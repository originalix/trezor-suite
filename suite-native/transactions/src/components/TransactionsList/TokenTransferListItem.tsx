import React, { memo } from 'react';

import { EthereumTokenSymbol } from '@suite-native/ethereum-tokens';
import { AccountKey } from '@suite-common/wallet-types';
import { EthereumTokenAmountFormatter, TokenToFiatAmountFormatter } from '@suite-native/formatters';
import { TokenTransfer } from '@trezor/blockchain-link-types';

import { TransactionListItemContainer } from './TransactionListItemContainer';

type TokenTransferListItemProps = {
    txid: string;
    tokenTransfer: TokenTransfer;
    accountKey: AccountKey;
    isFirst?: boolean;
    isLast?: boolean;
};

export const TokenTransferListItem = memo(
    ({ txid, accountKey, tokenTransfer, isFirst, isLast }: TokenTransferListItemProps) => {
        const tokenSymbol = tokenTransfer.symbol.toLowerCase() as EthereumTokenSymbol;

        return (
            <TransactionListItemContainer
                symbol={tokenSymbol}
                transactionType={tokenTransfer.type}
                txid={txid}
                accountKey={accountKey}
                isFirst={isFirst}
                isLast={isLast}
            >
                <TokenToFiatAmountFormatter
                    value={tokenTransfer.amount}
                    ethereumToken={tokenSymbol}
                    decimals={tokenTransfer.decimals}
                />
                <EthereumTokenAmountFormatter
                    value={tokenTransfer.amount}
                    ethereumToken={tokenSymbol}
                    decimals={tokenTransfer.decimals}
                />
            </TransactionListItemContainer>
        );
    },
);
