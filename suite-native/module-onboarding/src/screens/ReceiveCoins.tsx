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

export const ReceiveCoins = ({
    navigation,
}: StackProps<OnboardingStackParamList, OnboardingStackRoutes.ReceiveCoins>) => {
    const handleRedirect = () => {
        navigation.navigate(OnboardingStackRoutes.AnalyticsConsent);
    };

    return (
        <OnboardingScreen
            title="Receive coins"
            subtitle="Generate addresses and QR codes to receive crypto. For an extra layer of security, use the Trezor Suite desktop app with your Trezor hardware wallet."
            activeStep={2}
        >
            <Box alignItems="center">
                {/* eslint-disable-next-line global-require */}
                <Image source={require('../assets/coins.png')} width={245} height={112} />
                <Image
                    // eslint-disable-next-line global-require
                    source={require('../assets/downloadQr.png')}
                    width={104}
                    height={104}
                />
            </Box>
            <GetTrezor>
                <GetTrezorButton redirectTarget={handleRedirect} />
            </GetTrezor>
        </OnboardingScreen>
    );
};
