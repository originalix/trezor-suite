import React from 'react';

import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { Icon } from '@trezor/icons';

import { Box } from './Box';
import { Text } from './Text';

type AlertProps = {
    title: string;
};

const alertWrapperStyle = prepareNativeStyle(utils => ({
    flexDirection: 'row',
    padding: utils.spacings.medium,
    borderRadius: utils.borders.radii.medium,
    backgroundColor: utils.colors.backgroundAlertBlueSubtleOnElevation0,
}));

const ICON_SIZE = 48;
const iconWrapperStyle = prepareNativeStyle(utils => ({
    justifyContent: 'center',
    alignItems: 'center',
    width: ICON_SIZE,
    height: ICON_SIZE,
    backgroundColor: utils.colors.backgroundAlertBlueSubtleOnElevation0,
    borderRadius: utils.borders.radii.round,
}));

export const Alert = ({ title }: AlertProps) => {
    const { applyStyle } = useNativeStyles();

    return (
        <Box style={applyStyle(alertWrapperStyle)}>
            <Box style={applyStyle(iconWrapperStyle)}>
                <Icon size="medium" name="info" color="iconAlertBlue" />
            </Box>
            <Text color="textAlertBlue">{title}</Text>
        </Box>
    );
};
