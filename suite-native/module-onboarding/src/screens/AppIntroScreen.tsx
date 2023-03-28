import React from 'react';

import { Box, Stack, Text, Image } from '@suite-native/atoms';
import {
    OnboardingStackParamList,
    OnboardingStackRoutes,
    Screen,
    StackProps,
} from '@suite-native/navigation';
import { Icon } from '@trezor/icons';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';

import { GetTrezor } from '../components/GetTrezor';
import { GetTrezorButton } from '../components/GetTrezorButton';

const titleStyle = prepareNativeStyle(_ => ({
    maxWidth: '80%',
    textAlign: 'center',
}));

export const AppIntroScreen = ({
    navigation,
}: StackProps<OnboardingStackParamList, OnboardingStackRoutes.Welcome>) => {
    const { applyStyle } = useNativeStyles();

    const handleRedirect = () => {
        navigation.navigate(OnboardingStackRoutes.TrackBalances);
    };

    return (
        <Screen>
            <Box justifyContent="space-between">
                <Image
                    // eslint-disable-next-line global-require
                    source={require('../assets/rectangles.png')}
                    width={200}
                    height={200}
                />
                <Stack alignItems="center" justifyContent="center" spacing="extraLarge">
                    <Icon size="large" name="trezor" color="backgroundPrimaryDefault" />
                    <Text variant="titleMedium" style={applyStyle(titleStyle)}>
                        Welcome to Trezor Suite Lite
                    </Text>
                    <Text color="textSubdued">Simple and secure portfolio tracker</Text>
                </Stack>
                <GetTrezor>
                    <GetTrezorButton redirectTarget={handleRedirect} />
                </GetTrezor>
            </Box>
        </Screen>
    );
};
