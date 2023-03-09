import { AbortablePromise } from '../src/abortablePromise';

describe('AbortablePromise', () => {
    test('resolve resolves', () => {
        const a = new AbortablePromise<string>(resolve => {
            resolve('done');
        });

        expect(a).resolves.toEqual('done');
    });

    test('abort from outside resolves', () => {
        const a = new AbortablePromise(resolve => {
            setTimeout(() => {
                resolve('success');
            }, 1);
        });
        a.abort();

        expect(a).resolves.toEqual('Aborted');
    });

    test('abort listener aborts another promise', () => {
        const b = new AbortablePromise(resolve => {
            setTimeout(() => {
                resolve('success');
            }, 1);
        });

        const a = new AbortablePromise((resolve, abortsignal) => {
            setTimeout(() => {
                resolve('success');
            }, 1);
            abortsignal.addEventListener('abort', () => {
                b.abort();
            });
        });

        a.abort();

        expect(a).resolves.toEqual('Aborted');
        expect(b).resolves.toEqual('Aborted');
    });

    test('abort from parent controller resolves', () => {
        const controller = new AbortController();

        const a = new AbortablePromise(resolve => {
            setTimeout(() => {
                resolve('meow');
            }, 1);
        }, controller.signal);

        controller.abort();
        expect(a).resolves.toEqual('Aborted');
    });
});
