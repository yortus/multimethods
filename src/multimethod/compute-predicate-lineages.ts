import disambiguateRoutes from './disambiguate-routes';
import disambiguateRules from './disambiguate-rules';
import Rule from './rule';
import Predicate from '../predicate';
import Taxonomy, {TaxonomyNode} from '../taxonomy';





// TODO: ...
export interface Lineage {
    // TODO: explain... most-to-least specific rules matching node's pattern/predicate
    lineage: Rule[];
}





// TODO: review comments...
/**
 * Returns a mapping of every possible route through the given taxonomy, keyed by pattern. There is one route for each
 * node in the taxonomy. A route is simply a list of rules, ordered from least- to most-specific, that all match the set
 * of discriminants matched by the corresponding taxonomy node's pattern. Routes are an important internal concept,
 * because each route represents the ordered list of matching methods for any given discriminant
 * 
 *  to any address that is best matched by the
 * pattern associated with the route.
 */
export default function computePredicateLineages<T>(taxonomy: Taxonomy<T>, rules: Rule[], unhandled: any): Taxonomy<T & Lineage> {

    // Every route begins with this universal rule. It matches all discriminants,
    // and its method just returns the 'unhandled' sentinel value.
    const universalFallbackRule = new Rule(Predicate.ANY.toString(), function _unhandled() {
        return unhandled;
    });

    // Find the equal-best rules corresponding to each pattern in the taxonomy, sorted least- to most-specific in each
    // case. Since the rules are 'equal best', there is no inherent way to recognise their relative specificity. This is
    // where the client-supplied 'tiebreak' function is used. It must provide an unambiguous order in all cases where
    // rules are otherwise of identical specificity.
    let taxonomyWithExactlyMatchingRules = distributeRulesOverNodes(taxonomy, rules);

    // Every node in the taxonomy represents the best-matching pattern for some set of discriminants. Therefore, the set
    // of all possible discriminants may be thought of as being partitioned by a taxonomy into one partition per node,
    // where for each partition, that partition's node holds the most-specific pattern that matches that partition's
    // discriminants. For every such partition, we can concatenate the 'equal best' rules for all the nodes along the
    // routes from the root node to the most-specific node in the partition, thus getting a rule
    // list for each partition, ordered from least- to most-specific, of all the rules that match all the partition's
    // discriminants. One complication here is that there may be multiple routes from the root to a node in the
    // taxonomy, since it is a DAG and may therefore contain 'diamonds'. Since we tolerate no ambiguity, these multiple
    // routes must be effectively collapsed down to a single unambiguous route. The details of this are in the
    // disambiguateRoutes() function.
    let result = taxonomy.augment(node => {

        // TODO: confusing! possibleRoutes, alternateRoutes sound like the same thing but are not!!
        // Get all possible routes through the taxonomy from the root to `node`.
        let possibleRoutes = getAlternateLineagesForNode(node);

        // Obtain the full rule list corresponding to each pathway, ordered from least- to most-specific.
        let alternateRoutes = possibleRoutes
            .map(route => route
                .map(pattern => taxonomyWithExactlyMatchingRules.get(pattern))
                .reduce((path, node) => path.concat(node.exactlyMatchingRules), [universalFallbackRule])
            );

        // Make a single best path. Ensure no possibility of ambiguity.
        let lineage = disambiguateRoutes(node.pattern, alternateRoutes);

        // TODO: order the rules from most- to least- specific as per spec...
        lineage.reverse();

        // All done
        return { lineage };
    });

    return result;
}





// TODO: ...
function distributeRulesOverNodes<T>(taxonomy: Taxonomy<T>, rules: Rule[]) {

    // Find the equal-best rules corresponding to each pattern in the taxonomy, sorted least- to most-specific in each
    // case. Since the rules are 'equal best', there is no inherent way to recognise their relative specificity. This is
    // where the client-supplied 'tiebreak' function is used. It must provide an unambiguous order in all cases where
    // rules are otherwise of identical specificity.
    let result = taxonomy.augment(node => {

        /**
         * Get all the rules in the rule set whose normalized form exactly matches that of the given `pattern`. NB: some
         * patterns may have no such rules, because the taxonomy of patterns may include some that are not in the ruleset,
         * such as:
         * - the always-present root pattern '…'
         * - patterns synthesized at the intersection of overlapping patterns in the rule set.
         */
        let exactlyMatchingRules = rules.filter(rule => rule.predicate.normalized === node.pattern.normalized);

        exactlyMatchingRules = disambiguateRules(exactlyMatchingRules); // NB: may throw

        return { exactlyMatchingRules };
    });
    return result;
}





/**
 * Enumerates every possible walk[1] in the taxonomy from the root to the given `node`. Each walk is represented as a
 * list of predicates arranged in walk-order (i.e., from the root to the descendent).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#Walks
 */
function getAlternateLineagesForNode(node: TaxonomyNode): Predicate[][] {
    let allRoutes = ([] as Predicate[][]).concat(...node.generalizations.map(getAlternateLineagesForNode));
    if (allRoutes.length === 0) {

        // No parent paths, therefore this must be the root.
        allRoutes = [[]];
    }
    return allRoutes.map(path => path.concat([node.pattern]));
}
