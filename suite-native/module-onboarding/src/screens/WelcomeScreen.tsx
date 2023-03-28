import React, { ReactNode } from 'react';

import { Box, Stack, Text, Image } from '@suite-native/atoms';
import {
    OnboardingStackParamList,
    OnboardingStackRoutes,
    Screen,
    StackProps,
} from '@suite-native/navigation';
import { Icon } from '@trezor/icons';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { Color } from '@trezor/theme';

import { GetTrezor } from '../components/GetTrezor';
import { GetTrezorButton } from '../components/GetTrezorButton';

const titleStyle = prepareNativeStyle(_ => ({
    maxWidth: '90%',
}));

const TitleText = ({ children, color }: { children: ReactNode; color: Color }) => (
    <Text variant="titleMedium" color={color} style={{ textAlign: 'center' }}>
        {children}
    </Text>
);

export const WelcomeScreen = ({
    navigation,
}: StackProps<OnboardingStackParamList, OnboardingStackRoutes.Welcome>) => {
    const { applyStyle } = useNativeStyles();

    const handleRedirect = () => {
        navigation.navigate(OnboardingStackRoutes.TrackBalances);
    };

    return (
        <>
            <Screen>
                <Box flex={1} justifyContent="flex-end">
                    <Stack alignItems="center" spacing="extraLarge">
                        <Icon size="large" name="trezor" color="backgroundPrimaryDefault" />
                        <Text style={applyStyle(titleStyle)}>
                            <TitleText color="textDefault">Welcome to</TitleText>
                            <TitleText color="textSecondaryHighlight"> Trezor Suite</TitleText>
                            <TitleText color="textSubdued"> Lite</TitleText>
                        </Text>
                        <Text color="textSubdued">Simple and secure portfolio tracker</Text>
                    </Stack>
                    <GetTrezor>
                        <GetTrezorButton redirectTarget={handleRedirect} />
                    </GetTrezor>
                </Box>
            </Screen>
            <Box style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
                <Image
                    // eslint-disable-next-line global-require
                    source={require('../assets/rectangles.png')}
                    width={475}
                    height={475}
                />
            </Box>
        </>
    );
};
