import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
    AccountsStackParamList,
    AccountsStackRoutes,
    stackNavigationOptionsConfig,
} from '@suite-native/navigation';

import { AccountsScreen } from '../screens/AccountsScreen';
import { AccountDetailScreen } from '../screens/AccountDetailScreen';

const AccountsStack = createNativeStackNavigator<AccountsStackParamList>();

export const AccountsStackNavigator = () => (
    <AccountsStack.Navigator
        screenOptions={stackNavigationOptionsConfig}
        initialRouteName={AccountsStackRoutes.Accounts}
    >
        <AccountsStack.Screen
            options={{ title: AccountsStackRoutes.Accounts }}
            name={AccountsStackRoutes.Accounts}
            component={AccountsScreen}
        />
        <AccountsStack.Screen
            options={{ title: AccountsStackRoutes.AccountDetail }}
            name={AccountsStackRoutes.AccountDetail}
            component={AccountDetailScreen}
        />
    </AccountsStack.Navigator>
);
