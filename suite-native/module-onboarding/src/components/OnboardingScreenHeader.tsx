import React from 'react';

import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { Box, StepsProgressBar, Text } from '@suite-native/atoms';

type OnboardingScreenHeaderProps = {
    title: string;
    subtitle?: string;
    activeStep: number;
};

const titleStyle = prepareNativeStyle(() => ({
    marginBottom: 12,
}));

export const OnboardingScreenHeader = ({
    title,
    subtitle,
    activeStep,
}: OnboardingScreenHeaderProps) => {
    const { applyStyle } = useNativeStyles();
    return (
        <Box alignItems="center">
            <Box marginBottom="extraLarge">
                <StepsProgressBar numberOfSteps={4} activeStep={activeStep} />
            </Box>
            <Text variant="titleMedium" style={applyStyle(titleStyle)}>
                {title}
            </Text>
            {subtitle && (
                <Text color="textSubdued" style={{ textAlign: 'center' }}>
                    {subtitle}
                </Text>
            )}
        </Box>
    );
};
