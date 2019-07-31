import {Discriminator} from '../../../interface/options';
import {isPromise, panic} from '../../util';




// TODO: jsdoc...
// TODO: revise suitability of this default behaviour in actual usage
// TODO: better to specialise for MM arity for perf/strict checks?
export function defaultDiscriminator(...args: unknown[]) {
    return args.map(arg => '/' + stringify(arg)).join('');
}




// TODO: jsdoc...
export function makeDefaultUnhandled(discriminator: Discriminator) {
    let unhandled = (...args: unknown[]) => {
        let discriminant = discriminator(...args);
        if (isPromise(discriminant)) {
            return discriminant.then(dsc => panic(UNHANDLED_MSG.replace('%', dsc)));
        }
        else {
            return panic(UNHANDLED_MSG.replace('%', discriminant));
        }
    };
    return unhandled;
}




// TODO: doc helper...
function stringify(value: unknown) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return Object.getPrototypeOf(value).constructor.name;

    // TODO: consider a more sophistocated approach like the following?
    // let t = typeof value;
    // if (t === 'symbol') value = Symbol.keyFor(value) || String(value).slice(7, -1) || 'undefined';
    // if (typeof value === 'string') value = encodeURIComponent(value);
    // return  `${t}:${t === 'object' ? value.constructor.name : value}`;
}




// TODO: doc...
const UNHANDLED_MSG = `Multimethod dispatch failure: call was unhandled for  the given arguments (discriminant = '%').`;
