/* eslint-disable no-underscore-dangle */
// from https://github.com/zzdjk6/simple-abortable-promise

// General interface of Abortable
interface Abortable {
    abort: (reason?: string) => void;
    readonly abortReason?: string;
}

// The executor function should be passed to the constructor when create a Promise
interface ExecutorFunction<T> {
    (resolve: (value: T | 'Aborted') => void): void;
}

// The executor function should be passed to the constructor when create a AbortablePromise
interface AbortableExecutorFunction<T> {
    (resolve: (value: T) => void, abortController: AbortSignal): void;
}

// AbortablePromise is a subclass of Promise that implements Abortable interface
export class AbortablePromise<T> extends Promise<T> implements Abortable {
    public abort: Abortable['abort'];

    // Getter to access abort reason
    public get abortReason() {
        return this._abortReason;
    }

    // Internal store of abort reason
    private _abortReason?: string;

    // Constructor, note we can provide 2 args: resolve,  abortSignal
    constructor(
        executor: AbortableExecutorFunction<T>,
        // optionally custom also signal from above
        signal?: AbortSignal,
    ) {
        // todo:
        // looks like that constructor is called twice, not sure why

        if (signal) {
            signal.onabort = () => {
                this.abort('Aborted');
            };
        }

        const abortController = new AbortController();

        // This is the executor function to be passed to the superclass - Promise
        const normalExecutor: ExecutorFunction<T> = resolve => {
            abortController.signal.addEventListener('abort', () => {
                const reason = 'Aborted' as const;
                resolve(reason);
            });

            executor(resolve, abortController.signal);
        };
        // @ts-expect-error
        super(normalExecutor);

        // Bind the abort method
        this.abort = reason => {
            this._abortReason = reason || 'Aborted';
            abortController.abort(reason);
        };
    }
}

AbortablePromise.prototype.constructor = Promise;
