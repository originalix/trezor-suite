import type { MiddlewareAPI } from 'redux';
import { UI, DEVICE } from '@trezor/connect';
import { SessionPhase } from '@trezor/coinjoin/lib/enums';
import { addToast } from '@suite-common/toast-notifications';
import { SUITE, ROUTER, MESSAGE_SYSTEM } from '@suite-actions/constants';
import {
    SESSION_ROUND_CHANGED,
    SET_DEBUG_SETTINGS,
    SESSION_TX_BROADCASTED,
} from '@wallet-actions/constants/coinjoinConstants';
import { COINJOIN, DISCOVERY } from '@wallet-actions/constants';
import * as coinjoinAccountActions from '@wallet-actions/coinjoinAccountActions';
import * as coinjoinClientActions from '@wallet-actions/coinjoinClientActions';
import * as storageActions from '@suite-actions/storageActions';
import { CoinjoinService } from '@suite/services/coinjoin';
import type { AppState, Action, Dispatch } from '@suite-types';
import { CoinjoinConfig, RoundPhase } from '@wallet-types/coinjoin';
import {
    accountsActions,
    blockchainActions,
    selectAccountByKey,
    transactionsActions,
} from '@suite-common/wallet-core';
import {
    selectCoinjoinAccountByKey,
    selectIsAnySessionInCriticalPhase,
    selectIsAccountWithSessionInCriticalPhaseByAccountKey,
    selectIsCoinjoinBlockedByTor,
    selectCoinjoinSessionBlockerByAccountKey,
} from '@wallet-reducers/coinjoinReducer';

import {
    Feature,
    selectFeatureConfig,
    selectIsFeatureDisabled,
} from '@suite-reducers/messageSystemReducer';

