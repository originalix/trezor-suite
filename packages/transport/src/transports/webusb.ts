import { UsbTransport } from './usb';
import { Transport } from './abstract';
import { error } from '../utils/result';
import { WRONG_ENVIRONMENT } from './errors';
import { AsyncResultWithTypedError } from '../types';

// this class loads in node environment only in case of accidental use of WebusbTransport
export class WebUsbTransport extends UsbTransport {
    public name = 'WebUsbTransport' as const;

    constructor(params: ConstructorParameters<typeof Transport>[0]) {
        // @ts-expect-error
        super(params);
        console.error(WRONG_ENVIRONMENT);
    }
    // @ts-expect-error
    init(): AsyncResultWithTypedError<undefined, typeof WRONG_ENVIRONMENT> {
        return Promise.resolve(error({ error: WRONG_ENVIRONMENT }));
    }
}
