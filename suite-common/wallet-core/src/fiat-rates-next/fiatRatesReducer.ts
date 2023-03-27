import { getUnixTime, subWeeks } from 'date-fns';

import { fetchCurrentFiatRates, fetchLastWeekFiatRates } from '@suite-common/fiat-services';
import { createReducerWithExtraDeps, createThunk } from '@suite-common/redux-utils';
import { NetworkSymbol } from '@suite-common/wallet-config';
import TrezorConnect from '@trezor/connect';
import { FiatCurrencyCode } from '@suite-common/suite-config';

type FiatRateKey = string & { __type: 'FiatRateKey' };
type TokenSymbol = string & { __type: 'TokenSymbol' };
type TokenAddress = string & { __type: 'TokenAddress' };

const MAX_AGE = {
    current: 1000 * 60 * 10, // 10 mins
    lastWeek: 1000 * 60 * 60 * 1, // 1 hour
} satisfies Record<RateType, number>;

export const actionPrefix = '@common/wallet-core/fiat-rates';

const getFiatRateKey = (
    symbol: TokenSymbol | NetworkSymbol,
    fiatCurrency: FiatCurrencyCode,
    tokenAddress?: TokenAddress,
): FiatRateKey => {
    if (tokenAddress) {
        return `${symbol}-${fiatCurrency}-${tokenAddress}` as FiatRateKey;
    }
    return `${symbol}-${fiatCurrency}` as FiatRateKey;
};

const getFiatRateKeyFromTicker = (
    ticker: TickerId,
    fiatCurrency: FiatCurrencyCode,
): FiatRateKey => {
    const { symbol, tokenAddress } = ticker;
    return getFiatRateKey(symbol, fiatCurrency, tokenAddress);
};

export interface TickerId {
    symbol: TokenSymbol | NetworkSymbol;
    mainNetworkSymbol?: NetworkSymbol; // symbol of thee main network. (used for tokens)
    tokenAddress?: TokenAddress;
}

type Timestamp = number & { __type: 'Timestamp' };

type RateType = 'current' | 'lastWeek';

type Rate = {
    rate?: number;

    lastSuccessfulFetchTimestamp: Timestamp;

    isLoading: boolean;
    error: string | null;

    ticker: TickerId;
};

export type FiatRatesState = {
    [key in RateType]: {
        [key: FiatRateKey]: Rate;
    };
};

export const fiatRatesInitialState: FiatRatesState = {
    current: {},
    lastWeek: {},
};

export type FiatRatesRootState = {
    wallet: {
        fiat: FiatRatesState;
    };
};

const selectFiatRatesByFiatRateKey = (
    state: FiatRatesRootState,
    FiatRateKey: FiatRateKey,
    rateType: RateType = 'current',
): Rate | undefined => state.wallet.fiat[rateType]?.[FiatRateKey];

const selectIsFiatRateLoading = (
    state: FiatRatesRootState,
    FiatRateKey: FiatRateKey,
    rateType: RateType = 'current',
) => {
    const currentRate = selectFiatRatesByFiatRateKey(state, FiatRateKey, rateType);
    return currentRate?.isLoading ?? false;
};

const selectShouldUpdateFiatRate = (
    state: FiatRatesRootState,
    FiatRateKey: FiatRateKey,
    rateType: RateType = 'current',
) => {
    const currentRate = selectFiatRatesByFiatRateKey(state, FiatRateKey, rateType);
    if (!currentRate) {
        return true;
    }
    if (selectIsFiatRateLoading(state, FiatRateKey, rateType)) {
        return false;
    }
    const { lastSuccessfulFetchTimestamp } = currentRate;
    const now = Date.now();

    return now - lastSuccessfulFetchTimestamp > MAX_AGE[rateType];
};

const fetchFiatRate = async (
    ticker: TickerId,
    fiatCurrency: FiatCurrencyCode,
): Promise<number | undefined | null> => {
    const { symbol, tokenAddress } = ticker;
    const { success, payload } = await TrezorConnect.blockchainGetCurrentFiatRates({
        coin: symbol,
        token: tokenAddress,
        currencies: [fiatCurrency],
    });
    if (success) {
        // TODO throw and fallback if undefined
        return payload.rates?.[fiatCurrency];
    }
    return fetchCurrentFiatRates(ticker).then(res => res?.rates?.[fiatCurrency]);
};

