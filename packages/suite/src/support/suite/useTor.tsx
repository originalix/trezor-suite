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
    const { updateTorStatus, updateTorBootstrap } = useActions({
        updateTorStatus: suiteActions.updateTorStatus,
        updateTorBootstrap: suiteActions.updateTorBootstrap,
    });
    const { torBootstrap } = useSelector(selectTorState);

    useEffect(() => {
        const resetTorBootstrap = () => {
            updateTorBootstrap(null);
        };

        if (isWeb()) {
            const isTorDomain = getIsTorDomain(getLocationHostname());
            const newTorStatus = isTorDomain ? TorStatus.Enabled : TorStatus.Disabled;

            updateTorStatus(newTorStatus);
        }

        if (isDesktop()) {
            desktopApi.on('tor/status', (newStatus: TorStatusEvent) => {
                const isTorEnabled = newStatus.type === 'Enabled';
                // TODO: handle that type could be for example BootstrapsIsSlow or Misbehaving
                updateTorStatus(isTorEnabled ? TorStatus.Enabled : TorStatus.Disabled);
                if (isTorEnabled) {
                    // After getting Tor enabled we reset Tor bootstrap.
                    resetTorBootstrap();
                }
            });
            desktopApi.getTorStatus();

            desktopApi.on('tor/bootstrap', (bootstrapEvent: BootstrapTorEvent) => {
                console.log('bootstrapEvent in useTor', bootstrapEvent);
                if (bootstrapEvent.type === 'error') {
                    updateTorStatus(TorStatus.Error);
                }

                if (bootstrapEvent.type === 'slow') {
                    // TODO: do the thing.
                    console.log(
                        'torBootstrap to be used as slow only to modify isSlow',
                        torBootstrap,
                    );
                    if (torBootstrap) {
                        updateTorBootstrap({
                            ...torBootstrap,
                            isSlow: true,
                        });
                    }
                }

                if (bootstrapEvent.type === 'progress' && bootstrapEvent.progress.current) {
                    // TODO(karliatto): make this updating only one part of the state better than this!!
                    if (torBootstrap) {
                        updateTorBootstrap({
                            ...torBootstrap,
                            current: bootstrapEvent.progress.current,
                            total: bootstrapEvent.progress.total,
                        });
                    } else {
                        updateTorBootstrap({
                            current: bootstrapEvent.progress.current,
                            total: bootstrapEvent.progress.total,
                            isSlow: false,
                        });
                    }

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
    }, [updateTorStatus, updateTorBootstrap, torBootstrap]);
};
