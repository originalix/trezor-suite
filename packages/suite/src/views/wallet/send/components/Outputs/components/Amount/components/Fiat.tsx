import React, { useCallback, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { Controller } from 'react-hook-form';

import { Select } from '@trezor/components';
import { InputError } from '@wallet-components';
import { useSendFormContext } from '@wallet-hooks';
import {
    fromFiatCurrency,
    isDecimalsValid,
    getInputState,
    getFiatRate,
    findToken,
    isLowAnonymityWarning,
    amountToSatoshi,
    formatAmount,
    buildCurrencyOptions,
} from '@suite-common/wallet-utils';
import { CurrencyOption, Output } from '@wallet-types/sendForm';
import { MAX_LENGTH } from '@suite-constants/inputs';
import { useBitcoinAmountUnit } from '@wallet-hooks/useBitcoinAmountUnit';
import { NumberInput, Translation } from '@suite-components';
import { TypedValidationRules } from '@wallet-types/form';

const Wrapper = styled.div`
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
`;

interface Props {
    output: Partial<Output>;
    outputId: number;
}

export const Fiat = ({ output, outputId }: Props) => {
    const {
        account,
        network,
        fiatRates,
        errors,
        clearErrors,
        getDefaultValue,
        control,
        setValue,
        localCurrencyOption,
        composeTransaction,
    } = useSendFormContext();

    const { shouldSendInSats } = useBitcoinAmountUnit(account.symbol);

    const inputName = `outputs[${outputId}].fiat`;
    const currencyInputName = `outputs[${outputId}].currency`;
    const amountInputName = `outputs[${outputId}].amount`;
    const tokenInputName = `outputs[${outputId}].token`;
    const isSetMaxActive = getDefaultValue('setMaxOutputId') === outputId;

    const outputError = errors.outputs ? errors.outputs[outputId] : undefined;
    const error = outputError ? outputError.fiat : undefined;
    const fiatValue = getDefaultValue(inputName, output.fiat || '');
    const tokenValue = getDefaultValue(tokenInputName, output.token);
    const currencyValue =
        getDefaultValue(currencyInputName, output.currency) || localCurrencyOption;
    const token = findToken(account.tokens, tokenValue);

    // relation case:
    // Amount input has an error and Fiat has not (but it should)
    // usually this happens after Fiat > Amount recalculation (from here, onChange event)
    // or as a result on composeTransaction process
    const amountError = outputError ? outputError.amount : undefined;
    const errorToDisplay = !error && fiatValue && amountError ? amountError : error;

    const isLowAnonymity = isLowAnonymityWarning(outputError);
    const inputState = isLowAnonymity ? 'warning' : getInputState(errorToDisplay, fiatValue);
    const bottomText = isLowAnonymity ? null : <InputError error={errorToDisplay} />;

    const handleChange = useCallback(
        (value: string) => {
            if (isSetMaxActive) {
                setValue('setMaxOutputId', undefined);
            }

            if (error) {
                // reset Amount field in case of invalid Fiat value
                if (getDefaultValue(amountInputName, '').length > 0) {
                    setValue(amountInputName, '');
                    clearErrors(amountInputName);
                }

                composeTransaction(amountInputName);

                return;
            }

            // calculate new Amount, Fiat input times currency rate
            // NOTE: get fresh values (currencyValue may be outdated)
            const { value: fiatCurrency } = getDefaultValue(currencyInputName, localCurrencyOption);

            const decimals = token ? token.decimals : network.decimals;

            const amount =
                fiatRates && fiatRates.current && fiatCurrency
                    ? fromFiatCurrency(value, fiatCurrency, fiatRates.current.rates, decimals)
                    : null;

            const formattedAmount = shouldSendInSats
                ? amountToSatoshi(amount || '0', decimals)
                : amount;

            if (formattedAmount) {
                // set Amount value and validate if
                setValue(amountInputName, formattedAmount, {
                    shouldValidate: true,
                });
            }

            composeTransaction(amountInputName);
        },
        [
            amountInputName,
            clearErrors,
            composeTransaction,
            currencyInputName,
            error,
            fiatRates,
            getDefaultValue,
            isSetMaxActive,
            localCurrencyOption,
            network.decimals,
            setValue,
            token,
            shouldSendInSats,
        ],
    );

    const rules = useMemo<TypedValidationRules>(
        () => ({
            required: 'AMOUNT_IS_NOT_SET',
            validate: (value: string) => {
                const amountBig = new BigNumber(value);
                if (amountBig.isNaN()) {
                    return 'AMOUNT_IS_NOT_NUMBER' as const;
                }
                if (amountBig.lt(0)) {
                    return 'AMOUNT_IS_TOO_LOW' as const;
                }
                if (!isDecimalsValid(value, 2)) {
                    return (
                        <Translation
                            key="AMOUNT_IS_NOT_IN_RANGE_DECIMALS"
                            id="AMOUNT_IS_NOT_IN_RANGE_DECIMALS"
                            values={{ decimals: 2 }}
                        />
                    );
                }
            },
        }),
        [],
    );

    interface CallbackParams {
        onChange: (value: CurrencyOption) => void;
        value: any;
    }

    const renderCurrencySelect = useCallback(
        ({ onChange, value }: CallbackParams) => (
            <Select
                options={buildCurrencyOptions(value)}
                value={value}
                isClearable={false}
                isSearchable
                hideTextCursor
                minWidth="58px"
                isClean
                data-test={currencyInputName}
                onChange={(selected: CurrencyOption) => {
                    // propagate changes to FormState
                    onChange(selected);
                    // calculate Amount value
                    const rate = getFiatRate(fiatRates, selected.value);
                    const amountValue = getDefaultValue(amountInputName, '');

                    const formattedAmount = new BigNumber(
                        shouldSendInSats
                            ? formatAmount(amountValue, network.decimals)
                            : amountValue,
                    );

                    if (
                        rate &&
                        formattedAmount &&
                        !formattedAmount.isNaN() &&
                        formattedAmount.gt(0) // formatAmount() returns '-1' on error
                    ) {
                        const fiatValueBigNumber = formattedAmount.multipliedBy(rate);

                        setValue(inputName, fiatValueBigNumber.toFixed(2), {
                            shouldValidate: true,
                        });
                        // call compose to store draft, precomposedTx should be the same
                        composeTransaction(amountInputName);
                    }
                }}
            />
        ),
        [
            currencyInputName,
            fiatRates,
            amountInputName,
            composeTransaction,
            getDefaultValue,
            inputName,
            setValue,
            shouldSendInSats,
            network.decimals,
        ],
    );

    return (
        <Wrapper>
            <NumberInput
                control={control}
                inputState={inputState}
                isMonospace
                onChange={handleChange}
                name={inputName}
                data-test={inputName}
                defaultValue={fiatValue}
                maxLength={MAX_LENGTH.FIAT}
                rules={rules}
                bottomText={bottomText}
                innerAddon={
                    <Controller
                        control={control}
                        name={currencyInputName}
                        defaultValue={currencyValue}
                        render={renderCurrencySelect}
                    />
                }
            />
        </Wrapper>
    );
};
