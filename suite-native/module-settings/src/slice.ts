import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PROTO } from '@trezor/connect';
import { fiatCurrencies, FiatCurrency, FiatCurrencyCode } from '@suite-common/suite-config';

export interface AppSettingsState {
    isOnboardingFinished: boolean;
    isAppIntroFinished: boolean;
    fiatCurrency: FiatCurrency;
    bitcoinUnits: PROTO.AmountUnit;
}

export type SettingsSliceRootState = {
    appSettings: AppSettingsState;
};

export const appSettingsInitialState: AppSettingsState = {
    fiatCurrency: fiatCurrencies.usd,
    isOnboardingFinished: false,
    bitcoinUnits: PROTO.AmountUnit.BITCOIN,
    isAppIntroFinished: false,
};

export const appSettingsPersistWhitelist: Array<keyof AppSettingsState> = [
    'isOnboardingFinished',
    'isAppIntroFinished',
    'fiatCurrency',
    'bitcoinUnits',
];

export const appSettingsSlice = createSlice({
    name: 'appSettings',
    initialState: appSettingsInitialState,
    reducers: {
        setFiatCurrency: (state, { payload }: PayloadAction<FiatCurrencyCode>) => {
            state.fiatCurrency = fiatCurrencies[payload];
        },
        setIsOnboardingFinished: (state, action: PayloadAction<boolean>) => {
            state.isOnboardingFinished = action.payload;
        },
        setIsAppIntroFinished: (state, action: PayloadAction<boolean>) => {
            state.isOnboardingFinished = action.payload;
        },
        setBitcoinUnits: (state, { payload }: PayloadAction<PROTO.AmountUnit>) => {
            state.bitcoinUnits = payload;
        },
    },
});

export const selectFiatCurrency = (state: SettingsSliceRootState) => state.appSettings.fiatCurrency;
export const selectFiatCurrencyCode = (state: SettingsSliceRootState) =>
    state.appSettings.fiatCurrency.label;
export const selectIsOnboardingFinished = (state: SettingsSliceRootState) =>
    state.appSettings.isOnboardingFinished;
export const selectBitcoinUnits = (state: SettingsSliceRootState) => state.appSettings.bitcoinUnits;
export const selectIsAppIntroFinished = (state: SettingsSliceRootState) =>
    state.appSettings.isAppIntroFinished;

export const { setIsOnboardingFinished, setFiatCurrency, setIsAppIntroFinished, setBitcoinUnits } =
    appSettingsSlice.actions;
export const appSettingsReducer = appSettingsSlice.reducer;
