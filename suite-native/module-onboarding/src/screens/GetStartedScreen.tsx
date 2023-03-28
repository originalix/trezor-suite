import React from 'react';
import { Image } from 'react-native';

import {
    AccountsImportStackRoutes,
    OnboardingStackParamList,
    OnboardingStackRoutes,
    RootStackParamList,
    RootStackRoutes,
    StackToTabCompositeScreenProps,
} from '@suite-native/navigation';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { Alert } from '@suite-native/atoms';

import { GetTrezor } from '../components/GetTrezor';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { GetTrezorButton } from '../components/GetTrezorButton';

const imageStyle = prepareNativeStyle(() => ({ width: 320, height: 276 }));

type NavigationProps = StackToTabCompositeScreenProps<
    OnboardingStackParamList,
    OnboardingStackRoutes.GetStarted,
    RootStackParamList
>;

export const GetStartedScreen = ({ navigation }: NavigationProps) => {
    const { applyStyle } = useNativeStyles();

    const handleRedirect = () => {
        navigation.navigate(RootStackRoutes.AccountsImport, {
            screen: AccountsImportStackRoutes.SelectNetwork,
        });
    };

    return (
        <OnboardingScreen
            title="Get started"
            subtitle="Click below, sync your coin addresses, and view your portfolio balance."
            activeStep={4}
        >
            <>
                {/* eslint-disable-next-line global-require */}
                <Image source={require('../assets/dashboard.png')} style={applyStyle(imageStyle)} />

                <Alert title="This requires your Trezor hardware wallet and access to the Trezor Suite desktop app." />

                <GetTrezor>
                    <GetTrezorButton redirectTarget={handleRedirect} />
                </GetTrezor>
            </>
        </OnboardingScreen>
    );
};
