import React from 'react';

import { SettingsLayout } from '@settings-components';
import { SettingsSection } from '@suite-components/Settings';
import { isWeb } from '@suite-utils/env';

import { TranslationMode } from './TranslationMode';
import { GithubIssue } from './GithubIssue';
import { WipeData } from './WipeData';
import { ThrowTestingError } from './ThrowTestingError';
import { InvityApi } from './InvityApi';
import { OAuthApi } from './OAuthApi';
import { CheckFirmwareAuthenticity } from './CheckFirmwareAuthenticity';
import { Metadata } from './Metadata';

export const SettingsDebug = () => (
    <SettingsLayout>
        {isWeb() && (
            <SettingsSection title="Localization">
                <TranslationMode />
            </SettingsSection>
        )}
        <SettingsSection title="Debug">
            <GithubIssue />
            {!isWeb() && <WipeData />}
        </SettingsSection>
        <SettingsSection title="Invity">
            <InvityApi />
        </SettingsSection>
        <SettingsSection title="OAuth">
            <OAuthApi />
        </SettingsSection>
        <SettingsSection title="Firmware">
            <CheckFirmwareAuthenticity />
        </SettingsSection>
        <SettingsSection title="Testing">
            <ThrowTestingError />
        </SettingsSection>
        <SettingsSection title="Labeling viewer">
            <Metadata />
        </SettingsSection>
    </SettingsLayout>
);
