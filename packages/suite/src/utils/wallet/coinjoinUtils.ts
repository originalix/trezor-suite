import BigNumber from 'bignumber.js';
import { createHash } from 'crypto';
import hoursToMilliseconds from 'date-fns/hoursToMilliseconds';

import { getUtxoOutpoint, getBip43Type } from '@suite-common/wallet-utils';
import { Account, SelectedAccountStatus } from '@suite-common/wallet-types';
import {
    ESTIMATED_MIN_ROUNDS_NEEDED,
    SKIP_ROUNDS_VALUE_WHEN_ENABLED,
} from '@suite/services/coinjoin/config';
import { CoinjoinSessionParameters, RoundPhase, SessionPhase } from '@wallet-types/coinjoin';
import { AnonymitySet } from '@trezor/blockchain-link';
import {
    CoinjoinStatusEvent,
    RegisterAccountParams,
    CoinjoinTransactionData,
} from '@trezor/coinjoin';

export type CoinjoinBalanceBreakdown = {
    notAnonymized: string;
    anonymized: string;
};

/**
 * Breaks down account balance based on anonymity status
 */
export const breakdownCoinjoinBalance = ({
    targetAnonymity,
    anonymitySet,
    utxos,
}: {
    targetAnonymity: number | undefined;
    anonymitySet: AnonymitySet | undefined;
    utxos: Account['utxo'];
}): CoinjoinBalanceBreakdown => {
    const balanceBreakdown = {
        notAnonymized: '0',
        anonymized: '0',
    };

    if (!anonymitySet || targetAnonymity === undefined || !utxos) {
        return balanceBreakdown;
    }

    utxos?.forEach(({ address, amount }) => {
        const bigAmount = new BigNumber(amount);
        const { notAnonymized, anonymized } = balanceBreakdown;

        if ((anonymitySet[address] || 0) < targetAnonymity) {
            const newNotAnonymized = new BigNumber(notAnonymized).plus(bigAmount);

            balanceBreakdown.notAnonymized = newNotAnonymized.toString();
        } else {
            const newAnonymized = new BigNumber(anonymized).plus(bigAmount);

            balanceBreakdown.anonymized = newAnonymized.toString();
        }
    });

    return balanceBreakdown;
};

/**
 * Calculates account anonymity progress – how much UTXOs are anonymized relatively to the target anonymity
 */
export const calculateAnonymityProgress = ({
    targetAnonymity,
    anonymitySet,
    utxos,
}: {
    targetAnonymity: number | undefined;
    anonymitySet: AnonymitySet | undefined;
    utxos: Account['utxo'];
}): number => {
    if (!anonymitySet || targetAnonymity === undefined || !utxos || !utxos.length) {
        return 0;
    }

    if (targetAnonymity === 1) {
        return 100;
    }

    let weightedCurrentAnonymity = new BigNumber(0);
    let weightedTargetAnonymity = new BigNumber(0);

    utxos?.forEach(({ address, amount }) => {
        const bigAmount = new BigNumber(amount);

        const currentAnonymity = anonymitySet[address] || 1;

        weightedCurrentAnonymity = weightedCurrentAnonymity.plus(
            bigAmount.times(Math.min(currentAnonymity, targetAnonymity) - 1),
        );
        weightedTargetAnonymity = weightedTargetAnonymity.plus(
            bigAmount.times(targetAnonymity - 1),
        );
    });

    return weightedCurrentAnonymity
        .div(weightedTargetAnonymity)
        .times(100)
        .integerValue()
        .toNumber();
};

export const transformCoinjoinStatus = ({
    coordinationFeeRate,
    maxMiningFee,
    allowedInputAmounts,
    rounds,
}: CoinjoinStatusEvent) => ({
    coordinationFeeRate,
    maxMiningFee,
    allowedInputAmounts,
    rounds: rounds.map(({ id, phase }) => ({ id, phase })),
});

