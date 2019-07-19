import {isSubsetOf} from './is-subset-of';
import {Pattern} from './pattern';




/**
 * A pattern in normal form. Normalised patterns use a subset of the full pattern DSL syntax [1]. Every pattern corresponds
 * to exactly one normal form that defines the same set of values. Two distinct patterns that define the same set of
 * values are guaranteed to have the same normal form.
 * [1] TODO: ...
 */
export type NormalisedPattern = Pattern & { __normalisedPatternBrand: any };




/** Asserts `source` is a valid pattern string and returns its normalised form. NB: may throw. */
export function NormalisedPattern(source: string): NormalisedPattern {

    // Ensure we have a valid pattern.
    let pattern = Pattern(source);

    // Replace each named capture with a wildcard or globstar, as appropriate.
    let np = pattern.replace(/\{\*\*[^}]+\}/g, '**');
    np = np.replace(/\{[^*}]+\}/g, '*');

    // Remove alternatives that are subsets of other alternatives.
    let alts = np.split('|') as NormalisedPattern[];
    alts = getDistinctAlternatives(alts);

    // Order remaining alternatives lexicographically.
    alts.sort();
    np = alts.join('|');
    return np as NormalisedPattern;
}




/**
 * Returns an array containing a subset of the elements in `alts`, such that no pattern in the
 * returned array is a proper or improper subset of any other pattern in the returned array.
 * Assumes the specified patterns contain no named captures and no alternations.
 */
function getDistinctAlternatives(alts: NormalisedPattern[]): NormalisedPattern[] {

    // Set up a parallel array to flag patterns that are duplicates. Start by assuming none are.
    let isDuplicate = alts.map(_ => false);

    // Compare all patterns pairwise, marking as duplicates all those
    // patterns that are proper or improper subsets of any other pattern.
    for (let i = 0; i < alts.length; ++i) {
        if (isDuplicate[i]) continue;
        for (let j = 0; j < alts.length; ++j) {
            if (i === j || isDuplicate[j]) continue;
            isDuplicate[j] = isSubsetOf(alts[j], alts[i]);
        }
    }

    // Return only the non-duplicate patterns from the original list.
    return alts.filter((_, i) => !isDuplicate[i]);
}