export const coinjoinMiddleware =
    (api: MiddlewareAPI<Dispatch, AppState>) =>
    (next: Dispatch) =>
    (action: Action): Action => {
        // cancel discovery for each CoinjoinBackend
        if (action.type === ROUTER.LOCATION_CHANGE && action.payload.app !== 'wallet') {
            CoinjoinService.getInstances().forEach(({ backend }) => backend.cancel());
        }

        // do not close success and critical phase modals when they are open, similar to discovery middleware
        const { modal } = api.getState();
        const allowedModals = ['coinjoin-success', 'more-rounds-needed', 'critical-coinjoin-phase'];

        if (
            action.type === UI.CLOSE_UI_WINDOW &&
            'payload' in modal &&
            allowedModals.includes(modal.payload?.type)
        ) {
            return action;
        }

        if (action.type === SUITE.INIT) {
            api.dispatch(coinjoinAccountActions.logCoinjoinAccounts());
        }

        // propagate action to reducers
        next(action);

        // catch broadcasted transactions and create prepending transaction(s) for each account
        if (action.type === SESSION_TX_BROADCASTED && action.payload.round.broadcastedTxDetails) {
            const {
                accountKeys,
                round: { broadcastedTxDetails },
            } = action.payload;
            accountKeys.forEach(accountKey => {
                api.dispatch(
                    coinjoinAccountActions.createPendingTransaction(
                        accountKey,
                        broadcastedTxDetails,
                    ),
                );
            });
        }

        // catch prepending tx creation and update accountInfo
        if (
            transactionsActions.addTransaction.match(action) &&
            action.payload.account.accountType === 'coinjoin' &&
            action.payload.transactions.some(tx => 'deadline' in tx)
        ) {
            api.dispatch(
                coinjoinAccountActions.updatePendingAccountInfo(action.payload.account.key),
            );
        }

        if (action.type === SUITE.READY) {
            const state = api.getState();
            const isCoinjoinBlockedByTor = selectIsCoinjoinBlockedByTor(state);
            if (!isCoinjoinBlockedByTor) {
                api.dispatch(coinjoinAccountActions.restoreCoinjoinAccounts());
            }
        }

        if (accountsActions.removeAccount.match(action)) {
            api.dispatch(coinjoinAccountActions.forgetCoinjoinAccounts(action.payload));
        }

        if (action.type === DISCOVERY.START) {
            const state = api.getState();
            const isCoinjoinBlockedByTor = selectIsCoinjoinBlockedByTor(state);
            if (!isCoinjoinBlockedByTor) {
                // find all coinjoin accounts
                const coinjoinAccounts = state.wallet.accounts.filter(
                    a => a.accountType === 'coinjoin',
                );
                coinjoinAccounts.forEach(a =>
                    api.dispatch(coinjoinAccountActions.fetchAndUpdateAccount(a)),
                );
            }
        }

        if (blockchainActions.synced.match(action)) {
            const state = api.getState();
            const { symbol } = action.payload;
            const isCoinjoinBlockedByTor = selectIsCoinjoinBlockedByTor(state);
            if (!isCoinjoinBlockedByTor) {
                const { accounts } = state.wallet;
                // find all coinjoin accounts for network
                const coinjoinAccounts = accounts.filter(
                    a => a.accountType === 'coinjoin' && a.symbol === symbol,
                );
                coinjoinAccounts.forEach(a =>
                    api.dispatch(coinjoinAccountActions.fetchAndUpdateAccount(a)),
                );
            }
        }

        // Pause coinjoin session when device disconnects.
        // This is not treated a temporary interruption with automatic restore because the user probably disconnects the device willingly.
        if (action.type === DEVICE.DISCONNECT && action.payload.id) {
            api.dispatch(coinjoinAccountActions.pauseCoinjoinSessionByDeviceId(action.payload.id));
        }

        // Pause/restore coinjoin session when Suite goes offline/online.
        // This is just UX improvement as the session could not continue offline anyway.
        if (action.type === SUITE.ONLINE_STATUS) {
            if (action.payload === false) {
                if (selectIsAnySessionInCriticalPhase(api.getState())) {
                    api.dispatch(
                        coinjoinClientActions.clientEmitException(
                            'Suite offline in critical phase',
                        ),
                    );
                }
                api.dispatch(coinjoinAccountActions.interruptAllCoinjoinSessions());
            } else if (action.payload === true) {
                api.dispatch(coinjoinAccountActions.restoreInterruptedCoinjoinSessions());
            }
        }

        // Pause/restore coinjoin session based on Tor status.
        // Continuing coinjoin would be a privacy risk.
        if (action.type === SUITE.TOR_STATUS) {
            if (['Disabling', 'Disabled', 'Error'].includes(action.payload)) {
                if (selectIsAnySessionInCriticalPhase(api.getState())) {
                    api.dispatch(
                        coinjoinClientActions.clientEmitException(
                            `TOR ${action.payload} in critical phase`,
                        ),
                    );
                }
                api.dispatch(coinjoinAccountActions.interruptAllCoinjoinSessions());
            } else if (action.payload === 'Enabled') {
                api.dispatch(coinjoinAccountActions.restoreInterruptedCoinjoinSessions());
            }
        }

        // Pause/restore coinjoin session when an account goes out of sync or in sync.
        // As this is not crucial, it does not pause during the critical phase not to ruin a round.
        if (accountsActions.endCoinjoinAccountSync.match(action)) {
            const state = api.getState();
            const { accountKey, status } = action.payload;
            const session = selectCoinjoinAccountByKey(state, accountKey)?.session;
            if (status === 'out-of-sync' && session && !session?.paused && !session?.starting) {
                const isAccountInCriticalPhase =
                    selectIsAccountWithSessionInCriticalPhaseByAccountKey(state, accountKey);
                if (!isAccountInCriticalPhase) {
                    api.dispatch(coinjoinClientActions.pauseCoinjoinSession(accountKey, true));
                }
            } else if (status === 'ready' && session?.interrupted) {
                const account = selectAccountByKey(state, accountKey);
                if (account) {
                    const blocker = selectCoinjoinSessionBlockerByAccountKey(state, account.key);
                    if (!blocker)
                        api.dispatch(coinjoinAccountActions.restoreCoinjoinSession(account.key));
                }
            }
        }

        // Pause/restore coinjoin session depending on current route.
        // Device may be locked by another connect call, so check on LOCK_DEVICE action as well.
        if (action.type === ROUTER.LOCATION_CHANGE || action.type === SUITE.LOCK_DEVICE) {
            const state = api.getState();
            const { locks } = state.suite;
            if (!locks.includes(SUITE.LOCK_TYPE.DEVICE) && !locks.includes(SUITE.LOCK_TYPE.UI)) {
                const previousRoute = state.router.settingsBackRoute.name;
                if (previousRoute === 'wallet-send') {
                    api.dispatch(coinjoinAccountActions.restoreInterruptedCoinjoinSessions());
                } else {
                    const accountKey = state.wallet.selectedAccount.account?.key;
                    if (accountKey) {
                        const session = selectCoinjoinAccountByKey(state, accountKey)?.session;
                        if (
                            state.router.route?.name === 'wallet-send' &&
                            !session?.paused &&
                            !session?.starting
                        ) {
                            api.dispatch(
                                coinjoinClientActions.pauseCoinjoinSession(accountKey, true),
                            );
                        }
                    }
                }
            }
        }

        if (action.type === MESSAGE_SYSTEM.SAVE_VALID_MESSAGES) {
            const state = api.getState();

            const incomingConfig = selectFeatureConfig(state, Feature.coinjoin);

            if (incomingConfig) {
                const config = {
                    ...state.wallet.coinjoin.config,
                };

                // Iterate over existing config and replace the value from remote config only if it's valid number.
                (Object.keys(config) as Array<keyof CoinjoinConfig>).forEach(
                    (key: keyof CoinjoinConfig) => {
                        const value = Number(incomingConfig[key]);

                        if (!Number.isNaN(value) && typeof config[key] !== 'undefined') {
                            config[key] = value;
                        }
                    },
                );

                api.dispatch(coinjoinAccountActions.updateCoinjoinConfig(config));
            }
        }

        if (
            action.type === MESSAGE_SYSTEM.SAVE_VALID_MESSAGES ||
            action.type === SESSION_ROUND_CHANGED
        ) {
            const state = api.getState();

            const isCoinjoinDisabledByFeatureFlag = selectIsFeatureDisabled(
                state,
                Feature.coinjoin,
            );

            if (isCoinjoinDisabledByFeatureFlag) {
                const isAnySessionInCriticalPhase = selectIsAnySessionInCriticalPhase(state);
                const hasCriticalPhaseJustEnded =
                    action.type === SESSION_ROUND_CHANGED &&
                    action.payload.round.phase === RoundPhase.Ended;

                if (!isAnySessionInCriticalPhase || hasCriticalPhaseJustEnded) {
                    api.dispatch(coinjoinAccountActions.interruptAllCoinjoinSessions());
                }
            }
        }

        if (action.type === SET_DEBUG_SETTINGS) {
            api.dispatch(storageActions.saveCoinjoinDebugSettings());
        }

        if (action.type === COINJOIN.CLIENT_SESSION_PHASE) {
            const { accountKeys } = action.payload;
            const isAlredyInterrupted = api
                .getState()
                .wallet.coinjoin.accounts.find(({ key }) => key === accountKeys[0])
                ?.session?.interrupted;

            if (action.payload.phase === SessionPhase.CriticalError && !isAlredyInterrupted) {
                action.payload.accountKeys.forEach(key =>
                    api.dispatch(coinjoinClientActions.pauseCoinjoinSession(key, true)),
                );
                api.dispatch(addToast({ type: 'coinjoin-interrupted' }));
            }
        }

        return action;
    };
