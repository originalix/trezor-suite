import React from 'react';

import { Select, VStack } from '@suite-native/atoms';
import { Screen, ScreenHeader } from '@suite-native/navigation';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';

const screenStyle = prepareNativeStyle(() => ({
    padding: 15,
}));

export const SettingsLocalisationScreen = () => {
    const { applyStyle } = useNativeStyles();
    return (
        <Screen header={<ScreenHeader title="Localisation" />}>
            <VStack style={applyStyle(screenStyle)} spacing={12}>
                <Select items={[]} selectLabel="Language" value={null} onSelectItem={() => {}} />
                <Select items={[]} selectLabel="Currency" value={null} onSelectItem={() => {}} />
            </VStack>
        </Screen>
    );
};