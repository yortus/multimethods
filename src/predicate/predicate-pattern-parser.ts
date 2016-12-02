// TODO: review all comments in this file for accurate terminology
import {MultimethodError} from '../util';
const patternSourceGrammar: { parse(text: string): PredicatePatternAST; } = require('./predicate-pattern-grammar');





/**
 * Verifies that `patternSource` has a valid format, and returns abstract syntax information about the pattern. Throws
 * an error if `patternSource` is invalid. Consult the documentation for further information about the pattern DSL.
 * @param {string} pattern - the pattern source string to be parsed.
 * @returns {PatternAST} an object containing details about the successfully parsed pattern.
 */
export default function parsePredicatePattern(pattern: string): PredicatePatternAST {
    try {
        let ast = patternSourceGrammar.parse(pattern);
        return ast;
    }
    catch (ex) {
        let startCol = ex.location.start.column;
        let endCol = ex.location.end.column;
        if (endCol <= startCol) endCol = startCol + 1;
        let indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        throw new MultimethodError(`${ex.message}:\n${pattern}\n${indicator}`);
    }
}





/** Holds the information associated with a successfully parsed pattern source string. */
export interface PredicatePatternAST {


    /**
     * The pattern in its normalized form (i.e. all named captures replaced with '*' and '…').
     * Any two patterns with the same signature are guaranteed to match the same set of strings.
     */
    signature: string;


    /**
     * TODO: ...
     */
    identifier: string;

    /**
     * An array of strings whose elements correspond, in order, to the captures in the pattern. Each element holds the
     * name of its corresponding capture, or '?' if the corresponding capture is anonymous (i.e. '*' or '…'). For
     * example, the pattern '{...path}/*.{ext}' has a `captures` value of ['path', '?', 'ext'].
     */
    captures: string[];
}
