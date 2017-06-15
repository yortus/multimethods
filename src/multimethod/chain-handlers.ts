import DEFAULT_FALLBACK from './fallback';
import {isPromiseLike} from '../util';
import metaHandlers from './meta-handlers';





// TODO: doc...
export default function chainHandlers<T extends Function>(handlerA: T, handlerB: T, FALLBACK = DEFAULT_FALLBACK) {

    let isMetaA = metaHandlers.has(handlerA);
    let isMetaB = metaHandlers.has(handlerB);
    if (!isMetaA && !isMetaB) return chainRegularHandlers(handlerA, handlerB, FALLBACK);
    if (isMetaA && isMetaB) return chainMetaHandlers(handlerA, handlerB);

    // TODO: ...
    throw new Error(`compose mismaaaaaaaatch`);
}





// TODO: doc...
// TODO: make variadic?
function chainRegularHandlers<T extends Function>(handlerA: T, handlerB: T, FALLBACK: any) {
    return (function (...args: any[]) {
        let result = handlerA(...args);
        if (isPromiseLike(result)) {
            return result.then(rs => {
                return rs === FALLBACK ? handlerB(...args) : result;
            });
        }
        return result === FALLBACK ? handlerB(...args) : result;
    }) as any as T;
}





// TODO: doc...
// TODO: make variadic?
function chainMetaHandlers<T extends Function>(handlerA: T, handlerB: T) {

// TODO: general case...
    let result = (function (...args: any[]) {
        let next: Function = args.pop();
        let captures: object = args.pop();

        // call the meta-handler A, with meta-handler B as `next`
        // TODO: just do sync for now, then work out async case
        return handlerA(...args, captures, (...argsB: any[]) => {
            return handlerB(...argsB, captures, next);
        });
    }) as any as T;

// TODO: unary case...
    // let result = (function ($0: any, captures: any, next: Function) {

    //     // call the meta-handler A, with meta-handler B as `next`
    //     // TODO: just do sync for now, then work out async case
    //     return handlerA($0, captures, ($$0: any) => {
    //         return handlerB($$0, captures, next);
    //     });
    // }) as any as T;

    metaHandlers.set(result, true);
    return result;
}
