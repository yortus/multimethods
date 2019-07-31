import {panic} from '../util';
import {hasNamedCaptures} from './has-named-captures';
import {parse} from './parse';




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




/**
 * Verifies that `source` is a valid pattern and returns abstract syntax information about the pattern.
 * Throws an error if `source` is not a valid pattern. Consult the documentation for further information
 * about the pattern DSL syntax [1].
 * [1] TODO...
 * @param {string} source - the source string to be parsed as a pattern.
 * @returns {Pattern} a successfully parsed pattern.
 */
export function Pattern(source: string): Pattern {
    try {
        // This is just a pass/fail parser. There is no meaningful result for success. NB: may throw.
        parse(source);

        // Enforce current rule that a pattern can't have both alternatives and named captures.
        let hasAlternatives = source.indexOf('|') !== -1;
        let hasNamedCaps = hasNamedCaptures(source as Pattern);
        if (hasAlternatives && hasNamedCaps) {
            throw new Error('Pattern cannot contain both alternation and named captures');
        }

        // If we get here, `source` is a valid pattern.
        return source as Pattern;
    }
    catch (ex) {
        let startCol = ex.location ? ex.location.start.column : 0;
        let endCol = ex.location ? ex.location.end.column : source.length;
        if (endCol <= startCol) endCol = startCol + 1;
        let indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        return panic(`Pattern syntax error: ${ex.message}:\n${source}\n${indicator}.`);
    }
}




// TODO: revise comments...
/** Information associated with a successfully parsed pattern. */
/**
 * The pattern string in its normalized form (i.e. all named captures replaced with '*' and '**').
 * Any two patterns with the same signature are guaranteed to match the same set of strings.
 */
