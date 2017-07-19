import NormalPredicate from './normal-predicate';
import parse from './dsl-parser';





/** Asserts `source` is a valid predicate string and returns its normalised form. NB: may throw. */
export default function toNormalPredicate(source: string): NormalPredicate {

    // Parse the predicate to get AST information.
    let ast = parse(source);

    // Return the predicate's signature, which is its normal form.
    return ast.signature as NormalPredicate;
}
