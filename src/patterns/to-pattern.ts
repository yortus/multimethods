import {fatalError} from '../util';
import {hasNamedCaptures} from './has-named-captures';
import {parse} from './parse';
import {Pattern} from './pattern';




/**
 * Verifies that `source` is a valid pattern and returns abstract syntax information about the pattern.
 * Throws an error if `source` is not a valid pattern. Consult the documentation for further information
 * about the pattern DSL syntax [1].
 * [1] TODO...
 * @param {string} source - the source string to be parsed as a pattern.
 * @returns {Pattern} a successfully parsed pattern.
 */
export function toPattern(source: string): Pattern {
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
        return fatalError.PATTERN_SYNTAX(`${ex.message}:\n${source}\n${indicator}`);
    }
}




// TODO: revise comments...
/** Information associated with a successfully parsed pattern. */
/**
 * The pattern string in its normalized form (i.e. all named captures replaced with '*' and '**').
 * Any two patterns with the same signature are guaranteed to match the same set of strings.
 */
