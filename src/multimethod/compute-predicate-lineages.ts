import {CONTINUE} from './sentinels';
import fatalError from '../util/fatal-error';
import getLongestCommonPrefix from '../util/get-longest-common-prefix';
import getLongestCommonSuffix from '../util/get-longest-common-suffix';
import Rule from './rule';
import {Predicate, toNormalPredicate, ANY} from '../set-theory/predicates';
import {EulerDiagram, EulerSet} from '../set-theory/sets';
import isMetaHandler from './is-meta-handler';





// TODO: ...
export interface Lineage {
    // TODO: explain... most-to-least specific rules matching set's predicate
    lineage: Rule[];
}





// TODO: review all comments...
/**
 * Returns a mapping of every possible route through the given euler diagram, keyed by predicate. There is one route for each
 * set in the euler diagram. A route is simply a list of rules, ordered from least- to most-specific, that all match the set
 * of discriminants matched by the corresponding euler diagram set's predicate. Routes are an important internal concept,
 * because each route represents the ordered list of matching methods for any given discriminant.
 */
export default function computePredicateLineages<T>(eulerDiagram: EulerDiagram<T>, rules: Rule[]): EulerDiagram<T & Lineage> {

    // Every route begins with this universal rule. It matches all discriminants,
    // and its handler simply returns the `CONTINUE` sentinel value.
    const universalFallbackRule = new Rule(ANY, function _universalFallback() {
        return CONTINUE;
    });

    // Find the equal-best rules corresponding to each pattern in the euler diagram, sorted least- to most-specific in each case.
    let eulerDiagramWithExactlyMatchingRules = distributeRulesOverSets(eulerDiagram, rules);

    // Every set in the euler diagram represents the best-matching pattern for some set of discriminants. Therefore, the set
    // of all possible discriminants may be thought of as being partitioned by an euler diagram into one partition per set,
    // where for each partition, that partition's set holds the most-specific predicate that matches that partition's
    // discriminants. For every such partition, we can concatenate the 'equal best' rules for all the sets along the
    // routes from the universal set to the most-specific set in the partition, thus getting a rule
    // list for each partition, ordered from least- to most-specific, of all the rules that match all the partition's
    // discriminants. One complication here is that there may be multiple routes from the universal set to some other set in the
    // euler diagram, since it is a DAG and may therefore contain 'diamonds'. Since we tolerate no ambiguity, these multiple
    // routes must be effectively collapsed down to a single unambiguous route. The details of this are in the
    // disambiguateRoutes() function.
    let result = eulerDiagram.augment(set => {

        // TODO: confusing! possibleRoutes, alternateRoutes sound like the same thing but are not!!
        // Get all possible routes through the euler diagram from the root to `set`.
        let possibleRoutes = getAlternateLineagesForSet(set);

        // Obtain the full rule list corresponding to each pathway, ordered from least- to most-specific.
        let alternateRoutes = possibleRoutes
            .map(route => route
                .map(predicate => eulerDiagramWithExactlyMatchingRules.get(predicate.toString()))
                .reduce((path, set) => path.concat(set.exactlyMatchingRules), [universalFallbackRule])
            );

        // Make a single best path. Ensure no possibility of ambiguity.
        let lineage = disambiguateRoutes(set.predicate, alternateRoutes);

        // TODO: order the rules from most- to least- specific as per spec...
        lineage.reverse();

        // All done
        return { lineage };
    });

    return result;
}





// TODO: doc...
function distributeRulesOverSets<T>(eulerDiagram: EulerDiagram<T>, rules: Rule[]) {

    // For each predicate in the euler diagram, get the list of corresponding rules sorted least- to most-specific.
    let result = eulerDiagram.augment(set => {

        // Get all the rules in the rule set whose normalized predicate exactly matches that of the given set's predicate.
        // Some sets may have no matching rules, because the euler diagram may include predicates that are not in the
        // original ruleset for the following cases:
        // (i) the always-present root predicate '…', which may be in the rule set.
        // (ii) predicates synthesized at the intersection of overlapping (i.e. non-disjoint) predicates in the rule set.
        let exactlyMatchingRules = rules.filter(rule => toNormalPredicate(rule.predicate) === toNormalPredicate(set.predicate));

        // We now have an array of rules whose predicates are all equivalent. To sort these rules from least- to most-
        // specific, we use a comparator that orders any two given 'equivalent' rules according to the following laws:
        // (i) A metarule is always less specific than a regular rule
        // (ii) For two regular rules in the same chain, the leftmost rule is more specific
        // (iii) For two metarules in the same chain, the leftmost rule is less specific
        // (iv) Anything else is ambiguous and results in an error
        exactlyMatchingRules.sort(ruleComparator); // NB: may throw

// TODO: temp testing remove...
// if (exactlyMatchingRules.length > 1) {
//     if (exactlyMatchingRules.every(r => !!r.chain)) {
//         debugger;
//     }
// }

        // Return the sorted rule list in an object. These objects will be merged into the augmented euler diagram.
        return { exactlyMatchingRules };
    });
    return result;
}





