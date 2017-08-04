import parse from './dsl-parser';
import NormalPredicate from './normal-predicate';





/** Asserts `source` is a valid predicate string and returns its normalised form. NB: may throw. */
export default function toNormalPredicate(source: string): NormalPredicate {

    // DON'T parse! Assuming we have a valid predicate, the transform is:
    // 1. {**name} ==> **
    // 2. {name} ==> *
    // 3. normaliseAlternatives




    // Parse the predicate to get AST information.
    let ast = parse(source);

    // Return the predicate's signature, which is its normal form.
    return ast as NormalPredicate;
}
