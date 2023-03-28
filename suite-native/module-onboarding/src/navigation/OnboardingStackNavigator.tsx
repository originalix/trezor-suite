import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
    OnboardingStackParamList,
    OnboardingStackRoutes,
    stackNavigationOptionsConfig,
} from '@suite-native/navigation';

import { AppIntroScreen } from '../screens/AppIntroScreen';
import { TrackBalancesScreen } from '../screens/TrackBalancesScreen';
import { ReceiveCoins } from '../screens/ReceiveCoins';
import { AnalyticsConsentScreen } from '../screens/AnalyticsConsentScreen';
import { GetStartedScreen } from '../screens/GetStartedScreen';

export const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingStackNavigator = () => (
    <OnboardingStack.Navigator
        initialRouteName={OnboardingStackRoutes.Welcome}
        screenOptions={stackNavigationOptionsConfig}
    >
        <OnboardingStack.Screen name={OnboardingStackRoutes.Welcome} component={AppIntroScreen} />
        <OnboardingStack.Screen
            name={OnboardingStackRoutes.TrackBalances}
            component={TrackBalancesScreen}
        />
        <OnboardingStack.Screen
            name={OnboardingStackRoutes.ReceiveCoins}
            component={ReceiveCoins}
        />
        <OnboardingStack.Screen
            name={OnboardingStackRoutes.AnalyticsConsent}
            component={AnalyticsConsentScreen}
        />
        <OnboardingStack.Screen
            name={OnboardingStackRoutes.GetStarted}
            component={GetStartedScreen}
        />
    </OnboardingStack.Navigator>
);
