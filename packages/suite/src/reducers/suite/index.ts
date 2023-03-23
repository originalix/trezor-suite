import { extraDependencies } from '@suite/support/extraDependencies';

import { prepareAnalyticsReducer } from '@suite-common/analytics';
import { prepareMessageSystemReducer } from '@suite-common/message-system';
import { notificationsReducer } from '@suite-common/toast-notifications';
import { logsSlice } from '@suite-common/logger';

import router from './routerReducer';
import suite from './suiteReducer';
import devices from './deviceReducer';
import modal from './modalReducer';
import resize from './resizeReducer';
import metadata from './metadataReducer';
import desktopUpdate from './desktopUpdateReducer';
import guide from './guideReducer';
import protocol from './protocolReducer';

const analytics = prepareAnalyticsReducer(extraDependencies);
const messageSystem = prepareMessageSystemReducer(extraDependencies);

export default {
    suite,
    router,
    modal,
    devices,
    logs: logsSlice.reducer,
    notifications: notificationsReducer,
    resize,
    analytics,
    metadata,
    desktopUpdate,
    messageSystem,
    guide,
    protocol,
};
