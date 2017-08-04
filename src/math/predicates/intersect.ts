import NONE from './none';
import NormalPredicate from './normal-predicate';
import toNormalPredicate from './to-normal-predicate';





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
 * @param {NormalPredicate} a - lhs predicate to be intersected.
 * @param {NormalPredicate} b - rhs predicate to be intersected.
 * @returns {NormalPredicate} - The normalized predicate representing the intersection of `a` and `b`.
 */
export default function intersect(a: NormalPredicate, b: NormalPredicate): NormalPredicate {

    // Compute the intersections of every alternative of `a` with every alternative of `b`.
    let aAlts = a === NONE ? [] : simplify(a).split('|');
    let bAlts = b === NONE ? [] : simplify(b).split('|');
    let allIntersections = [] as SimplePredicate[];
    for (let altA of aAlts) {
        for (let altB of bAlts) {
            let moreIntersections = getAllIntersections(altA as SimplePredicate, altB as SimplePredicate);
            allIntersections = allIntersections.concat(moreIntersections);
        }
    }

    // Finalise the result.
    if (allIntersections.length === 0) return NONE;
    let result = toNormalPredicate(allIntersections.map(expand).join('|'));
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





// TODO: temp testing... internal concept; makes the algos in this file simpler
// TODO: doc... a simplified predicate is normalised with multichar symbols replaced by single chars (ie, ** => ᕯ).
type SimplePredicate = NormalPredicate & { __simplePredicateBrand: any };
function simplify(p: NormalPredicate) {
    return p.replace(/\*\*/g, 'ᕯ') as SimplePredicate;
}
function expand(p: SimplePredicate) {
    return p.replace(/ᕯ/g, '**') as NormalPredicate;
}
