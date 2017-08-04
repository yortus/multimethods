import * as fatalError from '../../util/fatal-error';
import intersect from './intersect';
// TODO: was... remove... import NONE from './none';
import NormalPredicate from './normal-predicate';





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
        normaliseAlternatives(ast);
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





// TODO: doc... modifies ast in-place
//       - remove alternatives that are subsets of other alternatives
//         !!! and adjust captures[] accordingly !!! (captureNames will be empty)
//       - order remaining alternatives lexicographically
function normaliseAlternatives(ast: PredicateAST) {

    // TODO: hacky!!!...
    //       - factor out normalisation logic so we don't call `intersect` here
    //       - and don't re-parse
    if (ast.signature.indexOf('|') === -1) return;
    let x = intersect('**' as NormalPredicate, ast.signature as NormalPredicate);

    let asts = x.split('|').map(parse);
    ast.signature = asts.map(a => a.signature).join('|');
    ast.identifier = asts.map(a => a.identifier).join('ǀ'); // (U+01C0)
    ast.captures = ([] as string[]).concat(...asts.map(a => a.captures));


// TODO: was...
    // let sigParts = ast.signature.split('|');
    // let idParts = ast.identifier.split('ǀ'); // (U+01C0)
    // let parts = sigParts.map((sig, i) => ({sig, id: idParts[i]}));
    // parts.sort((partA, partB) => {
    //     // Ensure the two parts are mutually-disjoint
    //     if (intersect(partA.sig as NormalPredicate, partB.sig as NormalPredicate) !== NONE) {
    //         throw new Error(`Predicate alternatives must be mutually-disjoint`);
    //     }
    //     return partA.sig.localeCompare(partB.sig);
    // });
    // ast.signature = parts.map(part => part.sig).join('|');
    // ast.identifier = parts.map(part => part.id).join('ǀ'); // (U+01C0)
}
