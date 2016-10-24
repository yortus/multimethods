




/**
 * Computes the intersection of `this` pattern and the `other` pattern. The intersection recognizes a string if and only
 * if that string is recognized by *both* the input patterns. Because the intersection cannot generally be expressed as
 * a single pattern, the result is given as an array of normalized patterns, as follows:
 * (1) An empty array - this means the input patterns are disjoint, i.e. there are no strings that are recognized by
 *     both input patterns. E.g., foo ∩ bar = []
 * (2) An array with one pattern - this means the intersection can be represented by the single pattern contained in the
 *     array. E.g. a* ∩ *b = [a*b]
 * (3) An array of multiple patterns - the array contains a list of mutually-disjoint patterns, the union of whose
 *     recognized strings are precisely those strings that are recognized by both input patterns.
 *     E.g. test.* ∩ *.js = [test.js, test.*.js]
 * @param {Pattern} other - a pattern instance. May or may not be normalized.
 * @returns {Pattern[]} - an array of normalized patterns representing the intersection of the input patterns.
 */
export default function intersectPatterns(a: string, b: string): string[] {
    let allIntersections = getAllIntersections(a, b);
    let distinctIntersections = getDistinctPatterns(allIntersections);
    return distinctIntersections;
}





/**
 * Computes all patterns that may be formed by unifying wildcards from one pattern with substitutable substrings of the
 * other pattern such that all characters from both patterns are present and in order in the result. All the patterns
 * computed in this way represent valid intersections of A and B, however some may be duplicates or subsets of others.
 * @param {string} a - source string of a normalized pattern.
 * @param {string} b - source string of a normalized pattern.
 * @returns {string[]} - list of normalized patterns that represent valid intersections of `a` and `b`.
 */
function getAllIntersections(a: string, b: string): string[] {

    // An empty pattern intersects only with another empty pattern or a single wildcard.
    if (a === '' || b === '') {
        let other = a || b;
        return other === '' || other === '*' || other === '…' ? [''] : [];
    }

    // A starts with a wildcard. Generate all possible intersections by unifying
    // the wildcard with all substitutable prefixes of B, and intersecting the remainders.
    else if (a[0] === '…' || (a[0] === '*' && b[0] !== '…')) {

        // Obtain all splits. When unifying splits against '*', do strength
        // reduction on split prefixes containing '…' (ie replace '…' with '*')
        let splits = getAllPatternSplits(b);
        if (a[0] === '*') splits.forEach(pair => pair[0] = pair[0].replace(/…/g, '*'));

        // Compute and return intersections for all valid unifications.
        return splits
            .filter(pair => a[0] === '…' || (pair[0].indexOf('/') === -1 && pair[0].indexOf('…') === -1))
            .map(pair => getAllIntersections(a.slice(1), pair[1]).map(u => pair[0] + u))
            .reduce((ar, el) => (ar.push.apply(ar, el), ar), []);
    }

    // B starts with a wildcard. Delegate to previous case (intersection is commutative).
    else if (b[0] === '…' || b[0] === '*') {
         return getAllIntersections(b, a);
    }

    // Both patterns start with the same literal. Intersect their remainders recursively.
    else if (a[0] === b[0]) {
        return getAllIntersections(a.slice(1), b.slice(1)).map(u => a[0] + u);
    }

    // A and B are disjoint.
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
 * Returns an array containing a subset of the elements in `patterns`, such that no pattern in the returned array is a
 * (proper or improper) subset of any other pattern in the returned array.
 */
function getDistinctPatterns(patterns: string[]) {

    // Set up a parallel array to flag which patterns are duplicates.
    // Start by assuming none are.
    let isDuplicate = patterns.map(u => false);

    // Compare all patterns pairwise, marking as duplicates all those
    // patterns that are (proper or improper) subsets of another pattern.
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





/** Returns a regular expression that matches all pattern strings that are (proper or improper) subsets of `pattern`. */
function makeSubsetRecogniser(pattern: string) {
    let re = pattern.split('').map(c => {
        if (c === '*') return '[^\\/…]*';
        if (c === '…') return '.*';
        if (' /._-'.indexOf(c) !== -1) return `\\${c}`;
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}
