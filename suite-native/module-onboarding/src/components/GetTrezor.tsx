import React, { ReactNode } from 'react';

import { Box, Stack, Text } from '@suite-native/atoms';
import { Link } from '@suite-native/link';

type GetTrezorProps = {
    children: ReactNode;
};

export const GetTrezor = ({ children }: GetTrezorProps) => (
    <Stack spacing="large" marginBottom="medium">
        <Box flexDirection="row" alignItems="center" justifyContent="center">
            <Text variant="hint" color="textSubdued">
                Don’t have a Trezor?
            </Text>
            <Link href="https://trezor.io/">
                <Text color="textPrimaryDefault"> Get one here.</Text>
            </Link>
        </Box>
        {children}
    </Stack>
);
