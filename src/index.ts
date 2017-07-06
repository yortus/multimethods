
// TODO: export the later ones? They are only used in unit tests. Could we do equivalent tests through public API?
export {parsePredicateSource, PredicateAST, toIdentifierParts, toMatchFunction, toNormalPredicate, ANY, toPredicate} from './set-theory/predicates';


export {default as intersect} from './set-theory/sets/intersect';


export {EulerDiagram, EulerSet} from './set-theory/sets';





// TODO: temp testing...
export {default} from './multimethod';
export {CONTINUE} from './multimethod/[old]/sentinels';
export {default as validate} from './multimethod/[old]/validate';





// TODO: temp testing...
import isMetaHandler from './multimethod/[old]/is-meta-handler';
export function meta<T extends Function>(fn: T) {
    // TODO: ensure it is a function, etc
    isMetaHandler(fn, true);
    return fn;
}
