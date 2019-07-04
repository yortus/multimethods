import {isSubsetOf} from './is-subset-of';
import {NormalPredicate} from './normal-predicate';
import {toPredicate} from './to-predicate';





/** Asserts `source` is a valid predicate string and returns its normalised form. NB: may throw. */
export function toNormalPredicate(source: string): NormalPredicate {

    // Ensure we have a valid predicate.
    let predicate = toPredicate(source);

    // Replace each named capture with a wildcard or globstar, as appropriate.
    let np = predicate.replace(/\{\*\*[^}]+\}/g, '**');
    np = np.replace(/\{[^*}]+\}/g, '*');

    // Remove alternatives that are subsets of other alternatives.
    let alts = np.split('|') as NormalPredicate[];
    alts = getDistinctAlternatives(alts);

    // Order remaining alternatives lexicographically.
    alts.sort();
    np = alts.join('|');
    return np as NormalPredicate;
}





/**
 * Returns an array containing a subset of the elements in `alts`, such that no predicate in the
 * returned array is a proper or improper subset of any other predicate in the returned array.
 * Assumes the specified predicates contain no named captures and no alternations.
 */
function getDistinctAlternatives(alts: NormalPredicate[]): NormalPredicate[] {

    // Set up a parallel array to flag predicates that are duplicates. Start by assuming none are.
    let isDuplicate = alts.map(_ => false);

    // Compare all predicates pairwise, marking as duplicates all those
    // predicates that are proper or improper subsets of any other predicate.
    for (let i = 0; i < alts.length; ++i) {
        if (isDuplicate[i]) continue;
        for (let j = 0; j < alts.length; ++j) {
            if (i === j || isDuplicate[j]) continue;
            isDuplicate[j] = isSubsetOf(alts[j], alts[i]);
        }
    }

    // Return only the non-duplicate predicates from the original list.
    return alts.filter((_, i) => !isDuplicate[i]);
}
