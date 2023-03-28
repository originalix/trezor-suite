import React from 'react';
import { Image } from 'react-native';

import {
    OnboardingStackParamList,
    OnboardingStackRoutes,
    StackProps,
} from '@suite-native/navigation';
import { Box } from '@suite-native/atoms';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';

import { GetTrezor } from '../components/GetTrezor';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { GetTrezorButton } from '../components/GetTrezorButton';

const imageStyle = prepareNativeStyle(() => ({ width: 245, height: 112 }));

export const ReceiveCoins = ({
    navigation,
}: StackProps<OnboardingStackParamList, OnboardingStackRoutes.ReceiveCoins>) => {
    const { applyStyle } = useNativeStyles();

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
                <Image source={require('../assets/coins.png')} style={applyStyle(imageStyle)} />
                <Image
                    // eslint-disable-next-line global-require
                    source={require('../assets/downloadQr.png')}
                    style={{ width: 104, height: 104 }}
                />
            </Box>
            <GetTrezor>
                <GetTrezorButton redirectTarget={handleRedirect} />
            </GetTrezor>
        </OnboardingScreen>
    );
};
