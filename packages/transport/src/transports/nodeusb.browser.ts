import { WRONG_ENVIRONMENT } from './errors';

export class NodeUsbTransport {
    init() {
        return {
            success: false,
            message: WRONG_ENVIRONMENT,
        };
    }
}
