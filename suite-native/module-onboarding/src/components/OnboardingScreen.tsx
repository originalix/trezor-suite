import React, { ReactNode } from 'react';
import { Dimensions } from 'react-native';

import { Screen } from '@suite-native/navigation';
import { Box } from '@suite-native/atoms';

import { OnboardingScreenHeader } from './OnboardingScreenHeader';

type OnboardingScreenProps = {
    children: ReactNode;
    title: string;
    subtitle?: string;
    activeStep: number;
};

export const OnboardingScreen = ({
    children,
    title,
    subtitle,
    activeStep,
}: OnboardingScreenProps) => (
    <Screen isScrollable={false}>
        <Box style={{ height: Dimensions.get('window').height }}>
            <OnboardingScreenHeader title={title} subtitle={subtitle} activeStep={activeStep} />
            <Box alignItems="center" flex={1} justifyContent="space-around">
                {children}
            </Box>
        </Box>
    </Screen>
);
