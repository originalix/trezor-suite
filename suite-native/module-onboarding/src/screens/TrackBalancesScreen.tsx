import React from 'react';

import {
    OnboardingStackParamList,
    OnboardingStackRoutes,
    StackProps,
} from '@suite-native/navigation';
import { Box, Image } from '@suite-native/atoms';

import { GetTrezor } from '../components/GetTrezor';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { GetTrezorButton } from '../components/GetTrezorButton';

export const TrackBalancesScreen = ({
    navigation,
}: StackProps<OnboardingStackParamList, OnboardingStackRoutes.TrackBalances>) => {
    const handleRedirect = () => {
        navigation.navigate(OnboardingStackRoutes.ReceiveCoins);
    };

    return (
        <OnboardingScreen
            title="Track balances"
            subtitle="Easily sync your coin addresses and keep up with the crypto on your hardware wallet without exposing your private data."
            activeStep={1}
        >
            <Box justifyContent="space-between">
                {/* eslint-disable-next-line global-require */}
                <Image source={require('../assets/portfolio.png')} width={320} height={276} />
                <GetTrezor>
                    <GetTrezorButton redirectTarget={handleRedirect} />
                </GetTrezor>
            </Box>
        </OnboardingScreen>
    );
};
