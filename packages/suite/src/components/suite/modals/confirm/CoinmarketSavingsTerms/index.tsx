import { Button, Icon, variables, Checkbox, H3 } from '@trezor/components';
import React, { useState } from 'react';
import { Translation, Modal } from '@suite-components';
import styled from 'styled-components';
import type { Deferred } from '@trezor/utils';

const Text = styled.div`
    padding-bottom: 20px;
    text-align: left;
    & + & {
        padding-top: 20px;
        border-top: 1px solid ${props => props.theme.STROKE_GREY};
    }
`;

const Header = styled.div`
    display: flex;
    width: 100%;
    padding: 10px 0;
    align-items: baseline;
    color: ${props => props.theme.TYPE_DARK_GREY};
`;

const StyledIcon = styled(Icon)`
    padding-right: 9px;
`;

const CheckText = styled.div`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const Footer = styled.div`
    display: flex;
    padding: 35px 0;
    flex: 1;
    border-top: 1px solid ${props => props.theme.STROKE_GREY};
`;

const FooterContent = styled.div`
    display: flex;
    justify-content: space-between;
    flex: 1;
`;

export type Props = {
    decision: Deferred<boolean>;
    onCancel: () => void;
    provider?: string;
};

export const CoinmarketSavingsTerms = ({ decision, onCancel, provider }: Props) => {
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const providerName = provider || 'unknown provider';

    return (
        <Modal
            isCancelable
            onCancel={() => {
                onCancel();
                decision.resolve(false);
            }}
            heading={
                <Header>
                    <StyledIcon size={16} icon="LOCK_ACTIVE" />
                    <H3>
                        <Translation id="TR_SAVINGS_FOR_YOUR_SAFETY" />
                    </H3>
                </Header>
            }
        >
            <Text>
                <Translation id="TR_SAVINGS_TERMS_1" values={{ provider: providerName }} />
            </Text>
            <Text>
                <Translation id="TR_SAVINGS_TERMS_2" />
            </Text>
            <Text>
                <Translation id="TR_SAVINGS_TERMS_3" />
            </Text>
            <Text>
                <Translation id="TR_SAVINGS_TERMS_4" />
            </Text>
            <Text>
                <Translation id="TR_SAVINGS_TERMS_5" />
            </Text>
            <Footer>
                <FooterContent>
                    <Checkbox isChecked={isChecked} onClick={() => setIsChecked(!isChecked)}>
                        <CheckText>
                            <Translation id="TR_SAVINGS_I_UNDERSTAND" />
                        </CheckText>
                    </Checkbox>
                    <Button
                        isDisabled={!isChecked}
                        onClick={() => {
                            decision.resolve(true);
                            onCancel();
                        }}
                    >
                        <Translation id="TR_SAVINGS_CONFIRM" />
                    </Button>
                </FooterContent>
            </Footer>
        </Modal>
    );
};