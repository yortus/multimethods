import NormalPredicate from './normal-predicate';
import parse from './dsl-parser';
import Predicate from './predicate';





/** Return the normal form of the given predicate. */
export default function toNormalPredicate(predicate: Predicate): NormalPredicate {

    // Parse the predicate to get AST information.
    let ast = parse(predicate);

    // Return the predicate's signature, which is its normal form.
    return ast.signature as NormalPredicate;
}
