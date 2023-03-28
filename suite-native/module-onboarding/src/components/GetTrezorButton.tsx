import React from 'react';
import { useDispatch } from 'react-redux';

import { useRoute } from '@react-navigation/native';

import { Button } from '@suite-native/atoms';
import { OnboardingStackRoutes } from '@suite-native/navigation';
import { setIsAppIntroFinished } from '@suite-native/module-settings';

type GetTrezorButtonProps = {
    redirectTarget: () => void;
    isLastStep?: boolean;
};

export const GetTrezorButton = ({ redirectTarget, isLastStep = false }: GetTrezorButtonProps) => {
    const route = useRoute();
    const dispatch = useDispatch();

    const getTrezorTitle = route.name === OnboardingStackRoutes.Welcome ? 'Get started' : 'Next';

    const handlePress = () => {
        redirectTarget();
        if (isLastStep) {
            dispatch(setIsAppIntroFinished(true));
        }
    };

    return <Button onPress={handlePress}>{getTrezorTitle}</Button>;
};
