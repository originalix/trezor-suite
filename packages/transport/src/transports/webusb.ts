import { AbstractUsbTransport } from './abstractUsb';
import { AbstractTransport } from './abstract';
import { error } from '../utils/result';
import { WRONG_ENVIRONMENT } from './errors';
import { AsyncResultWithTypedError } from '../types';

// this class loads in node environment only in case of accidental use of WebusbTransport
export class WebUsbTransport extends AbstractUsbTransport {
    public name = 'WebUsbTransport' as const;

    constructor(params: ConstructorParameters<typeof AbstractTransport>[0]) {
        // @ts-expect-error
        super(params);
        console.error(WRONG_ENVIRONMENT);
    }
    // @ts-expect-error
    init(): AsyncResultWithTypedError<undefined, typeof WRONG_ENVIRONMENT> {
        return Promise.resolve(error({ error: WRONG_ENVIRONMENT }));
    }
}
