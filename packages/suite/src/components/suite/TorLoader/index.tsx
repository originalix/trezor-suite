import React, { useState, useEffect, ComponentType } from 'react';

import styled from 'styled-components';
import { TorStatus } from '@suite-types';
import { Translation } from '@suite-components';
import { useActions, useSelector } from '@suite-hooks';
import { selectTorState } from '@suite-reducers/suiteReducer';
import * as suiteActions from '@suite-actions/suiteActions';

import { Button, ModalProps } from '@trezor/components';
import { TorProgressBar } from './TorProgressBar';

const StyledButton = styled(Button)`
    width: 150px;
`;

interface TorLoadingScreenProps {
    ModalWrapper: ComponentType<ModalProps>;
    callback: (value?: unknown) => void;
}

export const TorLoader = ({ callback, ModalWrapper }: TorLoadingScreenProps) => {
    const [progress, setProgress] = useState<number>(0);
    const { torBootstrap, isTorDisabling, isTorError } = useSelector(selectTorState);

    const { toggleTor, updateTorStatus } = useActions({
        toggleTor: suiteActions.toggleTor,
        updateTorStatus: suiteActions.updateTorStatus,
    });

    useEffect(() => {
        if (progress === 100) {
            setProgress(0);
        }
        if (torBootstrap && torBootstrap.current) {
            setProgress(torBootstrap.current);
            if (torBootstrap.current === torBootstrap.total) {
                updateTorStatus(TorStatus.Enabled);
                callback(true);
            }
        }
    }, [progress, torBootstrap, callback, updateTorStatus]);

    const tryAgain = async () => {
        setProgress(0);
        updateTorStatus(TorStatus.Enabling);

        try {
            await toggleTor(true);
        } catch {
            updateTorStatus(TorStatus.Error);
        }
    };

    const disableTor = async () => {
        let fakeProgress = 0;

        // updateTorStatus(TorStatus.Disabling);
        try {
            await toggleTor(false);
        } catch {
            updateTorStatus(TorStatus.Error);
        }

        // This is a total fake progress, otherwise it would be too fast for user.
        await new Promise(resolve => {
            const interval = setInterval(() => {
                if (fakeProgress === 100) {
                    clearInterval(interval);
                    return resolve(null);
                }

                fakeProgress += 10;
                setProgress(fakeProgress);
            }, 300);
        });

        callback(false);
    };

    return (
        <ModalWrapper
            bottomBar={
                isTorError && (
                    <StyledButton
                        data-test="@tor-loading-screen/try-again-button"
                        icon="REFRESH"
                        onClick={tryAgain}
                    >
                        <Translation id="TR_TRY_AGAIN" />
                    </StyledButton>
                )
            }
        >
            <TorProgressBar
                isTorError={isTorError}
                isTorDisabling={isTorDisabling}
                isTorBootstrapSlow={!!torBootstrap?.isSlow}
                progress={progress}
                disableTor={disableTor}
            />
        </ModalWrapper>
    );
};
