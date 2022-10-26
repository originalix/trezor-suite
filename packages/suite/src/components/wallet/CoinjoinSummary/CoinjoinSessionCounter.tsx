import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FormattedDate } from 'react-intl';
import { P, Loader, Icon, colors } from '@trezor/components';
import { useSelector } from '@suite-hooks';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const StyledP = styled(P)`
    margin-left: 12px;
`;

const CounterWrapper = styled.span`
    padding-left: 10px;
`;

const Counter = ({ deadline }: { deadline: string | number }) => {
    const [left, setLeft] = useState(new Date(deadline));
    useEffect(() => {
        const interval = setInterval(() => {
            const milis = new Date(deadline).getTime() - Date.now();
            const date = new Date();
            date.setHours(0, 0, 0, milis > 0 ? milis : 0);
            setLeft(date);
        }, 100);
        return () => {
            clearInterval(interval);
        };
    }, [deadline]);
    return (
        <CounterWrapper>
            <FormattedDate minute="numeric" second="numeric" hourCycle="h23" value={left} />
        </CounterWrapper>
    );
};

export const CoinjoinSessionCounter = () => {
    const { accounts, selectedAccount } = useSelector(state => ({
        accounts: state.wallet.coinjoin.accounts,
        selectedAccount: state.wallet.selectedAccount,
    }));
    const session = accounts.find(a => a.key === selectedAccount.account!.key)?.session;
    if (!session) return null;

    switch (session.phase) {
        case 0:
            return (
                <Wrapper>
                    <Loader size={12} />
                    <StyledP>
                        Collecting inputs <Counter deadline={session.deadline} />
                    </StyledP>
                </Wrapper>
            );
        case 1:
            return (
                <Wrapper>
                    <Icon icon="WARNING" size={14} color={colors.TYPE_ORANGE} />
                    <StyledP>Confirming participation</StyledP>
                    <Counter deadline={session.deadline} />
                </Wrapper>
            );
        case 2:
            return (
                <Wrapper>
                    <Icon icon="WARNING" size={14} color={colors.TYPE_ORANGE} />
                    <StyledP>Registering outputs</StyledP>
                    <Counter deadline={session.deadline} />
                </Wrapper>
            );
        case 3:
            return (
                <Wrapper>
                    <Icon icon="WARNING" size={14} color={colors.TYPE_ORANGE} />
                    <StyledP>Signing transaction</StyledP>
                    <Counter deadline={session.deadline} />
                </Wrapper>
            );

        default:
            return (
                <Wrapper>
                    <Loader size={12} />
                    <StyledP>Looking for rounds...</StyledP>
                </Wrapper>
            );
    }
};
