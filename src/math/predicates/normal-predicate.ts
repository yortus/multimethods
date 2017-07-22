import Predicate from './predicate';





/**
 * A normal predicate is a predicate in normal form. Normal predicates use a subset of the full predicate DSL
 * syntax [1]. Every predicate corresponds to exactly one normal form that defines the same set of values. Two
 * distinct predicates that define the same set of values are guaranteed to have the same normal form.
 * [1] TODO: ...
 */
type NormalPredicate = Predicate & { __normalPredicateBrand: any };
export default NormalPredicate;
