import React from 'react';
import { Image } from 'react-native';

import {
    OnboardingStackParamList,
    OnboardingStackRoutes,
    StackProps,
} from '@suite-native/navigation';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { Box } from '@suite-native/atoms';

import { GetTrezor } from '../components/GetTrezor';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { GetTrezorButton } from '../components/GetTrezorButton';

const imageStyle = prepareNativeStyle(() => ({ width: 320, height: 276 }));

export const TrackBalancesScreen = ({
    navigation,
}: StackProps<OnboardingStackParamList, OnboardingStackRoutes.TrackBalances>) => {
    const { applyStyle } = useNativeStyles();

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
                <Image source={require('../assets/portfolio.png')} style={applyStyle(imageStyle)} />
                <GetTrezor>
                    <GetTrezorButton redirectTarget={handleRedirect} />
                </GetTrezor>
            </Box>
        </OnboardingScreen>
    );
};
