import {getLongestCommonPrefix, RoutistError} from '../util';
import Pattern from '../pattern';
import Method from './method';
// TODO: better explain how/why this works in external documentation (esp. the synthesized 'crasher' method).





// TODO revise & explain this better, including internal comments. What is this for? When does it work/not work & why?
/**
 * Returns a single unambiguous rule list composed from the common parts of the given `alternateRuleLists`. Throws an
 * error if no unambiguous single rule list can be formed (e.g. because the alternative rule lists have different
 * decorators in their non-common sections).
 */
export default function disambiguatePaths(pattern: Pattern, alternateMethodLists: Method[][]): Method[] {

    // If there is only one alternative, return it as-is.
    if (alternateMethodLists.length === 1) return alternateMethodLists[0];

    // Find the longest common prefix and suffix of all the alternatives.
    let prefix = getLongestCommonPrefix(alternateMethodLists);
    let suffix = getLongestCommonPrefix(alternateMethodLists.map(cand => cand.slice().reverse())).reverse();

    // TODO: possible for prefix and suffix to overlap? What to do?

    // Ensure the non-common parts contain NO decorators.
    alternateMethodLists.forEach(cand => {
        let nonCommonMethods: Method[] = cand.slice(prefix.length, -suffix.length);
        let noDecorators = nonCommonMethods.every(method => !method.isDecorator);
        // TODO: remove double-negative...
        if (!noDecorators) throw new RoutistError(`Multiple paths to '${pattern}' with different decorators`);
    });

    // Synthesize a 'crasher' method that throws an 'ambiguous' error.
    let ambiguousFallbacks = alternateMethodLists.map(cand => cand[cand.length - suffix.length - 1]);
    let ambiguousError = new RoutistError(`Multiple possible fallbacks from '${pattern}: ${ambiguousFallbacks}`); // TODO: what does this print? use 'inspect' like in disambiguate-methods.ts?
    function _ambiguous() { throw ambiguousError; }
    let crasher = new Method(pattern.toString(), _ambiguous);

    // The final composite method list == common prefix + crasher + common suffix.
    return [].concat(prefix, crasher, suffix);
}
