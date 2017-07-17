// TODO: clean up all exports in here!





export {default} from './create-multimethod';
export {default as create} from './create-multimethod';
export {default as Options} from './options';
export {CONTINUE} from './sentinels';
export {meta} from './decorators';





// TODO: export the later ones? They are only used in unit tests. Could we do equivalent tests through public API?
export {parsePredicateSource, PredicateAST, toIdentifierParts, toMatchFunction, toNormalPredicate, ANY, toPredicate} from './math/predicates';


export {default as intersect} from './math/sets/intersect';


export {EulerDiagram, EulerSet} from './math/sets';
