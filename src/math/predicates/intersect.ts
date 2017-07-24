import {NormalPredicate, Predicate, toNormalPredicate} from '../predicates';





/**
 * Computes the intersection of the two given predicates. The intersection recognizes a string if and only if that
 * string is recognized by *both* given predicates. Because intersections cannot in general be expressed as a single
 * predicate, the result is given as an array of normalized predicates, to be interpreted as follows:
 * (1) An empty array. This means the arguments represent disjoint predicates.
 *     That is, there are no strings that are recognized by both arguments.
 *     Example: 'foo' ∩ 'bar' = []
 * (2) An array with one element. This means the intersection may be represented
 *     by a single predicate, whose normalized predicate is contained in the array.
 *     Example: 'a*' ∩ '*b' = ['a*b']
 * (3) An array with multiple elements. The array contains a list of mutually disjoint predicates, the union
 *     of whose recognized strings are precisely those strings that are recognized by both of the arguments.
 *     Example: 'test.*' ∩ '*.js' = ['test.js', 'test.*.js']
 * @param {Predicate} a - lhs predicate to be intersected.
 * @param {Predicate} b - rhs predicate to be intersected.
 * @returns {NormalPredicate[]} - an array of normalized predicates representing the intersection of `a` and `b`.
 */
export default function intersect(a: Predicate, b: Predicate): NormalPredicate[] {
    let sa = simplify(toNormalPredicate(a));
    let sb = simplify(toNormalPredicate(b));
    let allIntersections = getAllIntersections(sa, sb);
    let distinctIntersections = getDistinctPredicates(allIntersections);
    let result = distinctIntersections.map(expand);
    return result;
}





/**
 * Computes all predicates that may be formed by unifying wildcards from one predicate with
 * substitutable substrings of the other predicate, such that all characters from both predicates
 * are present and in order in the result. All the predicates computed in this way represent
 * valid intersections of `a` and `b`. However, some may be duplicates or subsets of others.
 * @param {SimplePredicate} a - a simplified predicate.
 * @param {SimplePredicate} b - a simplified predicate.
 * @returns {SimplePredicate[]} - a list of simplified predicates that represent valid intersections of `a` and `b`.
 */
function getAllIntersections(a: SimplePredicate, b: SimplePredicate): SimplePredicate[] {

    // An empty predicate intersects only with another empty predicate or a single wildcard.
    if (a === '' || b === '') {
        let other = a || b;
        return other === '' || other === '*' || other === 'ᕯ' ? ['' as SimplePredicate] : [];
    }

    // `a` starts with a wildcard. Generate all possible intersections by unifying
    // the wildcard with all substitutable prefixes of `b`, then intersecting the remainders.
    else if (a[0] === 'ᕯ' || (a[0] === '*' && b[0] !== 'ᕯ')) {

        // Obtain all splits. When unifying splits against '*', do strength
        // reduction on split prefixes containing 'ᕯ' (ie replace 'ᕯ' with '*')
        let splits = getAllPredicateSplits(b);
        if (a[0] === '*') splits.forEach(pair => pair[0] = pair[0].replace(/ᕯ/g, '*') as SimplePredicate);

        // Compute and return intersections for all valid unifications. This is a recursive operation.
        let result = splits
            .filter(pair => a[0] === 'ᕯ' || (pair[0].indexOf('/') === -1 && pair[0].indexOf('ᕯ') === -1))
            .map(pair => getAllIntersections(a.slice(1) as SimplePredicate, pair[1]).map(u => pair[0] + u))
            .reduce((ar, el) => (ar.push.apply(ar, el), ar), []);
        return result as SimplePredicate[];
    }

    // `b` starts with a wildcard. Delegate to previous case by swapping arguments (since intersection is commutative).
    else if (b[0] === 'ᕯ' || b[0] === '*') {
         return getAllIntersections(b, a);
    }

    // Both predicates start with the same literal. Intersect their remainders recursively.
    else if (a[0] === b[0]) {
        let result = getAllIntersections(a.slice(1) as SimplePredicate, b.slice(1) as SimplePredicate)
            .map(u => a[0] + u);
        return result as SimplePredicate[];
    }

    // If we get here, `a` and `b` must be disjoint.
    return [];
}





/**
 * Returns an array of all the [prefix, suffix] pairs into which `predicate` may be split. Splits that occur on a
 * wildcard character have the wildcard on both sides of the split (i.e. as the last character of the prefix and the
 * first character of the suffix). E.g., 'abᕯc' splits into: ['','abᕯc'], ['a','bᕯc'], ['abᕯ','ᕯc'], and ['abᕯc',''].
 */
function getAllPredicateSplits(predicate: SimplePredicate): Array<[SimplePredicate, SimplePredicate]> {
    let result = [] as Array<[SimplePredicate, SimplePredicate]>;
    for (let i = 0; i <= predicate.length; ++i) {
        let pair = [predicate.substring(0, i), predicate.substring(i)];
        if (predicate[i] === 'ᕯ' || predicate[i] === '*') {
            pair[0] += predicate[i];
            ++i; // skip next iteration
        }
        result.push(pair as any);
    }
    return result;
}





/**
 * Returns an array containing a subset of the elements in `predicates`, such that no predicate in
 * the returned array is a proper or improper subset of any other predicate in the returned array.
 */
function getDistinctPredicates(predicates: SimplePredicate[]): SimplePredicate[] {

    // Set up a parallel array to flag predicates that are duplicates. Start by assuming none are.
    let isDuplicate = predicates.map(_ => false);

    // Compare all predicates pairwise, marking as duplicates all those
    // predicates that are proper or improper subsets of any other predicate.
    for (let i = 0; i < predicates.length; ++i) {
        if (isDuplicate[i]) continue;
        let subsetRecogniser = makeSubsetRecogniser(predicates[i]);
        for (let j = 0; j < predicates.length; ++j) {
            if (i === j || isDuplicate[j]) continue;
            isDuplicate[j] = subsetRecogniser.test(predicates[j]);
        }
    }

    // Return only the non-duplicate predicates from the original list.
    return predicates.filter((_, i) => !isDuplicate[i]);
}





/**
 * Returns a regular expression that matches all predicates that
 * are proper or improper subsets of the specified predicate.
 */
function makeSubsetRecogniser(predicate: SimplePredicate) {
    let re = predicate.split('').map(c => {
        if (c === '*') return '[^\\/ᕯ]*';
        if (c === 'ᕯ') return '.*';
        if (' /._-'.indexOf(c) !== -1) return `\\${c}`; // NB: these chars need escaping in a regex
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}





// TODO: temp testing... internal concept; makes the algos in this file simpler
// TODO: doc... a simplified predicate is normalised with multichar symbols replaced by single chars (** => ᕯ).
type SimplePredicate = NormalPredicate & { __simplePredicateBrand: any };
function simplify(p: NormalPredicate) {
    return p.replace(/\*\*/g, 'ᕯ') as SimplePredicate;
}
function expand(p: SimplePredicate) {
    return p.replace(/ᕯ/g, '**') as NormalPredicate;
}