// convert suite account type to @trezor/coinjoin RegisterAccountParams scriptType
const getCoinjoinAccountScriptType = (path: string) => {
    const bip43 = getBip43Type(path);
    switch (bip43) {
        case 'bip86':
        case 'slip25':
            return 'Taproot';
        case 'bip84':
            return 'P2WPKH';
        default:
            return 'P2WPKH';
    }
};

// use only confirmed utxos, map to @trezor/coinjoin RegisterAccountParams utxos
const getCoinjoinAccountUtxos = (
    utxos: Account['utxo'],
    anonymitySet: AnonymitySet | undefined = {},
) =>
    utxos
        ?.filter(utxo => utxo.confirmations)
        .map(utxo => ({
            path: utxo.path,
            outpoint: getUtxoOutpoint(utxo),
            address: utxo.address,
            amount: Number(utxo.amount),
            anonymityLevel: anonymitySet[utxo.address],
        })) || [];

// select only addresses without tx history
const getCoinjoinAccountAddresses = (addresses: Account['addresses']) =>
    addresses?.change?.filter(a => !a.transfers) || [];

/**
 * Transform from suite Account to @trezor/coinjoin RegisterAccountParams
 */
export const getRegisterAccountParams = (
    account: Account,
    params: CoinjoinSessionParameters,
    rawLiquidityClue: RegisterAccountParams['rawLiquidityClue'],
): RegisterAccountParams => ({
    scriptType: getCoinjoinAccountScriptType(account.path),
    accountKey: account.key,
    targetAnonymity: params.targetAnonymity,
    rawLiquidityClue,
    maxRounds: params.maxRounds,
    skipRounds: params.skipRounds,
    maxFeePerKvbyte: params.maxFeePerKvbyte,
    maxCoordinatorFeeRate: params.maxCoordinatorFeeRate,
    utxos: getCoinjoinAccountUtxos(account.utxo, account.addresses?.anonymitySet),
    changeAddresses: getCoinjoinAccountAddresses(account.addresses),
});

const getSkipRoundsRate = (skipRounds?: [number, number]) =>
    skipRounds ? skipRounds[1] / skipRounds[0] : 1;

// calculate max rounds to allow on device from estimated rounds needed
export const getMaxRounds = (roundsNeeded: number, roundsFailRateBuffer: number) => {
    const estimatedRoundsCount = Math.ceil(roundsNeeded * roundsFailRateBuffer);

    return Math.max(estimatedRoundsCount, ESTIMATED_MIN_ROUNDS_NEEDED);
};

// transform boolean to skip rounds value used by @trezor/coinjoin
export const getSkipRounds = (enabled: boolean) =>
    enabled ? SKIP_ROUNDS_VALUE_WHEN_ENABLED : undefined;

// get time estimate in millisecond per round
export const getEstimatedTimePerRound = (
    roundsDurationInHours: number,
    skipRounds?: [number, number],
) => hoursToMilliseconds(roundsDurationInHours) * getSkipRoundsRate(skipRounds);

export const getSessionDeadline = ({
    currentTimestamp,
    roundDeadline,
    timePerRound,
    roundsLeft,
    roundsNeeded,
}: {
    currentTimestamp: number;
    roundDeadline: number;
    timePerRound: number;
    roundsLeft: number;
    roundsNeeded: number;
}) => {
    const timeLeftTillRoundEnd = Math.max(roundDeadline - currentTimestamp, 0);

    const sessionDeadlineRaw = currentTimestamp + Math.min(roundsNeeded, roundsLeft) * timePerRound;

    return sessionDeadlineRaw + timeLeftTillRoundEnd;
};

/**
 * Transform @trezor/coinjoin CoinjoinRequestEvent.CoinjoinTransactionData to @trezor/connect signTransaction params
 * Params are profiled by account since multiple account can participate in one CoinjoinRound
 */
