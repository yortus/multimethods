




/**
 * A predicate is a shorthand string representation of an indicator function [1]. In practical terms,
 * a predicate may be thought of as a simplified regular expression, with particular focus on:
 *   (i) defining a set of values, being precisely those which satisfy the predicate;
 *   (ii) determining the bindings of any predicate variables for which a given value satisfies the predicate;
 *   (iii) determining whether two predicates are equivelent in terms of the sets of values they define; and
 *   (iv) deriving new predicates from existing ones according to their set relationships (e.g. intersections) [2].
 * The predicate DSL syntax is documented in [3]. Predicates are case-sensitive.
 * [1] See https://en.wikipedia.org/wiki/Indicator_function.
 * [2] See ??? TODO...
 * [3] See ??? TODO...
 */
export type Predicate = string & { __predicateBrand: any };
