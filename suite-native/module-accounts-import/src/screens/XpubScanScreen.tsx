import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { Button, Card, TextDivider, VStack } from '@suite-native/atoms';
import { isDevelopOrDebugEnv } from '@suite-native/config';
import { Form, TextInputField, useForm } from '@suite-native/forms';
import {
    AccountsImportStackParamList,
    AccountsImportStackRoutes,
    Screen,
    StackProps,
} from '@suite-native/navigation';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { yup } from '@trezor/validation';
import { NetworkType, networks } from '@suite-common/wallet-config';

import { XpubImportSection } from '../components/XpubImportSection';
import { AccountImportHeader } from '../components/AccountImportHeader';
import { DevXpub } from '../components/DevXpub';
import { SelectableNetworkItem } from '../components/SelectableNetworkItem';
import { XpubHint } from '../components/XpubHint';

const networkTypeToInputLabelMap: Record<NetworkType, string> = {
    bitcoin: 'Enter public key (XPUB) manually',
    cardano: 'Enter public key (XPUB) manually',
    ethereum: 'Enter receive address manually',
    ripple: 'Enter receive address manually',
};

const cameraStyle = prepareNativeStyle(_ => ({
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 45,
}));

const xpubFormValidationSchema = yup.object({
    xpubAddress: yup.string().required(),
});
type XpubFormValues = yup.InferType<typeof xpubFormValidationSchema>;

export const XpubScanScreen = ({
    navigation,
    route,
}: StackProps<AccountsImportStackParamList, AccountsImportStackRoutes.XpubScan>) => {
    const { applyStyle } = useNativeStyles();
    const [_, setIsCameraRequested] = useState<boolean>(false);

    const form = useForm<XpubFormValues>({
        validation: xpubFormValidationSchema,
    });
    const { handleSubmit, setValue, watch, reset } = form;
    const watchXpubAddress = watch('xpubAddress');
    const { networkSymbol } = route.params;

    const resetToDefaultValues = useCallback(() => {
        setIsCameraRequested(false);
    }, []);

    useFocusEffect(resetToDefaultValues);

    const goToAccountImportScreen = ({ xpubAddress }: XpubFormValues) => {
        navigation.navigate(AccountsImportStackRoutes.AccountImportLoading, {
            xpubAddress,
            networkSymbol,
        });
    };

    const onXpubFormSubmit = handleSubmit(goToAccountImportScreen);

    const handleXpubResult = useCallback(
        (xpubAddress?: string) => {
            if (xpubAddress && xpubAddress !== watchXpubAddress) {
                setValue('xpubAddress', xpubAddress);
                onXpubFormSubmit();
            }
        },
        [watchXpubAddress, onXpubFormSubmit, setValue],
    );

    useEffect(() => {
        if (route?.params?.qrCode) {
            handleXpubResult(route?.params?.qrCode);
        }
    }, [handleXpubResult, route.params]);

    const handleRequestCamera = () => {
        reset({
            xpubAddress: '',
        });
        navigation.navigate(AccountsImportStackRoutes.XpubScanModal, {
            networkSymbol,
        });
    };
    const { networkType, name: networkName } = networks[networkSymbol];
    const inputLabel = networkTypeToInputLabelMap[networkType];

    return (
        <Screen
            header={<AccountImportHeader activeStep={2} />}
            footer={<XpubHint networkType={networkType} />}
        >
            <Card>
                <SelectableNetworkItem
                    cryptoCurrencyName={networkName}
                    cryptoCurrencySymbol={networkSymbol}
                    iconName={networkSymbol}
                    onPressActionButton={() => navigation.goBack()}
                />
            </Card>
            <View style={applyStyle(cameraStyle)}>
                <XpubImportSection
                    onRequestCamera={handleRequestCamera}
                    networkSymbol={networkSymbol}
                />
            </View>
            <TextDivider title="OR" />
            <Form form={form}>
                <VStack spacing="medium">
                    <TextInputField name="xpubAddress" label={inputLabel} />
                    <Button
                        onPress={onXpubFormSubmit}
                        size="large"
                        isDisabled={!watchXpubAddress?.length}
                    >
                        Confirm
                    </Button>
                </VStack>
            </Form>
            {isDevelopOrDebugEnv() && (
                <DevXpub symbol={networkSymbol} onSelect={goToAccountImportScreen} />
            )}
        </Screen>
    );
};
