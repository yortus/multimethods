import {configure} from './config';
import {getLongestCommonPrefix, isPromiseLike}  from './util';
export {configure, Options} from './config';
export {default as Predicate, parsePredicatePattern, PredicatePatternAST} from './predicate';
export {default as Taxonomy, TaxonomyNode} from './taxonomy';





// TODO: temp testing...
export * from './multimethod';





// TODO: temp testing...
export function meta<T extends Function>(fn: T) {
    const IS_META = '__meta';
    // TODO: use a symbol...
    // TODO: ensure it is a function, etc
    (fn as any)[IS_META] = true;
    return fn;
}





// TODO: doc...
export const util = {
    getLongestCommonPrefix,
    isPromiseLike
};





// TODO: doc...
configure({warnings: 'default'});
