import React from 'react';

import { useNavigation } from '@react-navigation/core';

import {
    SettingsStackRoutes,
    SettingsStackParamList,
    StackToStackCompositeNavigationProps,
    RootStackParamList,
    RootStackRoutes,
} from '@suite-native/navigation';
import { isDevelopOrDebugEnv } from '@suite-native/config';

import { SettingsSection } from './SettingsSection';
import { SettingsSectionItem } from './SettingsSectionItem';

export const ApplicationSettings = () => {
    const navigation =
        useNavigation<
            StackToStackCompositeNavigationProps<
                SettingsStackParamList,
                SettingsStackRoutes.Settings,
                RootStackParamList
            >
        >();

    const handleNavigation = (routeName: SettingsStackRoutes): void => {
        navigation.navigate(routeName);
    };

    return (
        <SettingsSection title="Application">
            {isDevelopOrDebugEnv() && (
                <SettingsSectionItem
                    iconName="placeholder"
                    title="DEV utils"
                    subtitle="Only for devs and internal testers."
                    onPress={() => navigation.navigate(RootStackRoutes.DevUtilsStack)}
                />
            )}
            <SettingsSectionItem
                iconName="flag"
                title="Localisation"
                subtitle="Currency, Bitcoin units"
                onPress={() => handleNavigation(SettingsStackRoutes.SettingsLocalisation)}
            />
            <SettingsSectionItem
                title="Customization"
                iconName="palette"
                subtitle="Color scheme"
                onPress={() => handleNavigation(SettingsStackRoutes.SettingsCustomization)}
            />
            <SettingsSectionItem
                title="Privacy & Security"
                iconName="eye"
                subtitle="Analytics, Discreet mode"
                onPress={() => handleNavigation(SettingsStackRoutes.SettingsPrivacyAndSecurity)}
            />
        </SettingsSection>
    );
};
