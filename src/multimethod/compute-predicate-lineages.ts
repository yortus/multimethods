import disambiguateRoutes from './disambiguate-routes';
import disambiguateRules from './disambiguate-rules';
import MultimethodOptions from './multimethod-options';
import Rule from './rule';
import {Predicate, toNormalPredicate, ANY} from '../set-theory/predicates';
import {EulerDiagram, EulerSet} from '../set-theory/sets';





// TODO: ...
export interface Lineage {
    // TODO: explain... most-to-least specific rules matching set's predicate
    lineage: Rule[];
}





// TODO: review comments...
/**
 * Returns a mapping of every possible route through the given euler diagram, keyed by predicate. There is one route for each
 * set in the euler diagram. A route is simply a list of rules, ordered from least- to most-specific, that all match the set
 * of discriminants matched by the corresponding euler diagram set's predicate. Routes are an important internal concept,
 * because each route represents the ordered list of matching methods for any given discriminant
 * 
 *  to any address that is best matched by the
 * pattern associated with the route.
 */
export default function computePredicateLineages<T>(eulerDiagram: EulerDiagram<T>, rules: Rule[], normalisedOptions: MultimethodOptions): EulerDiagram<T & Lineage> {

    // Every route begins with this universal rule. It matches all discriminants,
    // and its method just returns the `FALLBACK` sentinel value.
    const universalFallbackRule = new Rule(ANY, function _universalFallback() {
        return normalisedOptions.FALLBACK;
    });

    // Find the equal-best rules corresponding to each pattern in the euler diagram, sorted least- to most-specific in each
    // case. Since the rules are 'equal best', there is no inherent way to recognise their relative specificity. This is
    // where the client-supplied 'tiebreak' function is used. It must provide an unambiguous order in all cases where
    // rules are otherwise of identical specificity.
    let eulerDiagramWithExactlyMatchingRules = distributeRulesOverSets(eulerDiagram, rules);

    // Every set in the euler diagram represents the best-matching pattern for some set of discriminants. Therefore, the set
    // of all possible discriminants may be thought of as being partitioned by a euler diagram into one partition per set,
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





// TODO: ...
function distributeRulesOverSets<T>(eulerDiagram: EulerDiagram<T>, rules: Rule[]) {

    // Find the equal-best rules corresponding to each pattern in the euler diagram, sorted least- to most-specific in each
    // case. Since the rules are 'equal best', there is no inherent way to recognise their relative specificity. This is
    // where the client-supplied 'tiebreak' function is used. It must provide an unambiguous order in all cases where
    // rules are otherwise of identical specificity.
    let result = eulerDiagram.augment(set => {

        /**
         * Get all the rules in the rule set whose normalized form exactly matches that of the given `pattern`. NB: some
         * patterns may have no such rules, because the euler diagram of patterns may include some that are not in the ruleset,
         * such as:
         * - the always-present root pattern '…'
         * - patterns synthesized at the intersection of overlapping patterns in the rule set.
         */
        let exactlyMatchingRules = rules.filter(rule => toNormalPredicate(rule.predicate) === toNormalPredicate(set.predicate));

        exactlyMatchingRules = disambiguateRules(exactlyMatchingRules); // NB: may throw

        return { exactlyMatchingRules };
    });
    return result;
}





/**
 * Enumerates every possible walk[1] in the euler diagram from the root to the given `set`. Each walk is represented as a
 * list of predicates arranged in walk-order (i.e., from the root to the descendent).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#Walks
 */
function getAlternateLineagesForSet(set: EulerSet): Predicate[][] {
    let allRoutes = ([] as Predicate[][]).concat(...set.supersets.map(getAlternateLineagesForSet));
    if (allRoutes.length === 0) {

        // No parent paths, therefore this must be the root.
        allRoutes = [[]];
    }
    return allRoutes.map(path => path.concat([set.predicate]));
}
