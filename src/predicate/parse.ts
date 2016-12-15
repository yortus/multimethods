import {MultimethodError} from '../util';
const grammar: { parse(text: string): PredicateAST; } = require('./grammar');





/**
 * Verifies that `pattern` is a valid predicate pattern and returns abstract syntax information about the pattern.
 * Throws an error if `pattern` is not a valid predicate pattern. Consult the documentation for further information
 * about the predicate pattern syntax.
 * @param {string} pattern - the predicate pattern string to be parsed.
 * @returns {PredicatePatternAST} an object containing details about the successfully parsed pattern.
 */
export default function parse(source: string): PredicateAST {
    try {
        let ast = grammar.parse(source);
        ast.captureNames = ast.captures.filter(c => c !== '?'); // TODO: temp testing for PredicateClass compat - remove or integrate better
        return ast;
    }
    catch (ex) {
        let startCol = ex.location.start.column;
        let endCol = ex.location.end.column;
        if (endCol <= startCol) endCol = startCol + 1;
        let indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        throw new MultimethodError(`${ex.message}:\n${source}\n${indicator}`);
    }
}





/** Information associated with a successfully parsed predicate pattern string. */
export interface PredicateAST {


    /**
     * The predicate pattern in its normalized form (i.e. all named captures replaced with '*' and '…').
     * Any two predicates with the same signature are guaranteed to match the same set of strings.
     */
    signature: string;


    /**
     * TODO: ...
     */
    identifier: string;


    /**
     * An array of strings whose elements correspond, in order, to the captures in the predicate. Each element holds
     * the name of its corresponding capture, or '?' if the corresponding capture is anonymous (i.e. '*' or '…').
     * For example, the pattern '{...path}/*.{ext}' has a `captures` value of ['path', '?', 'ext'].
     */
    captures: string[];


    // TODO: doc...
    captureNames: string[];


    // TODO: doc...
    comment: string;
}
