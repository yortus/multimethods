import {getLongestCommonPrefix, isPromiseLike}  from './util';

// TODO: export the later ones? They are only used in unit tests. Could we do equivalent tests through public API?
export {parsePredicatePattern, PredicateAST, toIdentifier, toMatchFunction, toNormalPredicate, ANY, toPredicate} from './set-theory/predicates';


export {default as intersect} from './set-theory/sets/intersect';


export {EulerDiagram, EulerSet} from './set-theory/sets';





// TODO: temp testing...
export * from './multimethod';
export {CONTINUE} from './multimethod/sentinels';





// TODO: temp testing...
import metaHandlers from './multimethod/meta-handlers';
export function meta<T extends Function>(fn: T) {
    // TODO: ensure it is a function, etc
    metaHandlers.set(fn, true);
    return fn;
}





// TODO: doc...
export const util = {
    getLongestCommonPrefix,
    isPromiseLike
};
