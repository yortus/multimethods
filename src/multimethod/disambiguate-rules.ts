import {fatalError} from '../util';
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





// TODO: doc... sort from least- to most-specific
/** Performs pairwise sorting of two rules, using the convention of Array#sort's `compareFn` parameter. */
function ruleComparator(ruleA: Rule, ruleB: Rule) {

    // Comparing a metarule and a regular rule: the metarule is always less specific.
    if (!ruleA.isMetaRule && ruleB.isMetaRule) return 1;  // A is more specific
    if (ruleA.isMetaRule && !ruleB.isMetaRule) return -1; // B is more specific

    // Comparing two regular rules in the same chain: the leftmost one is more specific.
    // Comparing two metarules in the same chain: the leftmost one is less specific.
    let chain = ruleA.chain;
    if (!!chain && chain === ruleB.chain) {
        let leftmostRule = chain.indexOf(ruleA.method) < chain.indexOf(ruleB.method) ? ruleA : ruleB;
        return (leftmostRule === ruleA ? 1 : -1) * (ruleA.isMetaRule ? -1 : 1);
    }

    // Anything else is ambiguous
    return fatalError('AMBIGUOUS_RULE_ORDER', ruleA.predicate, ruleB.predicate);
}
