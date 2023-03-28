import React from 'react';
import { useDispatch } from 'react-redux';

import {
    OnboardingStackParamList,
    OnboardingStackRoutes,
    StackProps,
} from '@suite-native/navigation';
import { Box, Button, Card, Stack, Text } from '@suite-native/atoms';
import { Icon, IconName } from '@trezor/icons';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { enableAnalyticsThunk } from '@suite-native/analytics';

import { OnboardingScreen } from '../components/OnboardingScreen';

const iconWrapper = prepareNativeStyle(utils => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    backgroundColor: utils.colors.backgroundSurfaceElevation2,
    borderRadius: utils.borders.radii.round,
}));

const rowContentStyle = prepareNativeStyle(_ => ({
    marginLeft: 12,
}));

const InfoRow = ({
    iconName,
    title,
    description,
}: {
    iconName: IconName;
    title: string;
    description: string;
}) => {
    const { applyStyle } = useNativeStyles();
    return (
        <Box flexDirection="row">
            <Box style={applyStyle(iconWrapper)}>
                <Icon name={iconName} />
            </Box>
            <Box style={applyStyle(rowContentStyle)}>
                <Text>{title}</Text>
                <Text style={{ maxWidth: '90%' }} variant="hint" color="textSubdued">
                    {description}
                </Text>
            </Box>
        </Box>
    );
};

const buttonsWrapperStyle = prepareNativeStyle(() => ({
    width: '100%',
}));

export const AnalyticsConsentScreen = ({
    navigation,
}: StackProps<OnboardingStackParamList, OnboardingStackRoutes.AnalyticsConsent>) => {
    const dispatch = useDispatch();
    const { applyStyle } = useNativeStyles();

    const handleRedirect = () => {
        navigation.navigate(OnboardingStackRoutes.GetStarted);
    };

    const handleAnalyticsConsent = () => {
        dispatch(enableAnalyticsThunk());
        handleRedirect();
    };

    return (
        <OnboardingScreen title="User data consent" activeStep={3}>
            <Box alignItems="center" padding="small">
                <Card>
                    <Stack spacing="large">
                        <InfoRow
                            iconName="eyeSlash"
                            title="Data we collect is anonymous"
                            description="We never collect identifying personal data."
                        />
                        <InfoRow
                            iconName="bugBeetle"
                            title="What we collect"
                            description="We gather info on application performance, visitor interaction, and potential technical issues to create a better user experience."
                        />
                        <InfoRow
                            iconName="lock"
                            title="We’re privacy junkies"
                            description="We value privacy and security above all. Learn more about our data and security protocols here."
                        />
                    </Stack>
                </Card>
            </Box>
            <Stack spacing="small" style={applyStyle(buttonsWrapperStyle)}>
                <Button onPress={handleAnalyticsConsent}>Allow anonymous data collection</Button>
                <Button onPress={handleRedirect}>Not now</Button>
            </Stack>
        </OnboardingScreen>
    );
};
