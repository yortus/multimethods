import isPromiseLike from './is-promise-like';





// TODO: doc...
export function andThen(getValue: () => unknown, cb: (value: unknown, error: unknown, isAsync: boolean) => unknown) {
    let value: any;
    try {
        value = getValue();
    }
    catch (error) {
        // sync error
        return cb(undefined, error, false);
    }
    if (isPromiseLike(value)) {
        // async result or error
        return value.then(val => cb(val, undefined, true), err => cb(undefined, err, true));
    }
    else {
        // sync result
        return cb(value, undefined, false);
    }
}
