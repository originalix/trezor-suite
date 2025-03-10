import React from 'react';

import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeStackNavigator } from '@suite-native/module-home';
import { AccountsStackNavigator } from '@suite-native/module-accounts';
import { SettingsStackNavigator } from '@suite-native/module-settings';
import { AppTabsParamList, AppTabsRoutes, TabBar } from '@suite-native/navigation';
import { SendReceiveStackNavigator } from '@suite-native/module-send-receive';

import { rootTabsOptions } from './routes';

const Tab = createBottomTabNavigator<AppTabsParamList>();

export const AppTabNavigator = () => (
    <>
        <Tab.Navigator
            initialRouteName={AppTabsRoutes.HomeStack}
            screenOptions={{
                headerShown: false,
                unmountOnBlur: false,
            }}
            tabBar={(props: BottomTabBarProps) => (
                <TabBar tabItemOptions={rootTabsOptions} {...props} />
            )}
        >
            <Tab.Screen name={AppTabsRoutes.HomeStack} component={HomeStackNavigator} />
            <Tab.Screen name={AppTabsRoutes.AccountsStack} component={AccountsStackNavigator} />
            <Tab.Screen
                name={AppTabsRoutes.SendReceiveStack}
                component={SendReceiveStackNavigator}
            />
            <Tab.Screen name={AppTabsRoutes.SettingsStack} component={SettingsStackNavigator} />
        </Tab.Navigator>
    </>
);
