import { useEffect } from 'react';
import { desktopApi, BootstrapTorEvent } from '@trezor/suite-desktop-api';
import { useActions, useSelector } from '@suite-hooks';
import { getIsTorDomain } from '@suite-utils/tor';
import * as suiteActions from '@suite-actions/suiteActions';
import { isWeb, isDesktop } from '@suite-utils/env';
import { getLocationHostname } from '@trezor/env-utils';
import { TorStatusEvent } from 'packages/suite-desktop-api/lib/messages';
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
        console.log('useEffect for tor/status');

        if (isWeb()) {
            const isTorDomain = getIsTorDomain(getLocationHostname());
            const newTorStatus = isTorDomain ? TorStatus.Enabled : TorStatus.Disabled;

            updateTorStatus(newTorStatus);
        }

        if (isDesktop()) {
            desktopApi.on('tor/status', (newStatus: TorStatusEvent) => {
                const isTorEnabled = newStatus.type === 'Enabled';
                console.log('tor/status in useTor', newStatus);
                // TODO(karliatto): handle that type could be for example BootstrapsIsSlow or Misbehaving
                updateTorStatus(isTorEnabled ? TorStatus.Enabled : TorStatus.Disabled);
            });
            desktopApi.getTorStatus();
        }

        return () => desktopApi.removeAllListeners('tor/status');
    }, [updateTorStatus, torBootstrap]);

    useEffect(() => {
        desktopApi.on('tor/bootstrap', (bootstrapEvent: BootstrapTorEvent) => {
            console.log('bootstrapEvent in useTor', bootstrapEvent);
            if (bootstrapEvent.type === 'slow') {
                // TODO: do the thing.
                console.log('torBootstrap to be used as slow only to modify isSlow', torBootstrap);
                setTorBootstrapSlow(true);
            }

            if (bootstrapEvent.type === 'progress' && bootstrapEvent.progress.current) {
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
