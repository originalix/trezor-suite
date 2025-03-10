import { atom } from 'jotai';
import { RequireAllOrNone } from 'type-fest';

export type Alert = RequireAllOrNone<
    {
        title: string;
        description: string;
        primaryButtonTitle: string;
        onPressPrimaryButton: () => void;
        secondaryButtonTitle?: string;
        onPressSecondaryButton?: () => void;
    },
    'secondaryButtonTitle' | 'onPressSecondaryButton'
>;

export const alertAtom = atom<Alert | null>(null);

export const showAlertAtom = atom(null, (_, set, alert: Alert) => set(alertAtom, alert));
export const hideAlertAtom = atom(null, (_, set) => set(alertAtom, null));
