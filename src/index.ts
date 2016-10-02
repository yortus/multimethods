import {configure} from './config';
import {getLongestCommonPrefix, isPromiseLike}  from './util';
export {configure, Options} from './config';
export {default as Pattern, parsePatternSource, PatternAST} from './pattern';
export {default as Taxonomy, TaxonomyNode} from './taxonomy';





// TODO: temp testing...
export {default as OldMultimethod, Method, UNHANDLED} from './zzz-multimethod';
export {default as Multimethod} from './multimethod';





// TODO: doc...
export const util = {
    getLongestCommonPrefix,
    isPromiseLike
};





// TODO: doc...
configure({warnings: 'default'});
