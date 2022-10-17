import React from 'react';
import styled from 'styled-components';

import { SectionItem, TextColumn } from '@suite-components/Settings';
import { useSelector } from '@suite-hooks';
import { MetadataProviderType } from '@suite-common/metadata-types';

const StyledPre = styled.pre`
    font-size: 10px;
`;

export const Metadata = () => {
    const { metadata } = useSelector(state => ({
        metadata: state.metadata,
    }));

    if (!metadata.data) {
        return (
            <SectionItem>
                <TextColumn
                    title="No labeling data"
                    description="Go back to Suite, connect provider and change some label"
                />
            </SectionItem>
        );
    }

    return (
        <>
            {/* @ts-expect-error object.keys typing.. */}
            {Object.keys(metadata.data).map((provider: MetadataProviderType) => {
                return (
                    <SectionItem key={provider}>
                        <TextColumn
                            title={provider}
                            description={
                                metadata.data![provider] &&
                                // @ts-expect-error
                                Object.keys(metadata.data![provider]).map(filename => {
                                    return (
                                        <div key={filename}>
                                            <div>{filename}</div>
                                            <StyledPre>
                                                {JSON.stringify(
                                                    metadata.data![provider]![filename],
                                                    null,
                                                    2,
                                                )}
                                            </StyledPre>
                                        </div>
                                    );
                                })
                            }
                        />
                    </SectionItem>
                );
            })}
        </>
    );
};
