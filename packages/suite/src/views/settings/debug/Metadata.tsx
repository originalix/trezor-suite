import React, { useState } from 'react';
import styled from 'styled-components';

import { SectionItem, TextColumn } from '@suite-components/Settings';
import { useSelector } from '@suite-hooks';
import { MetadataState } from '@suite-common/metadata-types';
import { DropZone } from '@suite-components/DropZone';
import { Button } from '@trezor/components';
import * as metadataUtils from '@suite-utils/metadata';
import { Account } from 'suite-common/wallet-types/src';
import { RequiredKey } from 'packages/type-utils/src';

const StyledPre = styled.pre`
    font-size: 10px;
`;

const InfoSection = styled.div`
    margin: 8px 0;
`;

const DecodedSection = styled.div`
    display: flex;
    flex-direction: column;
    margin: 8px 0;
`;

const DecodedItem = styled.div`
    border: 1px dotted gray;
`;

interface MetadataItemProps {
    metadata: RequiredKey<MetadataState, 'provider' | 'data'>;
    account: Account;
}
const MetadataItem = ({ metadata, account }: MetadataItemProps) => {
    const { fileName, aesKey } = account.metadata;

    const onSelect = (file: File, setError: (msg: any) => void) => {
        const reader = new FileReader();
        reader.onload = () => {
            console.log('eader.result', reader.result);
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

    const [custom, setCustom] = useState(undefined);

    return (
        <div>
            <InfoSection>
                {!metadata && <div>No labelling data found.</div>}
                {metadata && <>Account path: {account.path}</>}
            </InfoSection>
            <DecodedSection>
                <DecodedItem>
                    <div>fetched from {metadata.provider.type}</div>
                    {!metadata.data[metadata.provider.type] &&
                        `No data for ${metadata.provider.type}`}
                    {/* @ts-expect-error */}
                    {metadata.data[metadata.provider.type][fileName] && (
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
                    <div>Insert local file</div>
                    {!custom && <DropZone accept=".mtdt" icon="CSV" onSelect={onSelect} />}
                    {custom && <StyledPre>{JSON.stringify(custom, null, 2)}</StyledPre>}
                    {custom && <Button onClick={() => setCustom(undefined)}>Clear</Button>}
                </DecodedItem>
            </DecodedSection>
        </div>
    );
};

export const Metadata = () => {
    const { metadata, accounts } = useSelector(state => ({
        metadata: state.metadata,
        accounts: state.wallet.accounts,
    }));

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
        <>
            {accounts.map(account => {
                return (
                    <SectionItem key={account.path}>
                        <TextColumn
                            title={account.metadata.fileName}
                            // @ts-expect-error
                            description={<MetadataItem metadata={metadata} account={account} />}
                        />
                    </SectionItem>
                );
            })}
        </>
    );
};
