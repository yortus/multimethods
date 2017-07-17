




// TODO: clean up all exports in here!





export {default} from './api/create';
export {default as create} from './api/create';
export {default as Options} from './api/options';






// TODO: export the later ones? They are only used in unit tests. Could we do equivalent tests through public API?
export {parsePredicateSource, PredicateAST, toIdentifierParts, toMatchFunction, toNormalPredicate, ANY, toPredicate} from './set-theory/predicates';


export {default as intersect} from './set-theory/sets/intersect';


export {EulerDiagram, EulerSet} from './set-theory/sets';





// TODO: temp testing...
export {default as CONTINUE} from './shared/continue';





// TODO: temp testing...
import isMetaMethod from './shared/is-meta-method';
export function meta<T extends Function>(fn: T) {
    // TODO: ensure it is a function, etc
    isMetaMethod(fn, true);
    return fn;
}
