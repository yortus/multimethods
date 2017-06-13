// TODO: `tieBreakFn` should be passed in or somehow provided from outside, with builtin fallback/default impl as below.
import {fatalError} from '../util';
import MultimethodOptions from './multimethod-options';
import Rule from './rule';





/**
 * Returns a copy of the given rule list, sorted from least- to most-specific. All rules in the rule list are assumed
 * to have equal specificity (i.e., their normalized patterns are identical). As such, there is no inherent way to
 * recognize their relative specificity. This is where the client-supplied 'tiebreak' function is used. It must provide
 * an unambiguous order in all cases where rules are otherwise of identical specificity.
 * @param {Rule[]} candidates - the list of rules of equal specificity to be sorted.
 * @returns {Rule[]} a copy of the given rule list, sorted from least- to most-specific.
 */
export default function disambiguateRules(candidates: Rule[], normalisedOptions: MultimethodOptions): Rule[] {
    const ruleComparator = makeRuleComparator(normalisedOptions.moreSpecific);
    return candidates.slice().sort(ruleComparator);
}





// TODO: ...
function makeRuleComparator(tieBreakFn: (a: Rule, b: Rule) => Rule|undefined) {

    /** Performs pairwise sorting of two rules, using the convention of Array#sort's `compareFn` parameter. */
    return function ruleComparator(ruleA: Rule, ruleB: Rule) {

        // TODO: special case: a metarule is *always* less specific than a normal rule with the same predicate
        if (!ruleA.isMetaRule && ruleB.isMetaRule) return 1;  // A is more specific
        if (ruleA.isMetaRule && !ruleB.isMetaRule) return -1; // B is more specific

        // TODO: general case: use the client-suppied `moreSpecific` function to determine which is more specific...
        let moreSpecificRule = tieBreakFn(ruleA, ruleB);
        if (moreSpecificRule !== ruleA && moreSpecificRule !== ruleB) {
            return fatalError('AMBIGUOUS_RULE_ORDER', ruleA.predicate, ruleB.predicate);
        }
        if (moreSpecificRule !== tieBreakFn(ruleB, ruleA)) {
            return fatalError('UNSTABLE_RULE_ORDER', ruleA.predicate, ruleB.predicate);
        }

        return ruleA === moreSpecificRule ? 1 : -1; // NB: sorts from least- to most-specific
    }
}
