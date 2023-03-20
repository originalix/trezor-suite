import { HiddenPlaceholder } from '@suite-components/HiddenPlaceholder';
import { Icon, Link, useTheme } from '@trezor/components';
import React, { createRef } from 'react';
import { copyToClipboard } from '@trezor/dom-utils';
import styled from 'styled-components';
import { useSelector } from '@suite-hooks';

const IconWrapper = styled.div`
    display: none;
    padding: 1px;
    border-radius: 2px;
    margin-left: 4px;
    background-color: ${({ theme }) => theme.TYPE_DARK_GREY};
    height: 14px;
`;

const TextOverflowContainer = styled.div`
    position: relative;
    display: inline-flex;
    max-width: 100%;
    overflow: hidden;
    color: ${({ theme }) => theme.TYPE_DARK_GREY};
    cursor: pointer;
    user-select: none;

    &:hover {
        border-radius: 4px;
        background-color: ${({ theme }) => theme.BG_GREY};
        padding: 2px;
        margin: -2px;
        z-index: 3;

        ${IconWrapper} {
            display: block;
        }
    }
`;

const SpanTextStart = styled.span`
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const SpanTextEnd = styled.span`
    display: inline-block;
`;

interface TxAddressOverflowProps {
    txAddress?: string;
}

// NOT IMPLEMENTED
// - tooltip and expanding address because it breaks discrete mode
// - text-overflow: ellipsis "..."; not supported so there is a gap
export const TxAddressOverflow = ({ txAddress }: TxAddressOverflowProps) => {
    const htmlElement = createRef<HTMLDivElement>();
    const theme = useTheme();

    const { selectedAccount } = useSelector(state => state.wallet);
    const { network } = selectedAccount;
    const explorerUrl =
        network?.networkType === 'cardano'
            ? network?.explorer.token
            : network?.explorer.account.replace('xpub', 'address'); // fix for btc-like coins

    const copy = () => copyToClipboard(txAddress || '', htmlElement.current);

    if (!txAddress) {
        return null;
    }

    return (
        <HiddenPlaceholder>
            <TextOverflowContainer ref={htmlElement}>
                {txAddress.length <= 5 ? (
                    <SpanTextEnd onClick={copy}>{txAddress}</SpanTextEnd>
                ) : (
                    <>
                        <SpanTextStart onClick={copy}>{txAddress.slice(0, -4)}</SpanTextStart>
                        <SpanTextEnd onClick={copy}>{txAddress.slice(-4)}</SpanTextEnd>
                    </>
                )}
                <IconWrapper onClick={copy}>
                    <Icon icon="COPY" size={12} color={theme.BG_WHITE} />
                </IconWrapper>
                <IconWrapper>
                    <Link size="tiny" variant="nostyle" href={`${explorerUrl}${txAddress}`}>
                        <Icon icon="EXTERNAL_LINK" size={12} color={theme.BG_WHITE} />
                    </Link>
                </IconWrapper>
            </TextOverflowContainer>
        </HiddenPlaceholder>
    );
};
