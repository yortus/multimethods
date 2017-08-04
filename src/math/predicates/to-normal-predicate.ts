import NormalPredicate from './normal-predicate';
import toPredicate from './to-predicate';





/** Asserts `source` is a valid predicate string and returns its normalised form. NB: may throw. */
export default function toNormalPredicate(source: string): NormalPredicate {

    // Ensure we have a valid predicate.
    let predicate = toPredicate(source);

    // Replace each named capture with a wildcard or globstar, as appropriate.
    let np = predicate.replace(/\{\*\*[^}]+\}/g, '**');
    np = np.replace(/\{[^*}]+\}/g, '*');

    // Remove alternatives that are subsets of other alternatives.
    let alts = np.split('|');
    alts = getDistinctPredicates(alts);

    // Order remaining alternatives lexicographically.
    alts.sort();
    np = alts.join('|');
    return np as NormalPredicate;
}





/**
 * Returns an array containing a subset of the elements in `predicates`, such that no predicate in
 * the returned array is a proper or improper subset of any other predicate in the returned array.
 * Assumes the specified predicates contain no named captures.
 */
function getDistinctPredicates(predicates: string[]): string[] {

    // To simplify the regex used in here, replace '**' with 'ᕯ' in all predicates so we don't need any lookahead.
    predicates = predicates.map(p => p.replace(/\*\*/g, 'ᕯ'));

    // Set up a parallel array to flag predicates that are duplicates. Start by assuming none are.
    let isDuplicate = predicates.map(_ => false);

    // Compare all predicates pairwise, marking as duplicates all those
    // predicates that are proper or improper subsets of any other predicate.
    for (let i = 0; i < predicates.length; ++i) {
        if (isDuplicate[i]) continue;

        // Build a regex that matches all predicates that are proper or improper subsets of the specified predicate.
        let re = predicates[i].split('').map(c => {
            if (c === '*') return '[^\\/ᕯ]*';
            if (c === 'ᕯ') return '.*';
            if (' /._-'.indexOf(c) !== -1) return `\\${c}`; // NB: these chars need escaping in a regex
            return c;
        }).join('');
        let subsetRecogniser = new RegExp(`^${re}$`);

        // TODO: doc...
        for (let j = 0; j < predicates.length; ++j) {
            if (i === j || isDuplicate[j]) continue;
            isDuplicate[j] = subsetRecogniser.test(predicates[j]);
        }
    }

    // Return only the non-duplicate predicates from the original list, with 'ᕯ' changed back to '**'
    return predicates.filter((_, i) => !isDuplicate[i]).map(p => p.replace(/ᕯ/g, '**'));
}
