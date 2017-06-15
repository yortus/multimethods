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





/** Performs pairwise sorting of two rules, using the convention of Array#sort's `compareFn` parameter. */
function ruleComparator(ruleA: Rule, ruleB: Rule) {

// TODO: was... removing this logic in favour of simpler chaining rule:
// - rules are ambiguous unless they belong to the same chain
// - within a chain, rules to the left execute *before* rules to the right, regardless of regular vs meta
// TODO: NEEDS TEST CASES TO PROVE IT IS A SOUND STRATEGY AND CODE DOES WHAT IS EXPECTED IN ALL CASES
    // TODO: special case: a metarule is *always* less specific than a normal rule with the same predicate
    if (!ruleA.isMetaRule && ruleB.isMetaRule) return 1;  // A is more specific
    if (ruleA.isMetaRule && !ruleB.isMetaRule) return -1; // B is more specific

// TODO: temp testing... chains...
// if both belong to the same chain, then comparison is done by their relative position in the chain:
// - regular handlers: the left-most rule in the chain is the most specific (i.e. executed *before* handlers to its right)
// - meta handlers: the left-most rule in the chain is the least specific (i.e. executed *before* handlers to its right)
let chain = ruleA.chain;
if (!!chain && chain === ruleB.chain) {
    let leftmostRule = chain.indexOf(ruleA.method) < chain.indexOf(ruleB.method) ? ruleA : ruleB;
    return (leftmostRule === ruleA ? 1 : -1) * (ruleA.isMetaRule ? -1 : 1);
}

// TODO: explain...
    return fatalError('AMBIGUOUS_RULE_ORDER', ruleA.predicate, ruleB.predicate);
}
