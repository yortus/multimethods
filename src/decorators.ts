import {isMetaMethod} from './util';





// TODO: better typing...
export function meta<T extends Function>(fn: T) {
    // TODO: ensure it is a function, etc
    isMetaMethod(fn, true);
    return fn;
}
