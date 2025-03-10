import {
    Easing,
    interpolateColor,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    useAnimatedKeyboard,
} from 'react-native-reanimated';
import { useCallback, useEffect } from 'react';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { NativeScrollEvent } from 'react-native';

import { useNativeStyles } from '@trezor/styles';
import { getScreenHeight } from '@trezor/env-utils';

type GestureHandlerContext = {
    translatePanY: number;
};

const ANIMATION_DURATION = 300;
const SCREEN_HEIGHT = getScreenHeight();

export const useBottomSheetAnimation = ({
    onClose,
    isVisible,
    setIsCloseScrollEnabled,
    isCloseScrollEnabled = false,
}: {
    isVisible: boolean;
    onClose?: (isVisible: boolean) => void;
    setIsCloseScrollEnabled?: (isCloseScrollEnabled: boolean) => void;
    isCloseScrollEnabled?: boolean;
}) => {
    const { utils } = useNativeStyles();
    const transparency = isVisible ? 1 : 0;
    const colorOverlay = utils.transparentize(0.3, utils.colors.backgroundNeutralBold);
    const translatePanY = useSharedValue(SCREEN_HEIGHT);
    const animatedTransparency = useSharedValue(transparency);
    const keyboard = useAnimatedKeyboard();

    useEffect(() => {
        animatedTransparency.value = withTiming(transparency, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.cubic),
        });
    }, [transparency, animatedTransparency]);

    const animatedSheetWithOverlayStyle = useAnimatedStyle(
        () => ({
            backgroundColor: interpolateColor(
                animatedTransparency.value,
                [0, 1],
                ['transparent', colorOverlay],
            ),
        }),
        [transparency, animatedTransparency],
    );

    const animatedSheetWrapperStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: translatePanY.value - keyboard.height.value,
            },
        ],
    }));

    const closeSheetAnimated = useCallback(() => {
        'worklet';

        return new Promise((resolve, _) => {
            translatePanY.value = withTiming(SCREEN_HEIGHT, {
                duration: ANIMATION_DURATION,
                easing: Easing.out(Easing.cubic),
            });
            animatedTransparency.value = withTiming(
                0,
                {
                    duration: ANIMATION_DURATION,
                    easing: Easing.out(Easing.cubic),
                },
                () => {
                    if (onClose) runOnJS(onClose)(false);
                    if (setIsCloseScrollEnabled) runOnJS(setIsCloseScrollEnabled)(true);
                },
            );

            setTimeout(resolve, ANIMATION_DURATION);
        });
    }, [translatePanY, animatedTransparency, onClose, setIsCloseScrollEnabled]);

    const openSheetAnimated = useCallback(() => {
        'worklet';

        translatePanY.value = withTiming(0, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
        });
    }, [translatePanY]);

    const scrollEvent = ({ nativeEvent }: { nativeEvent: NativeScrollEvent }) => {
        if (!setIsCloseScrollEnabled) return;

        if (nativeEvent.contentOffset.y <= 0 && !isCloseScrollEnabled) {
            setIsCloseScrollEnabled(true);
        }
        if (nativeEvent.contentOffset.y > 0 && isCloseScrollEnabled) {
            setIsCloseScrollEnabled(false);
        }
    };

    const panGestureEvent = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        GestureHandlerContext
    >({
        onStart: (_, context) => {
            context.translatePanY = translatePanY.value;
        },
        onActive: (event, context) => {
            const { translationY } = event;
            translatePanY.value = translationY + context.translatePanY;
        },
        onEnd: event => {
            const { translationY, velocityY } = event;
            if (translationY > 50 && velocityY > 2) {
                closeSheetAnimated();
            } else {
                openSheetAnimated();
            }
        },
    });

    return {
        animatedSheetWithOverlayStyle,
        animatedSheetWrapperStyle,
        closeSheetAnimated,
        openSheetAnimated,
        panGestureEvent,
        scrollEvent,
    };
};
