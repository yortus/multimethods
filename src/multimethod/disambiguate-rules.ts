// TODO: `tieBreakFn` should be passed in or somehow provided from outside, with builtin fallback/default impl as below.
import {warn, MultimethodError} from '../util';
import {inspect} from 'util';
import Rule from './rule';





/**
 * Returns a copy of the given rule list, sorted from least- to most-specific. All rules in the rule list are assumed
 * to have equal specificity (i.e., their normalized patterns are identical). As such, there is no inherent way to
 * recognize their relative specificity. This is where the client-supplied 'tiebreak' function is used. It must provide
 * an unambiguous order in all cases where rules are otherwise of identical specificity.
 * @param {Rule[]} candidates - the list of rules of equal specificity to be sorted.
 * @returns {Rule[]} a copy of the given rule list, sorted from least- to most-specific.
 */
export default function disambiguateRules(candidates: Rule[]): Rule[] {
    return candidates.slice().sort(ruleComparator);
}





/** Performs pairwise sorting of two rules, using the convention of Array#sort's `compareFn` parameter. */
function ruleComparator(ruleA: Rule, ruleB: Rule) {
    let moreSpecificRule = tieBreakFn(ruleA, ruleB);
    let ruleDiagnostics = `A: ${inspect(ruleA)}, B: ${inspect(ruleB)}`;

    // TODO: if with curlies...
    let message = `Ambiguous rule ordering - which is more specific of A and B? ${ruleDiagnostics}`;
    if (moreSpecificRule !== ruleA && moreSpecificRule !== ruleB) throw new MultimethodError(message);

    // TODO: if with curlies...
    // TODO: error or warning?...
    message = `Unstable rule ordering - tiebreak function is inconsist: A>B ≠ B<A for ${ruleDiagnostics}.`;
    if (moreSpecificRule !== tieBreakFn(ruleB, ruleA)) warn(message);

    return ruleA === moreSpecificRule ? 1 : -1; // NB: sorts from least- to most-specific
}





/** Default implementation for returning the more-specific of the two given rules. */
function tieBreakFn(a: Rule, b: Rule): Rule | undefined {

    // All else being equal, a normal rule is more specific than a meta-rule.
    if (!a.isMetaRule && b.isMetaRule) return a;
    if (!b.isMetaRule && a.isMetaRule) return b;

    // All else being equal, localeCompare of pattern comments provides the rule order (comes before == more specific).
    if (a.predicate.comment.localeCompare(b.predicate.comment) < 0) return a;
    if (b.predicate.comment.localeCompare(a.predicate.comment) < 0) return b;

    // TODO: explain...
    return undefined;
}
