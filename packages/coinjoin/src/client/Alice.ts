import { getInputSize, getOutputSize } from './clientUtils';
import {
    AllowedScriptTypes,
    RegistrationData,
    ConfirmationData,
    RealCredentials,
} from '../types/coordinator';
import { AccountUtxo } from '../types/account';
import { Credentials } from '../types/middleware';
import { SerializedAlice, CoinjoinRequestEvent } from '../types/round';

interface AlicePendingRequest {
    type: CoinjoinRequestEvent['type'];
    timestamp: number;
}

export class Alice {
    path: string; // utxo derivation path
    outpoint: string;
    amount: number;
    inputSize: number;
    outputSize: number;
    accountKey: string; // Account.accountKey
    scriptType: AllowedScriptTypes; // Account.accountKey
    requested?: AlicePendingRequest; // pending request sent to wallet (Suite)
    ownershipProof?: string; // data used in inputRegistration phase, received as response to RequestEvent, provided by wallet (Suite)
    registrationData?: RegistrationData; // data from inputRegistration phase
    realAmountCredentials?: RealCredentials; // data from inputRegistration phase
    realVsizeCredentials?: RealCredentials; // data from inputRegistration phase
    confirmationData?: ConfirmationData; // data from connectionConfirmation phase
    confirmedAmountCredentials?: Credentials[]; // data from connectionConfirmation phase
    confirmedVsizeCredentials?: Credentials[]; // data from connectionConfirmation phase
    witness?: string; // received as response to RequestEvent, provided by wallet (Suite)
    witnessIndex?: number; // received as response to RequestEvent, provided by wallet (Suite)
    error?: Error;

    constructor(accountKey: string, scriptType: AllowedScriptTypes, utxo: AccountUtxo) {
        this.accountKey = accountKey;
        this.scriptType = scriptType;
        this.path = utxo.path;
        this.outpoint = utxo.outpoint;
        this.amount = utxo.amount;
        this.inputSize = getInputSize(scriptType);
        this.outputSize = getOutputSize(scriptType);
    }

    setRequest(type: AlicePendingRequest['type']): SerializedAlice;
    setRequest(): undefined;
    setRequest(type?: AlicePendingRequest['type']) {
        if (type) {
            this.requested = {
                type,
                timestamp: Date.now(),
            };
            return {
                accountKey: this.accountKey,
                path: this.path,
                outpoint: this.outpoint,
            };
        }
        this.requested = undefined;
    }

    setError(error: Error) {
        this.error = error;
        return this;
    }

    setOwnershipProof(proof: string) {
        this.ownershipProof = proof;
    }

    setRegistrationData(data: RegistrationData) {
        this.registrationData = data;
    }

    setRealCredentials(amount: RealCredentials, vsize: RealCredentials) {
        this.realAmountCredentials = amount;
        this.realVsizeCredentials = vsize;
    }

    setConfirmationData(data: ConfirmationData) {
        this.confirmationData = data;
    }

    setConfirmedCredentials(amount: Credentials[], vsize: Credentials[]) {
        this.confirmedAmountCredentials = amount;
        this.confirmedVsizeCredentials = vsize;
    }

    setWitness(witness: string, index: number) {
        this.witness = witness;
        this.witnessIndex = index;
    }
}