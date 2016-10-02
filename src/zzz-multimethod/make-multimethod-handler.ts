import disambiguatePaths from './disambiguate-paths';
import disambiguateMethods from './disambiguate-methods';
import makePathSelector from './make-path-selector';
import makePathHandler from './make-path-handler';
import Pattern from '../pattern';
import PathHandler from './path-handler';
import Method from './method';
import MultimethodOptions from './multimethod-options';
import Taxonomy, {TaxonomyNode} from '../taxonomy';
import UNHANDLED from './unhandled';
import {warn} from '../util';





// TODO: review all comments here - eg refs to 'RuleSet' should be updated to Multimethod, etc
/** Internal function used to generate the RuleSet#execute method. */
export default function makeMultimethodHandler(options: MultimethodOptions, methods: {[pattern: string]: Function}): (request: any) => any {

    // TODO: assume options are normalized by now? Or normalize them here?

    // Generate a taxonomic arrangement of all the patterns that occur in the rule set.
    let taxonomy = new Taxonomy(Object.keys(methods).map(src => new Pattern(src)));

    // Detect synthesized patterns in the taxonomy (i.e., ones with no exactly-matching handlers in the rule set).
    // TODO: If ... then warn...
    // TODO: explain this a bit better... F# also issues a warning when a match expression doesn't cover all possible cases...
    let normalizedPatterns = Object.keys(methods).map(p => new Pattern(p).normalized);
    let unhandledPatterns = taxonomy.allNodes.map(n => n.pattern).filter(p => normalizedPatterns.indexOf(p) === -1);
    if (unhandledPatterns.length > 0) {
        // TODO: improve error message...
        warn(`Multimethod contains conflicts: ${unhandledPatterns.map(p => p.toString()).join(', ')}`);
    }

    // Find all functionally-distinct routes that an address can take through the rule set.
    let paths = findAllPathsThroughMultimethod(taxonomy, methods);

    // Create a composite handler for each distinct route through the rule set.
    let pathHandlers = Array.from(paths.keys()).reduce(
        (map, pattern) => map.set(pattern, makePathHandler(paths.get(pattern))),
        new Map<Pattern, PathHandler>()
    );

    // Generate a function that, given an address, returns the handler for the best-matching path.
    let selectPathHandler = makePathSelector(taxonomy, pathHandlers);

    // Return a composite handler representing this entire rule set.
    return function _compiledMultimethod(request: any) {
        let discriminant = options.toDiscriminant(request);
        let handlePath = selectPathHandler(discriminant);
        let result = handlePath(discriminant, request);
        return result;
    };
}





/**
 * Returns a mapping of every possible route through the given taxonomy, keyed by pattern. There is one route for each
 * node in the taxonomy. A route is simply a list of rules, ordered from least- to most-specific, that all match the set
 * of addresses matched by the corresponding taxonomy node's pattern. Routes are an important internal concept, because
 * each route represents the best list of rule handlers to apply to any address that is best matched by the pattern
 * associated with the route.
 */
function findAllPathsThroughMultimethod(taxonomy: Taxonomy, methods: {[pattern: string]: Function}): Map<Pattern, Method[]> {

    // Every route begins with this universal rule. It matches all addresses,
    // and its handler returns the 'unhandled' sentinel value.
    const universalFallback = new Method(Pattern.ANY.toString(), function _unhandled() { return UNHANDLED; });

    // Find the equal-best rules corresponding to each pattern in the taxonomy, sorted least- to most-specific in each
    // case. Since the rules are 'equal best', there is no inherent way to recognise their relative specificity. This is
    // where the client-supplied 'tiebreak' function is used. It must provide an unambiguous order in all cases where
    // rules are otherwise of equivalent specificity.
    let equalBestMethods = taxonomy.allNodes.reduce(
        (map, node) => {
            let bestMethods = getEqualBestMethodsForPredicate(node.pattern, methods);
            bestMethods = disambiguateMethods(bestMethods); // NB: may throw
            map.set(node.pattern, bestMethods);
            return map;
        },
        new Map<Pattern, Method[]>()
    );

    // Every node in the taxonomy represents the best-matching pattern for some set of addresses. Therefore, the set of
    // all possible addresses may be thought of as being partitioned by a taxonomy into one partition per node, where
    // for each partition, that partition's node holds the most-specific pattern that matches that partition's
    // addresses. For each such partition, we can concatenate the 'equal best' rules for all the nodes along the pathways
    // from the root node to the most-specific node in the partition, thus getting a rule list for each partition,
    // ordered from least- to most-specific, of all the rules that match all the partition's addresses. One complication
    // here is that there may be multiple pathways from the root to a node in the taxonomy, since it is a DAG and may
    // therefore contain 'diamonds'. Since we tolerate no ambiguity, these multiple pathways must be effectively
    // collapsed down to a single unambiguous pathway. The details of this are in the disambiguatePaths() function.
    return taxonomy.allNodes.reduce(
        (map, node) => {

            // Get all paths through the taxonomy from the root to `node`.
            let alternatePaths = getAllPathsFromRootToNode(node);

            // Obtain the full rule list corresponding to each pathway, ordered from least- to most-specific.
            let alternateMethodLists = alternatePaths
                .map(path => path
                    .map(pattern => equalBestMethods.get(pattern))
                    .reduce((path, methods) => path.concat(methods), [universalFallback])
                );

            // Make a single best path. Ensure no possibility of ambiguity.
            let singlePath = disambiguatePaths(node.pattern, alternateMethodLists);
            return map.set(node.pattern, singlePath);
        },
        new Map<Pattern, Method[]>()
    );
}





/**
 * Get all the rules in the rule set whose normalized form matches that of the given `pattern`. NB: some patterns may
 * have no such rules, because the taxonomy of patterns may include some that are not in the ruleset, such as:
 * - the always-present root pattern '…'
 * - patterns synthesized at the intersection of overlapping patterns in the ruleset.
 */
function getEqualBestMethodsForPredicate(predicate: Pattern, methods: {[pattern: string]: Function}): Method[] {
    return Object.keys(methods)
        .map(key => new Pattern(key))
        .filter(pat => pat.normalized === predicate.normalized)
        .map(pat => pat.toString())
        .map(key => new Method(key, methods[key]));
}





/**
 * Enumerates every possible walk[1] in the taxonomy from the root to the given `node`. Each walk is represented as a
 * list of patterns arranged in walk-order (i.e., from the root to the descendent).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#Walks
 */
function getAllPathsFromRootToNode(node: TaxonomyNode): Pattern[][] {
    let allPaths = [].concat(...node.generalizations.map(getAllPathsFromRootToNode));
    if (allPaths.length === 0) allPaths = [[]]; // no parent paths - this must be the root
    return allPaths.map(path => path.concat([node.pattern]));
}
