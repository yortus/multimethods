import isPromiseLike from '../util/is-promise-like';





// TODO: doc...
export default function andThen(getValue: () => any, cb: (val: any, err: any, isAsync: boolean) => any) {
    let val: any;
    try {
        val = getValue();
    }
    catch (err) {
        // sync error
        return cb(undefined, err, false);
    }
    if (isPromiseLike(val)) {
        // async result or error
        return val.then(val => cb(val, undefined, true), err => cb(undefined, err, true));
    }
    else {
        // sync result
        return cb(val, undefined, false);
    }
}