const fetchLastWeekRate = async (
    ticker: TickerId,
    fiatCurrency: FiatCurrencyCode,
): Promise<number | undefined | null> => {
    const weekAgoTimestamp = getUnixTime(subWeeks(new Date(), 1));
    const timestamps = [weekAgoTimestamp];

    const { success, payload } = await TrezorConnect.blockchainGetFiatRatesForTimestamps({
        coin: ticker.symbol,
        token: ticker.tokenAddress,
        timestamps,
    });

    // TODO throw and fallback if undefined
    if (success) return payload.tickers?.[0]?.rates?.[fiatCurrency];

    return fetchLastWeekFiatRates(ticker, fiatCurrency).then(
        res => res?.tickers?.[0]?.rates?.[fiatCurrency],
    );
};

const fetchFn = {
    current: fetchFiatRate,
    lastWeek: fetchLastWeekRate,
} satisfies Record<RateType, typeof fetchFiatRate>;

type UpdateCurrentFiatRatesThunkPayload = {
    ticker: TickerId;
    fiatCurrency: FiatCurrencyCode;
    rateType?: RateType;
};

export const updateFiatRatesThunk = createThunk(
    `${actionPrefix}/updateFiatRates`,
    async (
        { ticker, fiatCurrency, rateType = 'current' }: UpdateCurrentFiatRatesThunkPayload,
        { getState },
    ) => {
        const FiatRateKey = getFiatRateKeyFromTicker(ticker, fiatCurrency);
        const shouldUpdateCurrentRate = selectShouldUpdateFiatRate(
            getState(),
            FiatRateKey,
            rateType,
        );

        if (!shouldUpdateCurrentRate) {
            return;
        }

        const rate = await fetchFn[rateType](ticker, fiatCurrency);

        if (!rate) {
            throw new Error('Failed to fetch fiat rates');
        }

        return rate;
    },
);

export const fiatRatesReducer = createReducerWithExtraDeps(
    fiatRatesInitialState,
    (builder, extra) => {
        builder
            .addCase(updateFiatRatesThunk.pending, (state, action) => {
                const { ticker, fiatCurrency, rateType = 'current' } = action.meta.arg;
                const FiatRateKey = getFiatRateKeyFromTicker(ticker, fiatCurrency);
                let currentRate = state[rateType]?.[FiatRateKey];

                if (currentRate) {
                    currentRate = {
                        ...currentRate,
                        isLoading: true,
                        error: null,
                    };
                } else {
                    currentRate = {
                        lastSuccessfulFetchTimestamp: 0 as Timestamp,
                        isLoading: true,
                        error: null,
                        ticker,
                    };
                }
            })
            .addCase(updateFiatRatesThunk.fulfilled, (state, action) => {
                if (!action.payload) return;

                const { ticker, fiatCurrency, rateType = 'current' } = action.meta.arg;
                const FiatRateKey = getFiatRateKeyFromTicker(ticker, fiatCurrency);

                const currentRate = state[rateType]?.[FiatRateKey];

                // To prevent race condition someone will remove rate from state while fetching for example (during currency change etc.)
                if (!currentRate) return;

                state[rateType][FiatRateKey] = {
                    ...currentRate,
                    rate: action.payload,
                    lastSuccessfulFetchTimestamp: Date.now() as Timestamp,
                    isLoading: false,
                    error: null,
                };
            })
            .addCase(updateFiatRatesThunk.rejected, (state, action) => {
                const { ticker, fiatCurrency, rateType = 'current' } = action.meta.arg;
                const FiatRateKey = getFiatRateKeyFromTicker(ticker, fiatCurrency);
                const currentRate = state[rateType]?.[FiatRateKey];

                // To prevent race condition someone will remove rate from state while fetching for example (during currency change etc.)
                if (!currentRate) return;

                state[rateType][FiatRateKey] = {
                    ...currentRate,
                    isLoading: false,
                    error: action.error.message ?? `Failed to update ${ticker.symbol} fiat rate.`,
                };
            })
            // TODO: migration for desktop?
            .addCase(extra.actionTypes.storageLoad, extra.reducers.storageLoadFiatRates);
    },
);
