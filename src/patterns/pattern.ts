/**
 * A pattern is a shorthand string representation of an indicator function [1]. In practical terms,
 * a pattern may be thought of as a simplified regular expression, with particular focus on:
 *   (i) defining a set of values, being precisely those which match the pattern;
 *   (ii) determining the bindings of any pattern variables for which a given value matches the pattern;
 *   (iii) determining whether two patterns are equivelent in terms of the sets of values they match; and
 *   (iv) deriving new patterns from existing ones according to their set relationships (e.g. intersections) [2].
 * The pattern DSL syntax is documented in [3]. Patterns are case-sensitive.
 * [1] See https://en.wikipedia.org/wiki/Indicator_function.
 * [2] See ??? TODO...
 * [3] See ??? TODO...
 */
export type Pattern = string & { __patternBrand: any };
