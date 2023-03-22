import React from 'react';
import styled from 'styled-components';

import { WalletAccountTransaction } from '@wallet-types/index';
import { SignValue } from '@suite-common/suite-types';
import { HiddenPlaceholder } from './HiddenPlaceholder';
import { Sign } from './Sign';
import { TrezorLink } from '@suite-components';
import { useSelector } from '@suite-hooks/useSelector';
import { getNftTokenId } from '@suite-common/wallet-utils';

const Container = styled.div`
    max-width: 100%;
    display: flex;
`;

const Symbol = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
`;

const ID = styled.span`
    white-space: nowrap;
`;

const NoLink = styled.span`
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 145px;
`;

const StyledTrezorLink = styled(TrezorLink)`
    color: ${({ theme }) => theme.TYPE_GREEN};
    text-decoration: underline;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: min(50%, 145px);
`;

interface FormattedNftAmountProps {
    transfer: WalletAccountTransaction['tokens'][number];
    signValue?: SignValue;
    className?: string;
    useLink?: boolean;
}

export const FormattedNftAmount = ({
    transfer,
    signValue,
    className,
    useLink,
}: FormattedNftAmountProps) => {
    const id = getNftTokenId(transfer);

    const { selectedAccount } = useSelector(state => state.wallet);
    const { network } = selectedAccount;
    const explorerUrl =
        network?.networkType === 'ethereum'
            ? `${network?.explorer.nft}/${transfer.address}/${id}`
            : undefined;

    return (
        <HiddenPlaceholder>
            <Container className={className}>
                {!!signValue && <Sign value={signValue} />}

                <ID>ID&nbsp;</ID>

                {useLink ? (
                    <StyledTrezorLink href={explorerUrl}>{id}</StyledTrezorLink>
                ) : (
                    <NoLink>{id}</NoLink>
                )}

                <Symbol>&nbsp;{transfer.symbol}</Symbol>
            </Container>
        </HiddenPlaceholder>
    );
};
