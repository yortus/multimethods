import * as fatalError from '../../util/fatal-error';
import hasNamedCaptures from './has-named-captures';
import intersect from './intersect';
import NormalPredicate from './normal-predicate';
import Predicate from './predicate';





// NB: dsl-grammar is a .js file that is built from a pegjs grammar. TSC can't see it, so `import` can't be used here.
// tslint:disable-next-line:no-var-requires
const grammar: { parse(text: string): string; } = require('./dsl-grammar');





/**
 * Verifies that `source` is a valid predicate and returns abstract syntax information about the predicate.
 * Throws an error if `source` is not a valid predicate. Consult the documentation for further information
 * about the predicate DSL syntax [1].
 * [1] TODO...
 * @param {string} source - the source string to be parsed as a predicate.
 * @returns {PredicateAST} an object containing details about the successfully parsed predicate.
 */
export default function parse(source: string): string {
    try {
        let signature = grammar.parse(source);

        // TODO: hacky, put this somewhere properly...
        let hasAlternatives = signature.indexOf('|') !== -1;
        let hasNamedCaps = hasNamedCaptures(source as Predicate);
        if (hasAlternatives && hasNamedCaps) {
            throw new Error('Predicate cannot contain both alternation and named captures');
        }
        signature = normaliseAlternatives(signature);
        return signature;
    }
    catch (ex) {
        let startCol = ex.location ? ex.location.start.column : 0;
        let endCol = ex.location ? ex.location.end.column : source.length;
        if (endCol <= startCol) endCol = startCol + 1;
        let indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        return fatalError.PREDICATE_SYNTAX(`${ex.message}:\n${source}\n${indicator}`);
    }
}





// TODO: revise comments...
/** Information associated with a successfully parsed predicate. */
/**
 * The predicate string in its normalized form (i.e. all named captures replaced with '*' and '**').
 * Any two predicates with the same signature are guaranteed to match the same set of strings.
 */





// TODO: doc... modifies ast in-place
//       - remove alternatives that are subsets of other alternatives
//         !!! and adjust captures[] accordingly !!! (captureNames will be empty)
//       - order remaining alternatives lexicographically
function normaliseAlternatives(signature: string) {

    // TODO: hacky!!!...
    //       - factor out normalisation logic so we don't call `intersect` here
    //       - and don't re-parse
    let hasAlternatives = signature.indexOf('|') !== -1;
    if (!hasAlternatives) return signature;
    let x = intersect('**' as NormalPredicate, signature as NormalPredicate);

    let asts = x.split('|').map(parse);
    signature = asts.map(a => a).join('|');
    return signature;
}
