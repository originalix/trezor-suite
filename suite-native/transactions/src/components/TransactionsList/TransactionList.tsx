import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList } from 'react-native';
import { useSelector } from 'react-redux';

import { useNativeStyles, prepareNativeStyle } from '@trezor/styles';
import { AccountKey } from '@suite-common/wallet-types';
import { groupTransactionsByDate, MonthKey } from '@suite-common/wallet-utils';
import { selectIsLoadingTransactions } from '@suite-common/wallet-core';
import { Box, Loader } from '@suite-native/atoms';
import { TAB_BAR_HEIGHT } from '@suite-native/navigation';
import { EthereumTokenSymbol, WalletAccountTransaction } from '@suite-native/ethereum-tokens';

import { TransactionListGroupTitle } from './TransactionListGroupTitle';
import { TransactionListItem } from './TransactionListItem';
import { TokenTransferListItem } from './TokenTransferListItem';
import { TransactionsEmptyState } from '../TransactionsEmptyState';

type AccountTransactionProps = {
    transactions: WalletAccountTransaction[];
    fetchMoreTransactions: (pageToFetch: number, perPage: number) => void;
    listHeaderComponent: JSX.Element;
    accountKey: string;
    tokenSymbol?: EthereumTokenSymbol;
};

type RenderSectionHeaderParams = {
    section: {
        monthKey: MonthKey;
    };
};

type RenderTransactionItemParams = {
    item: WalletAccountTransaction;
    section: { monthKey: MonthKey; data: WalletAccountTransaction[] };
    index: number;
    accountKey: AccountKey;
};

type RenderTokenTranferItemParams = RenderTransactionItemParams & {
    tokenSymbol: EthereumTokenSymbol;
};

const renderTransactionItem = ({
    item,
    section,
    index,
    accountKey,
}: RenderTransactionItemParams) => (
    <TransactionListItem
        key={item.txid}
        transaction={item}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
        accountKey={accountKey}
    />
);

const renderTokenTransferItem = ({
    item,
    section,
    index,
    accountKey,
    tokenSymbol,
}: RenderTokenTranferItemParams) => {
    const tokenTransfers = item.tokens.filter(token => token.symbol === tokenSymbol);

    return (
        <>
            {tokenTransfers.map((tokenTransfer, transferIndex) => (
                <TokenTransferListItem
                    key={tokenTransfer.symbol}
                    tokenTransfer={tokenTransfer}
                    txid={item.txid}
                    accountKey={accountKey}
                    isFirst={index === 0 && transferIndex === 0}
                    isLast={
                        index === section.data.length - 1 &&
                        transferIndex === tokenTransfers.length - 1
                    }
                />
            ))}
        </>
    );
};

const renderSectionHeader = ({ section: { monthKey } }: RenderSectionHeaderParams) => (
    <TransactionListGroupTitle key={monthKey} monthKey={monthKey} />
);

export const TX_PER_PAGE = 25;

// NOTE: This is due to Box wrapper that is set by isScrollable prop in suite-native/module-accounts/src/screens/AccountDetailScreen.tsx
// The box doesn't seem to be stopped visually by tab bar and SectionList cmp cannot be inside ScrollView cmp
// That's why we add padding bottom to avoid style clash.
const listWrapperStyle = prepareNativeStyle(_ => ({
    paddingBottom: TAB_BAR_HEIGHT,
    height: '100%',
}));

export const TransactionList = ({
    transactions,
    listHeaderComponent,
    fetchMoreTransactions,
    accountKey,
    tokenSymbol,
}: AccountTransactionProps) => {
    const { applyStyle } = useNativeStyles();
    const isLoadingTransactions = useSelector(selectIsLoadingTransactions);
    const accountTransactionsByMonth = useMemo(
        () =>
            groupTransactionsByDate(transactions, 'month') as {
                [key: string]: WalletAccountTransaction[];
            },
        [transactions],
    );

    const transactionMonthKeys = useMemo(
        () => Object.keys(accountTransactionsByMonth) as MonthKey[],
        [accountTransactionsByMonth],
    );
    const initialPageNumber = Math.ceil((transactions.length || 1) / TX_PER_PAGE);
    const [page, setPage] = useState(initialPageNumber);

    useEffect(() => {
        // it's okay to hardcode 1 because this is initial fetch and in case transactions are already loaded, nothing will happen anyway
        // because of the check in fetchMoreTransactionsThunk
        fetchMoreTransactions(1, TX_PER_PAGE);
    }, [fetchMoreTransactions]);

    const handleOnEndReached = useCallback(async () => {
        try {
            await fetchMoreTransactions(page + 1, TX_PER_PAGE);
            setPage((currentPage: number) => currentPage + 1);
        } catch (e) {
            // TODO handle error state (show retry button or something
        }
    }, [fetchMoreTransactions, page]);

    const sectionsData = useMemo(
        () =>
            transactionMonthKeys.map(monthKey => ({
                monthKey,
                data: [...accountTransactionsByMonth[monthKey]],
            })),
        [accountTransactionsByMonth, transactionMonthKeys],
    );

    if (isLoadingTransactions) return <Loader />;

    return (
        <Box style={applyStyle(listWrapperStyle)}>
            <SectionList
                sections={sectionsData}
                renderItem={({ item, section, index }) =>
                    tokenSymbol
                        ? renderTokenTransferItem({ item, section, index, accountKey, tokenSymbol })
                        : renderTransactionItem({ item, section, index, accountKey })
                }
                renderSectionHeader={renderSectionHeader}
                ListEmptyComponent={<TransactionsEmptyState accountKey={accountKey} />}
                ListHeaderComponent={listHeaderComponent}
                onEndReached={handleOnEndReached}
                stickySectionHeadersEnabled={false}
            />
        </Box>
    );
};
