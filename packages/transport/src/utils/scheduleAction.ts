import {
    scheduleAction as scheduleActionOrig,
    ScheduleActionParams,
    ScheduledAction,
} from '@trezor/utils';

import { unknownError } from './result';
import * as TRANSPORT_ERRORS from '../transports/errors';

export const scheduleAction = <T>(action: ScheduledAction<T>, params: ScheduleActionParams) => {
    try {
        return scheduleActionOrig<T>(action, params);
    } catch (err) {
        return Promise.resolve(
            unknownError(err, [
                TRANSPORT_ERRORS.ABORTED_BY_TIMEOUT,
                TRANSPORT_ERRORS.ABORTED_BY_SIGNAL,
            ]),
        );
    }
};
