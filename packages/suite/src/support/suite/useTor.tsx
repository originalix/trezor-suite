import { useEffect } from 'react';
import { desktopApi, BootstrapTorEvent } from '@trezor/suite-desktop-api';
import { useActions } from '@suite-hooks';
import { getIsTorDomain } from '@suite-utils/tor';
import * as suiteActions from '@suite-actions/suiteActions';
import { isWeb, isDesktop } from '@suite-utils/env';
import { getLocationHostname } from '@trezor/env-utils';
import { TorStatusEvent } from 'packages/suite-desktop-api/lib/messages';
import { TorStatus } from '@suite-types';

export const useTor = () => {
    const { updateTorStatus, updateTorBootstrap } = useActions({
        updateTorStatus: suiteActions.updateTorStatus,
        updateTorBootstrap: suiteActions.updateTorBootstrap,
    });

    useEffect(() => {
        if (isWeb()) {
            const isTorDomain = getIsTorDomain(getLocationHostname());
            const newTorStatus = isTorDomain ? TorStatus.Enabled : TorStatus.Disabled;

            updateTorStatus(newTorStatus);
        }

        if (isDesktop()) {
            desktopApi.on('tor/status', (newStatus: TorStatusEvent) => {
                const isTorEnabled = newStatus.type === 'Enabled';
                updateTorStatus(isTorEnabled ? TorStatus.Enabled : TorStatus.Disabled);
                if (isTorEnabled) {
                    // After getting Tor enabled we reset Tor bootstrap.
                    updateTorBootstrap(null);
                }
            });
            desktopApi.getTorStatus();

            desktopApi.on('tor/bootstrap', (bootstrapEvent: BootstrapTorEvent) => {
                if (bootstrapEvent.type === 'error') {
                    updateTorStatus(TorStatus.Error);
                }

                if (bootstrapEvent.type === 'progress' && bootstrapEvent.progress.current) {
                    updateTorBootstrap({
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
        }

        return () => {
            desktopApi.removeAllListeners('tor/bootstrap');
            desktopApi.removeAllListeners('tor/status');
        };
    }, [updateTorStatus, updateTorBootstrap]);
};
