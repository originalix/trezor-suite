import { useEffect } from 'react';
import { desktopApi, BootstrapTorEvent, TorStatusEvent } from '@trezor/suite-desktop-api';
import { useActions, useSelector } from '@suite-hooks';
import { getIsTorDomain } from '@suite-utils/tor';
import * as suiteActions from '@suite-actions/suiteActions';
import { isWeb, isDesktop } from '@suite-utils/env';
import { getLocationHostname } from '@trezor/env-utils';
import { TorStatus } from '@suite-types';
import { selectTorState } from '@suite-reducers/suiteReducer';

export const useTor = () => {
    const { updateTorStatus, setTorBootstrap, setTorBootstrapSlow } = useActions({
        updateTorStatus: suiteActions.updateTorStatus,
        setTorBootstrap: suiteActions.setTorBootstrap,
        setTorBootstrapSlow: suiteActions.setTorBootstrapSlow,
    });
    const { torBootstrap } = useSelector(selectTorState);

    useEffect(() => {
        if (isWeb()) {
            const isTorDomain = getIsTorDomain(getLocationHostname());
            const newTorStatus = isTorDomain ? TorStatus.Enabled : TorStatus.Disabled;

            updateTorStatus(newTorStatus);
        }

        if (isDesktop()) {
            desktopApi.on('tor/status', (newStatus: TorStatusEvent) => {
                const { type } = newStatus;
                if (type === 'Bootstrapping') {
                    updateTorStatus(TorStatus.Enabling);
                } else if (type === 'Enabled') {
                    updateTorStatus(TorStatus.Enabled);
                } else if (type === 'Disabling') {
                    updateTorStatus(TorStatus.Disabling);
                } else if (type === 'Disabled') {
                    updateTorStatus(TorStatus.Disabled);
                } else {
                    updateTorStatus(TorStatus.Error);
                }
            });
            desktopApi.getTorStatus();
        }

        return () => desktopApi.removeAllListeners('tor/status');
    }, [updateTorStatus, torBootstrap]);

    useEffect(() => {
        desktopApi.on('tor/bootstrap', (bootstrapEvent: BootstrapTorEvent) => {
            if (bootstrapEvent.type === 'slow') {
                setTorBootstrapSlow(true);
            }

            if (bootstrapEvent.type === 'progress') {
                setTorBootstrap({
                    current: bootstrapEvent.progress.current,
                    total: bootstrapEvent.progress.total,
                });

                if (bootstrapEvent.progress.current === bootstrapEvent.progress.total) {
                    updateTorStatus(TorStatus.Enabled);
                } else {
                    updateTorStatus(TorStatus.Enabling);
                }
            }
        });

        return () => desktopApi.removeAllListeners('tor/bootstrap');
    }, [updateTorStatus, setTorBootstrap, torBootstrap, setTorBootstrapSlow]);
};
