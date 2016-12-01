import createDispatcher from './codegen/create-dispatcher';
import disambiguateRoutes from './disambiguate-routes';
import disambiguateRules from './disambiguate-rules';
import Rule from './rule';
import MultimethodOptions from './multimethod-options';
import Pattern from '../pattern';
import Taxonomy, {TaxonomyNode} from '../taxonomy';
import {warn} from '../util';





// TODO: review all comments here - eg refs to 'RuleSet' should be updated to Multimethod, etc
/** Internal function used to generate the RuleSet#execute method. */
export default function createMultimethod(normalisedOptions: MultimethodOptions): (p0: any) => any { // TODO: generalise return type!!!

    // TODO: ...
    let rawRules = normalisedOptions.rules;

    // Generate a taxonomic arrangement of all the predicate patterns that occur in the multimethod's rule set.
    let taxonomy = new Taxonomy<never>(Object.keys(rawRules).map(src => new Pattern(src)));

    // TODO: put validation logic (this and some later paragraphs) elsewhere...
    // TODO: ensure no pattern has a capture called 'next'
    Object.keys(rawRules).forEach(src => {
        let pattern = new Pattern(src);
        if (pattern.captureNames.indexOf('next') === -1) return;
        throw new Error(`Pattern '${pattern}' uses reserved name 'next'`);
    });

    // Detect synthesized patterns in the taxonomy (i.e., ones with no exactly-matching predicates in the rule set).
    // TODO: If ... then warn...
    // TODO: explain this a bit better... F# also issues a warning when a match expression doesn't cover all possible cases...
    let normalizedPatterns = Object.keys(rawRules).map(p => new Pattern(p).normalized);
    let unhandledPatterns = taxonomy.allNodes.map(n => n.pattern).filter(p => normalizedPatterns.indexOf(p) === -1);
    if (unhandledPatterns.length > 0) {
        // TODO: improve error message...
        warn(`Multimethod contains conflicts: ${unhandledPatterns.map(p => p.toString()).join(', ')}`);
    }

    // Find every possible functionally-distinct route that any discriminant can take through the rule set.
    let taxonomyWithRoutes = computeAllRoutes(taxonomy, rawRules, normalisedOptions.unhandled);

//     // Ensure every rule across every route has a mutually-unique name.
//     // TODO: explain better... there may be more rules than routes due to additional synthesised rules being added (eg 'ambiguous fallback' crasher rules), etc...
// let routes = new Map(taxonomyWithRoutes.allNodes.map(node => [node.pattern, node.route] as [Pattern, Rule[]]));
//     let allRules: Rule[] = [...new Set([].concat(...routes.values())).values()];
//     allRules
//         .map(rule => rule.name)
//         .reduce((names, n) => names.concat(`${n}${names.indexOf(n) === -1 ? '' : `_${names.length}`}`), <string[]>[])
//         .forEach((name, i) => allRules[i].name = name);

    // TODO: ...
    let dispatcher = createDispatcher(taxonomyWithRoutes, normalisedOptions);
    return dispatcher;
}





/**
 * Returns a mapping of every possible route through the given taxonomy, keyed by pattern. There is one route for each
 * node in the taxonomy. A route is simply a list of rules, ordered from least- to most-specific, that all match the set
 * of discriminants matched by the corresponding taxonomy node's pattern. Routes are an important internal concept,
 * because each route represents the ordered list of matching methods for any given discriminant
 * 
 *  to any address that is best matched by the
 * pattern associated with the route.
 */
function computeAllRoutes<T>(taxonomy: Taxonomy<T>, rules: {[pattern: string]: Function}, unhandled: any): Taxonomy<T & {route: Rule[]}> {

    // Every route begins with this universal rule. It matches all discriminants,
    // and its method just returns the 'unhandled' sentinel value.
    const universalFallbackRule = new Rule(Pattern.ANY.toString(), function _unhandled() {
        return unhandled;
    });

    // Find the equal-best rules corresponding to each pattern in the taxonomy, sorted least- to most-specific in each
    // case. Since the rules are 'equal best', there is no inherent way to recognise their relative specificity. This is
    // where the client-supplied 'tiebreak' function is used. It must provide an unambiguous order in all cases where
    // rules are otherwise of identical specificity.
    let equalBestRules = taxonomy.augment(node => {
        let bestRules = getEqualBestRulesForPredicate(node.pattern, rules);
        bestRules = disambiguateRules(bestRules); // NB: may throw
        return { bestRules };
    });

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
        let possibleRoutes = getAllRoutesFromRootToNode(node);

        // Obtain the full rule list corresponding to each pathway, ordered from least- to most-specific.
        let alternateRoutes = possibleRoutes
            .map(route => route
                .map(pattern => equalBestRules.get(pattern))
                .reduce((path, node) => path.concat(node.bestRules), [universalFallbackRule])
            );

        // Make a single best path. Ensure no possibility of ambiguity.
        let route = disambiguateRoutes(node.pattern, alternateRoutes);

        // Now order the rules from most- to least- specific
        route.reverse();

        // All done
        return { route };
    });

    return result;
}





/**
 * Get all the rules in the rule set whose normalized form exactly matches that of the given `pattern`. NB: some
 * patterns may have no such rules, because the taxonomy of patterns may include some that are not in the ruleset,
 * such as:
 * - the always-present root pattern '…'
 * - patterns synthesized at the intersection of overlapping patterns in the rule set.
 */
function getEqualBestRulesForPredicate(predicate: Pattern, methods: {[pattern: string]: Function}): Rule[] {
    return Object.keys(methods)
        .map(key => new Pattern(key))
        .filter(pat => pat.normalized === predicate.normalized)
        .map(pat => pat.toString())
        .map(key => new Rule(key, methods[key]));
}





/**
 * Enumerates every possible walk[1] in the taxonomy from the root to the given `node`. Each walk is represented as a
 * list of patterns arranged in walk-order (i.e., from the root to the descendent).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#Walks
 */
function getAllRoutesFromRootToNode(node: TaxonomyNode): Pattern[][] {
    let allRoutes = ([] as Pattern[][]).concat(...node.generalizations.map(getAllRoutesFromRootToNode));
    if (allRoutes.length === 0) {

        // No parent paths, therefore this must be the root.
        allRoutes = [[]];
    }
    return allRoutes.map(path => path.concat([node.pattern]));
}
