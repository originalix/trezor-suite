import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

import { SectionItem, TextColumn } from '@suite-components/Settings';
import { useSelector } from '@suite-hooks';
import { MetadataState } from '@suite-common/metadata-types';
import { DropZone } from '@suite-components/DropZone';
import { Button, Select } from '@trezor/components';
import * as metadataUtils from '@suite-utils/metadata';
import { Account } from 'suite-common/wallet-types/src';

const LabelingViewer = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyledPre = styled.pre`
    font-size: 10px;
`;

const DecodedSection = styled.div`
    display: flex;
    flex-direction: row;
    margin: 8px 0;
    flex: 1;
`;

const DecodedItem = styled.div`
    padding: 8px;
    flex: 1;
    max-width: 50%;
    line-break: anywhere;
    overflow: hidden;
`;

const DecodedItemTitle = styled.div`
    margin-bottom: 4px;
    font-size: 16px;
    font-weight: 500;
`;

interface MetadataItemProps {
    metadata: MetadataState;
    account: Account;
}

const MetadataItem = ({ metadata, account }: MetadataItemProps) => {
    const { fileName, aesKey } = account.metadata;
    const [custom, setCustom] = useState(undefined);

    const onSelect = (file: File, setError: (msg: any) => void) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const decrypted = metadataUtils.decrypt(
                    // @ts-expect-error
                    metadataUtils.arrayBufferToBuffer(reader.result),
                    aesKey,
                );
                console.log(decrypted);
                setCustom(decrypted);
            } catch (err) {
                setError({ id: 'TR_DROPZONE_ERROR', values: { error: err.message } });
            }
        };
        reader.onerror = () => {
            setError({ id: 'TR_DROPZONE_ERROR', values: { error: reader.error!.message } });
            reader.abort();
        };
        reader.readAsArrayBuffer(file);
    };

    if (!metadata.provider) return null;

    return (
        <DecodedSection>
            <DecodedItem>
                <DecodedItemTitle>Fetched from {metadata.provider.type}</DecodedItemTitle>
                {!metadata.data?.[metadata.provider.type]?.[fileName] && 'No data found'}
                {metadata.data?.[metadata.provider.type]?.[fileName] && (
                    <StyledPre>
                        {JSON.stringify(
                            //@ts-expect-error
                            metadata.data[metadata.provider.type][fileName],
                            null,
                            2,
                        )}
                    </StyledPre>
                )}
            </DecodedItem>
            <DecodedItem>
                <DecodedItemTitle>Compare with a local file</DecodedItemTitle>
                {!custom && (
                    <DropZone
                        accept=".mtdt"
                        icon="SEARCH"
                        onSelect={onSelect}
                        placeholder="Upload file"
                    />
                )}
                {custom && <StyledPre>{JSON.stringify(custom, null, 2)}</StyledPre>}
                {custom && <Button onClick={() => setCustom(undefined)}>Clear</Button>}
            </DecodedItem>
        </DecodedSection>
    );
};

export const Metadata = () => {
    const { metadata, accounts } = useSelector(state => ({
        metadata: state.metadata,
        accounts: state.wallet.accounts,
    }));

    const [selectedAccountPath, setSelectedAccountPath] = useState(undefined);
    const selectedAccount = useMemo(() => {
        return accounts.find(a => a.path === selectedAccountPath);
    }, [accounts, selectedAccountPath]);

    const getLabel = (a: Account) => {
        return `${a.symbol} - ${a.path} - ${a.metadata.fileName}`;
    };

    if (!metadata.enabled) {
        return (
            <SectionItem>
                <TextColumn
                    title="No labeling data"
                    description="Go back to Suite and enable labeling"
                />
            </SectionItem>
        );
    }
    return (
        <SectionItem>
            <LabelingViewer>
                <Select
                    onChange={(selected: any) => {
                        setSelectedAccountPath(selected.value);
                    }}
                    value={{
                        label: selectedAccount ? getLabel(selectedAccount) : 'Select account',
                    }}
                    isClearable={false}
                    options={accounts.map(a => ({
                        label: getLabel(a),
                        value: a.path,
                    }))}
                    isClean
                    hideTextCursor
                />

                {selectedAccount && <MetadataItem metadata={metadata} account={selectedAccount} />}
            </LabelingViewer>
        </SectionItem>
    );
};
