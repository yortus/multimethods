




/**
 * Computes the intersection of the two given predicate patterns. The intersection recognizes a string if and only if
 * that string is recognized by *both* arguments. Because intersections cannot in general be expressed as a single
 * predicate, the result is given as an array of normalized predicate patterns, to be interpreted as follows:
 * (1) An empty array. This means the arguments represent disjoint predicates.
 *     That is, there are no strings that are recognized by both arguments.
 *     Example: 'foo' ∩ 'bar' = []
 * (2) An array with one element. This means the intersection may be represented
 *     by a single predicate, whose normalized pattern is contained in the array.
 *     Example: 'a*' ∩ '*b' = ['a*b']
 * (3) An array with multiple elements. The array contains a list of mutually disjoint predicate patterns, the union
 *     of whose recognized strings are precisely those strings that are recognized by both of the arguments.
 *     Example: 'test.*' ∩ '*.js' = ['test.js', 'test.*.js']
 * @param {string} a - a normalized predicate pattern.
 * @param {string} b - a normalized predicate pattern.
 * @returns {string[]} - an array of normalized patterns representing the intersection of `a` and `b`.
 */
export default function intersectPredicatePatterns(a: string, b: string): string[] {
    let allIntersections = getAllIntersections(a, b);
    let distinctIntersections = getDistinctPatterns(allIntersections);
    return distinctIntersections;
}





/**
 * Computes all patterns that may be formed by unifying wildcards from one pattern with
 * substitutable substrings of the other pattern, such that all characters from both patterns
 * are present and in order in the result. All the patterns computed in this way represent
 * valid intersections of `a` and `b`. However, some may be duplicates or subsets of others.
 * @param {string} a - a normalized predicate pattern.
 * @param {string} b - a normalized predicate pattern.
 * @returns {string[]} - a list of normalized predicate patterns that represent valid intersections of `a` and `b`.
 */
function getAllIntersections(a: string, b: string): string[] {

    // An empty pattern intersects only with another empty pattern or a single wildcard.
    if (a === '' || b === '') {
        let other = a || b;
        return other === '' || other === '*' || other === '…' ? [''] : [];
    }

    // `a` starts with a wildcard. Generate all possible intersections by unifying
    // the wildcard with all substitutable prefixes of `b`, and intersecting the remainders.
    else if (a[0] === '…' || (a[0] === '*' && b[0] !== '…')) {

        // Obtain all splits. When unifying splits against '*', do strength
        // reduction on split prefixes containing '…' (ie replace '…' with '*')
        let splits = getAllPatternSplits(b);
        if (a[0] === '*') splits.forEach(pair => pair[0] = pair[0].replace(/…/g, '*'));

        // Compute and return intersections for all valid unifications. This is a recursive operation.
        return splits
            .filter(pair => a[0] === '…' || (pair[0].indexOf('/') === -1 && pair[0].indexOf('…') === -1))
            .map(pair => getAllIntersections(a.slice(1), pair[1]).map(u => pair[0] + u))
            .reduce((ar, el) => (ar.push.apply(ar, el), ar), []);
    }

    // `b` starts with a wildcard. Delegate to previous case by swapping arguments (since intersection is commutative).
    else if (b[0] === '…' || b[0] === '*') {
         return getAllIntersections(b, a);
    }

    // Both patterns start with the same literal. Intersect their remainders recursively.
    else if (a[0] === b[0]) {
        return getAllIntersections(a.slice(1), b.slice(1)).map(u => a[0] + u);
    }

    // If we get here, `a` and `b` must be disjoint.
    return [];
}





/**
 * Returns an array of all the [prefix, suffix] pairs into which `pattern` may be split. Splits that occur on a wildcard
 * character have the wildcard on both sides of the split (i.e. as the last character of the prefix and the first
 * character of the suffix). E.g., 'ab…c' splits into: ['','ab…c'], ['a','b…c'], ['ab…','…c'], and ['ab…c',''].
 */
function getAllPatternSplits(pattern: string): [string, string][] {
    let result = [];
    for (let i = 0; i <= pattern.length; ++i) {
        let pair: [string, string] = [pattern.substring(0, i), pattern.substring(i)];
        if (pattern[i] === '…' || pattern[i] === '*') {
            pair[0] += pattern[i];
            ++i; // skip next iteration
        }
        result.push(pair);
    }
    return result;
}





/**
 * Returns an array containing a subset of the elements in `patterns`, such that no pattern in
 * the returned array is a proper or improper subset of any other pattern in the returned array.
 */
function getDistinctPatterns(patterns: string[]) {

    // Set up a parallel array to flag patterns that are duplicates. Start by assuming none are.
    let isDuplicate = patterns.map(_ => false);

    // Compare all patterns pairwise, marking as duplicates all those
    // patterns that are proper or improper subsets of any other pattern.
    for (let i = 0; i < patterns.length; ++i) {
        if (isDuplicate[i]) continue;
        let subsetRecogniser = makeSubsetRecogniser(patterns[i]);
        for (let j = 0; j < patterns.length; ++j) {
            if (i === j || isDuplicate[j]) continue;
            isDuplicate[j] = subsetRecogniser.test(patterns[j]);
        }
    }

    // Return only the non-duplicate patterns from the original list.
    return patterns.filter((_, i) => !isDuplicate[i]);
}





/**
 * Returns a regular expression that matches all predicate patterns that
 * are proper or improper subsets of the specified predicate pattern.
 */
function makeSubsetRecogniser(pattern: string) {
    let re = pattern.split('').map(c => {
        if (c === '*') return '[^\\/…]*';
        if (c === '…') return '.*';
        if (' /._-'.indexOf(c) !== -1) return `\\${c}`;
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}
