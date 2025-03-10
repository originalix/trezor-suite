import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { A } from '@mobily/ts-belt';
import { useNavigation } from '@react-navigation/core';

import { networks, NetworkSymbol } from '@suite-common/wallet-config';
import { AccountsRootState, selectAccountsByNetworkAndDevice } from '@suite-common/wallet-core';
import { Button, Divider } from '@suite-native/atoms';
import { useAccountLabelForm, AccountFormValues } from '@suite-native/accounts';
import { Form } from '@suite-native/forms';
import { HIDDEN_DEVICE_STATE } from '@suite-native/module-devices';
import { setOnboardingFinished } from '@suite-native/module-settings';
import {
    AccountsImportStackParamList,
    AccountsImportStackRoutes,
    AppTabsRoutes,
    HomeStackRoutes,
    RootStackParamList,
    RootStackRoutes,
    StackToTabCompositeProps,
} from '@suite-native/navigation';
import { AccountInfo } from '@trezor/connect';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { isEthereumAccountSymbol } from '@suite-native/ethereum-tokens';

import { importAccountThunk } from '../accountsImportThunks';
import { AccountImportOverview } from './AccountImportOverview';
import { AccountImportSummarySection } from './AccountImportSummarySection';
import { AccountImportEthereumTokens } from './AccountImportEthereumTokens';

type AccountImportSummaryFormProps = {
    networkSymbol: NetworkSymbol;
    accountInfo: AccountInfo;
};

// TODO We shouldn't add navigation props to components like this.
// Navigation hook should be typed properly to handle this.
type NavigationProp = StackToTabCompositeProps<
    AccountsImportStackParamList,
    AccountsImportStackRoutes.AccountImportSummary,
    RootStackParamList
>;

const confirmButtonStyle = prepareNativeStyle(utils => ({
    marginBottom: utils.spacings.small,
}));

export const AccountImportSummaryForm = ({
    networkSymbol,
    accountInfo,
}: AccountImportSummaryFormProps) => {
    const dispatch = useDispatch();
    const { applyStyle } = useNativeStyles();
    const navigation = useNavigation<NavigationProp>();

    const deviceNetworkAccounts = useSelector((state: AccountsRootState) =>
        selectAccountsByNetworkAndDevice(state, HIDDEN_DEVICE_STATE, networkSymbol),
    );

    const defaultAccountLabel = `${networks[networkSymbol].name} #${
        deviceNetworkAccounts.length + 1
    }`;

    const form = useAccountLabelForm(defaultAccountLabel);
    const {
        handleSubmit,
        formState: { errors },
    } = form;

    const handleImportAccount = handleSubmit(({ accountLabel }: AccountFormValues) => {
        dispatch(
            importAccountThunk({
                accountInfo,
                accountLabel,
                coin: networkSymbol,
            }),
        );
        dispatch(setOnboardingFinished(true));
        navigation.navigate(RootStackRoutes.AppTabs, {
            screen: AppTabsRoutes.HomeStack,
            params: {
                screen: HomeStackRoutes.Home,
            },
        });
    });

    const shouldDisplayEthereumAccountTokens =
        isEthereumAccountSymbol(networkSymbol) && A.isNotEmpty(accountInfo.tokens ?? []);

    return (
        <AccountImportSummarySection title="Coin synced">
            <Form form={form}>
                <AccountImportOverview
                    balance={accountInfo.availableBalance}
                    networkSymbol={networkSymbol}
                />
                {shouldDisplayEthereumAccountTokens && (
                    <AccountImportEthereumTokens tokens={accountInfo.tokens ?? []} />
                )}
                <Divider marginBottom="small" />
                <Button
                    onPress={handleImportAccount}
                    size="large"
                    style={applyStyle(confirmButtonStyle)}
                    isDisabled={!!errors.accountLabel}
                >
                    Confirm
                </Button>
            </Form>
        </AccountImportSummarySection>
    );
};