export const prepareCoinjoinTransaction = (
    account: Account,
    transaction: CoinjoinTransactionData,
) => {
    const inputScriptType = account.accountType === 'normal' ? 'SPENDWITNESS' : 'SPENDTAPROOT';
    const outputScriptType = account.accountType === 'normal' ? 'PAYTOWITNESS' : 'PAYTOTAPROOT';
    const isInternalInput = (input: CoinjoinTransactionData['inputs'][0]) =>
        input.path && account.utxo?.find(u => getUtxoOutpoint(u) === input.outpoint);
    const isInternalOutput = (output: CoinjoinTransactionData['outputs'][0]) =>
        output.path && account.addresses?.change.find(a => a.address === output.address);

    // TODO: early validation of inputs/outputs before it's sent to Trezor to not waste signing count

    const { affiliateRequest } = transaction;

    const tx = {
        inputs: transaction.inputs.map((input, index) => {
            const flags = affiliateRequest.coinjoin_flags_array[index];
            if (isInternalInput(input)) {
                return {
                    script_type: inputScriptType,
                    address_n: input.path!,
                    prev_hash: input.hash,
                    prev_index: input.index,
                    amount: input.amount,
                    coinjoin_flags: flags,
                };
            }

            return {
                address_n: undefined,
                script_type: 'EXTERNAL' as const,
                prev_hash: input.hash,
                prev_index: input.index,
                amount: input.amount,
                script_pubkey: input.scriptPubKey,
                ownership_proof: input.ownershipProof,
                commitment_data: input.commitmentData,
                coinjoin_flags: flags,
            };
        }),
        outputs: transaction.outputs.map(output => {
            if (isInternalOutput(output)) {
                return {
                    address_n: output.path! as any,
                    amount: output.amount,
                    script_type: outputScriptType,
                };
            }
            return {
                address: output.address,
                amount: output.amount,
                script_type: 'PAYTOADDRESS' as const,
            };
        }),
    };

    return {
        ...tx,
        coinjoinRequest: {
            fee_rate: affiliateRequest.fee_rate,
            no_fee_threshold: affiliateRequest.no_fee_threshold,
            min_registrable_amount: affiliateRequest.min_registrable_amount,
            mask_public_key: affiliateRequest.mask_public_key,
            signature: affiliateRequest.signature,
        },
    };
};

export const getIsCoinjoinOutOfSync = (selectedAccount: SelectedAccountStatus) => {
    if (selectedAccount.status !== 'loaded') return true;
    const { account } = selectedAccount;
    if (account.backendType === 'coinjoin') {
        return account.status === 'out-of-sync';
    }
};

const roundPhases = [
    RoundPhase.InputRegistration,
    RoundPhase.ConnectionConfirmation,
    RoundPhase.OutputRegistration,
    RoundPhase.TransactionSigning,
    RoundPhase.Ended,
];

export const getRoundPhaseFromSessionPhase = (sessionPhase: SessionPhase): RoundPhase =>
    roundPhases[Number(String(sessionPhase)[0]) - 1];

export const getFirstSessionPhaseFromRoundPhase = (roundPhase?: RoundPhase): SessionPhase =>
    Number(`${(roundPhase || 0) + 1}1`);

export const getAccountProgressHandle = (account: Pick<Account, 'key'>) =>
    createHash('sha256').update(account.key).digest('hex').slice(0, 16);

export const fixLoadedCoinjoinAccount = ({
    status,
    ...account
}: Extract<Account, { backendType: 'coinjoin' }>): Extract<
    Account,
    { backendType: 'coinjoin' }
> => {
    let statusFixed;

    // If account had been successfully discovered before stored, it should be out-of-sync after loading
    if (status === 'ready') statusFixed = 'out-of-sync' as const;
    // If account was in error state (= never successfully discovered before), we could fall back to initial
    else if (status === 'error') statusFixed = 'initial' as const;
    else statusFixed = status;

    return {
        ...account,
        status: statusFixed,
        syncing: undefined, // If account was syncing when stored, we have to remove the flag
    };
};
