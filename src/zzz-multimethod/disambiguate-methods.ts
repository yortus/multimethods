import {warn, RoutistError} from '../util';
import {inspect} from 'util';
import Method from './method';
// TODO: `tieBreakFn` should be passed in or somehow provided from outside, with builtin fallback/default impl as below.





/**
 * Returns a copy of the given rule list, sorted from least- to most-specific. All rules in the rule list are assumed to
 * have equal specificity (i.e., their normalized patterns are the same). As such, there is no inherent way to recognise
 * their relative specificity. This is where the client-supplied 'tiebreak' function is used. It must provide an
 * unambiguous order in all cases where rules are otherwise of equivalent specificity.
 * @param {Method[]} candidates - the list of rule of equal specificity to be sorted.
 * @returns {Method[]} a copy of the given rule list, sorted from least- to most-specific.
 */
export default function disambiguateMethods(candidates: Method[]): Method[] {
    return candidates.slice().sort(methodComparator);
}





/** Performs pairwise sorting of two methods, using the convention of Array#sort's `compareFn` parameter. */
function methodComparator(methodA: Method, methodB: Method) {
    let moreSpecificMethod = tieBreakFn(methodA, methodB);
    let methodDiagnostics = `A: ${inspect(methodA)}, B: ${inspect(methodB)}`;

    // TODO: if with curlies...
    let message = `Ambiguous method ordering - which is more specific of A and B? ${methodDiagnostics}`;
    if (moreSpecificMethod !== methodA && moreSpecificMethod !== methodB) throw new RoutistError(message);

    // TODO: if with curlies...
    // TODO: error or warning?...
    message = `Unstable method ordering - tiebreak function is inconsist: A>B ≠ B<A for ${methodDiagnostics}.`;
    if (moreSpecificMethod !== tieBreakFn(methodB, methodA)) warn(message);

    return methodA === moreSpecificMethod ? 1 : -1; // NB: sorts from least- to most-specific
}





/** Returns the more-specific of the two given methods. */
function tieBreakFn(a: Method, b: Method): Method {

    // All else being equal, a non-decorator is more specific than a decorator.
    if (!a.isDecorator && b.isDecorator) return a;
    if (!b.isDecorator && a.isDecorator) return b;

    // All else being equal, localeCompare of pattern comments provides the method order (comes before == more specific).
    if (a.predicate.comment.localeCompare(b.predicate.comment) < 0) return a;
    if (b.predicate.comment.localeCompare(a.predicate.comment) < 0) return b;
}
