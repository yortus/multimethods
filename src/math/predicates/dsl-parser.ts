import * as fatalError from '../../util/fatal-error';





// NB: dsl-grammar is a .js file that is built from a pegjs grammar. TSC can't see it, so `import` can't be used here.
// tslint:disable-next-line:no-var-requires
const grammar: { parse(text: string): PredicateAST; } = require('./dsl-grammar');





/**
 * Verifies that `source` is a valid predicate and returns abstract syntax information about the predicate.
 * Throws an error if `source` is not a valid predicate. Consult the documentation for further information
 * about the predicate DSL syntax [1].
 * [1] TODO...
 * @param {string} source - the source string to be parsed as a predicate.
 * @returns {PredicateAST} an object containing details about the successfully parsed predicate.
 */
export default function parse(source: string): PredicateAST {
    try {
        let ast = grammar.parse(source);
        return ast;
    }
    catch (ex) {
        let startCol = ex.location.start.column;
        let endCol = ex.location.end.column;
        if (endCol <= startCol) endCol = startCol + 1;
        let indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        return fatalError.PREDICATE_SYNTAX(`${ex.message}:\n${source}\n${indicator}`);
    }
}





/** Information associated with a successfully parsed predicate. */
export interface PredicateAST {


    /**
     * The predicate string in its normalized form (i.e. all named captures replaced with '*' and '**').
     * Any two predicates with the same signature are guaranteed to match the same set of strings.
     */
    signature: string; // TODO: rename this and referring comments to Normal or NormalForm


    /**
     * TODO: ...
     */
    identifier: string;


    /**
     * An array of strings whose elements correspond, in order, to the captures in the predicate. Each element holds
     * the name of its corresponding capture, or '?' if the corresponding capture is anonymous (i.e. '*' or '**').
     * For example, the predicate '{**path}/*.{ext}' has a `captures` value of ['path', '?', 'ext'].
     */
    captures: string[];


    // TODO: doc...
    captureNames: string[];
}