/**
 * Enumerates every possible walk[1] in the euler diagram from the root to the given `set`. Each walk is represented as a
 * list of predicates arranged in walk-order (i.e., from the root to the descendent).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#walk
 */
function getAlternateLineagesForSet(set: EulerSet): Predicate[][] {
    let allRoutes = ([] as Predicate[][]).concat(...set.supersets.map(getAlternateLineagesForSet));
    if (allRoutes.length === 0) {

        // No parent paths, therefore this must be the root.
        allRoutes = [[]];
    }
    return allRoutes.map(path => path.concat([set.predicate]));
}





/**
 * Compares two rules whose predicates are equivalent. Returns 1 when `ruleA` is more specific,
 * and -1 when ruleB is more specific. Throws an error otherwise.
 */
function ruleComparator(ruleA: Rule, ruleB: Rule) {

    // Comparing a metarule and a regular rule: the metarule is always less specific.
    if (!isMetaHandler(ruleA.handler) && isMetaHandler(ruleB.handler)) return 1;  // A is more specific
    if (isMetaHandler(ruleA.handler) && !isMetaHandler(ruleB.handler)) return -1; // B is more specific

    // Comparing two regular rules in the same chain: the leftmost one is more specific.
    // Comparing two metarules in the same chain: the leftmost one is less specific.
    let chain = ruleA.chain;
    if (!!chain && chain === ruleB.chain) {
        let leftmostRule = chain.indexOf(ruleA.handler) < chain.indexOf(ruleB.handler) ? ruleA : ruleB;
        return (leftmostRule === ruleA ? 1 : -1) * (isMetaHandler(ruleA.handler) ? -1 : 1);
    }

    // Anything else is ambiguous
    return fatalError('AMBIGUOUS_RULE_ORDER', ruleA.predicate, ruleB.predicate);
}





// TODO revise & explain this better, including internal comments. What is this for? When does it work/not work & why?
/**
 * Returns a single unambiguous rule list composed from the common parts of the given `alternateRuleLists`. Throws an
 * error if no unambiguous single rule list can be formed (e.g. because the alternative rule lists have different
 * meta-rules in their non-common sections).
 */
function disambiguateRoutes(predicate: Predicate, alternateRuleLists: Rule[][]): Rule[] {

    // If there is only one rule list, return it as-is.
    if (alternateRuleLists.length === 1) return alternateRuleLists[0];

    // Find the longest common prefix and suffix of all the alternatives.
    // TODO: possible for prefix and suffix to overlap? What to do?
    let prefix = getLongestCommonPrefix(alternateRuleLists);
    let suffix = getLongestCommonSuffix(alternateRuleLists);

    // Ensure the non-common parts contain NO meta-rules.
    alternateRuleLists.forEach(cand => {
        let nonCommonRules: Rule[] = cand.slice(prefix.length, cand.length - suffix.length);
        let hasMetaRules = nonCommonRules.some(rule => isMetaHandler(rule.handler));
        if (hasMetaRules) return fatalError('MULTIPLE_PATHS_TO', predicate);
    });

    // TODO: explain all below more clearly...
    // Synthesize a 'crasher' rule that throws an 'ambiguous' error.
    let ambiguousFallbacks = alternateRuleLists.map(cand => cand[cand.length - suffix.length - 1].predicate).join(', ');
    let crasher = new Rule(predicate, function _ambiguous() {
        fatalError('MULTIPLE_FALLBACKS_FROM', predicate, ambiguousFallbacks);
    });

    // The final composite rule list == common prefix + crasher + common suffix.
    return ([] as Rule[]).concat(prefix, crasher, suffix);
}
