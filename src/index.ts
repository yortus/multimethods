import {configure} from './config';
import {getLongestCommonPrefix, isPromiseLike}  from './util';
export {configure, Options} from './config';
export {default as Pattern, parsePatternSource, PatternAST} from './pattern';
export {default as Taxonomy, TaxonomyNode} from './taxonomy';





// TODO: temp testing...
export {default as OldMultimethod, Method} from './zzz-multimethod';
export * from './multimethod';





// TODO: temp testing...
export function meta<T extends Function>(fn: T) {
    const IS_META = '__meta';
    // TODO: use a symbol...
    // TODO: ensure it is a function, etc
    fn[IS_META] = true;
    return fn;
}





// TODO: doc...
export const util = {
    getLongestCommonPrefix,
    isPromiseLike
};





// TODO: doc...
configure({warnings: 'default'});
