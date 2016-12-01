// TODO: better explain how/why this works in external documentation (esp. the synthesized 'crasher' method).
import {getLongestCommonPrefix, MultimethodError} from '../util';
import Pattern from '../predicate';
import Rule from './rule';





// TODO revise & explain this better, including internal comments. What is this for? When does it work/not work & why?
/**
 * Returns a single unambiguous rule list composed from the common parts of the given `alternateRuleLists`. Throws an
 * error if no unambiguous single rule list can be formed (e.g. because the alternative rule lists have different
 * meta-rules in their non-common sections).
 */
export default function disambiguateRoutes(pattern: Pattern, alternateRuleLists: Rule[][]): Rule[] {

    // If there is only one rule list, return it as-is.
    if (alternateRuleLists.length === 1) return alternateRuleLists[0];

    // Find the longest common prefix and suffix of all the alternatives.
    let prefix = getLongestCommonPrefix(alternateRuleLists);
    let suffix = getLongestCommonPrefix(alternateRuleLists.map(cand => cand.slice().reverse())).reverse();

    // TODO: possible for prefix and suffix to overlap? What to do?

    // Ensure the non-common parts contain NO meta-rules.
    alternateRuleLists.forEach(cand => {
        let nonCommonRules: Rule[] = cand.slice(prefix.length, -suffix.length);
        let hasMetaRules = nonCommonRules.some(rule => rule.isMetaRule);
        if (hasMetaRules) throw new MultimethodError(`Multiple paths to '${pattern}' with different meta-rules`);
    });

    // Synthesize a 'crasher' rule that throws an 'ambiguous' error.
    let ambiguousFallbacks = alternateRuleLists.map(cand => cand[cand.length - suffix.length - 1]);
    let ambiguousError = new MultimethodError(`Multiple possible fallbacks from '${pattern}: ${ambiguousFallbacks}`); // TODO: what does this print? use 'inspect' like in disambiguate-rules.ts?
    function _ambiguous() { throw ambiguousError; }
    let crasher = new Rule(pattern.toString(), _ambiguous);

    // The final composite rule list == common prefix + crasher + common suffix.
    return ([] as Rule[]).concat(prefix, crasher, suffix);
}
