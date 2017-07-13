import normaliseMethods from './normalise-methods';
import {EulerDiagram, EulerSet} from '../../set-theory/sets';
import {toNormalPredicate, NormalPredicate} from '../../set-theory/predicates';

import getLongestCommonPrefix from '../../util/get-longest-common-prefix';
import getLongestCommonSuffix from '../../util/get-longest-common-suffix';
import isMetaMethod from '../shared/is-meta-method';
import fatalError from '../../util/fatal-error';
import {toPredicate} from '../../set-theory/predicates';
import CONTINUE from '../shared/continue';
import Options from '../api/options';
import MMInfo, {MMNode} from '../shared/mm-info';





// TODO: review all comments here
/** TODO: doc... */
export default function distillStuff(options: Options) {

    // TODO: temp testing...
    let mminfo = createMMInfo(options);
    return mminfo;
}










// TODO: temp testing...
// TODO: reuse/revise old comments below, all from computePredicateLineages()...
// (1):
    // Every route begins with the universal predicate. It matches all discriminants,
    // and its method simply returns the `CONTINUE` sentinel value.

// (2):
    // Every set in the euler diagram represents the best-matching pattern for some set of discriminants. Therefore, the set
    // of all possible discriminants may be thought of as being partitioned by an euler diagram into one partition per set,
    // where for each partition, that partition's set holds the most-specific predicate that matches that partition's
    // discriminants. For every such partition, we can concatenate the 'equal best' methods for all the sets along the
    // routes from the universal set to the most-specific set in the partition, thus getting a method
    // list for each partition, ordered from least- to most-specific, of all the methods that match all the partition's
    // discriminants. One complication here is that there may be multiple routes from the universal set to some other set in the
    // euler diagram, since it is a DAG and may therefore contain 'diamonds'. Since we tolerate no ambiguity, these multiple
    // routes must be effectively collapsed down to a single unambiguous route. The details of this are in the
    // disambiguateRoutes() function.

// (3):
    // Returns a mapping of every possible route through the given euler diagram, keyed by predicate. There is one route for each
    // set in the euler diagram. A route is simply a list of methods, ordered from least- to most-specific, that all match the set
    // of discriminants matched by the corresponding euler diagram set's predicate. Routes are an important internal concept,
    // because each route represents the ordered list of matching methods for any given discriminant.

// (4):
    // Get all the methods in the methods hash whose normalized predicate exactly matches that of the given set's predicate.
    // Some sets may have no matching methods, because the euler diagram may include predicates that are not in the
    // original methods hash for the following cases:
    // (i) the always-present root predicate '…', which may be in the methods hash.
    // (ii) predicates synthesized at the intersection of overlapping (i.e. non-disjoint) predicates in the methods hash.

// (5):
    // We now have an array of methods whose predicates are all equivalent. To sort these methods from least- to most-
    // specific, we use a comparator that orders any two given 'equivalent' methods according to the following laws:
    // (i) A meta-method is always less specific than a regular method
    // (ii) For two regular methods in the same chain, the leftmost method is more specific
    // (iii) For two meta-methods in the same chain, the leftmost method is less specific
    // (iv) Anything else is ambiguous and results in an error

function createMMInfo(options: Options): MMInfo {

    let arity = options.arity;
    let async = options.async;
    let strict = options.strict || false;
    let toDiscriminant = options.toDiscriminant || (() => { throw new Error('Implement default discriminant!') }); // TODO: implement...
    let normalisedMethods = normaliseMethods(options.methods || {});

    // Generate a taxonomic arrangement of all the predicate patterns that occur in the `methods` hash.
    let eulerDiagram = new EulerDiagram(Object.keys(normalisedMethods).map(toPredicate));



    // Augment sets with exactly-matching methods in most- to least-specific order.
    let euler2 = eulerDiagram.augment(set => {
        let predicateInHash = findMatchingPredicateInMethods(set.predicate, normalisedMethods) || set.predicate;

        // Find the index in the chain where meta-methods end and regular methods begin.
        let chain = normalisedMethods[predicateInHash] || [];
        if (!Array.isArray(chain)) chain = [chain];
        let i = 0;
        while (i < chain.length && isMetaMethod(chain[i])) ++i;
        // TODO: explain ordering: regular methods from left-to-right; then meta-methods from right-to-left
        let methods = chain.slice(i).concat(chain.slice(0, i).reverse());

        return {predicateInHash, methods};
    });

    // TODO: create one node for each set. Leave everything from `fallback` onward null for now.
    let nodes: MMNode[] = euler2.sets.map(set => ({
        predicate: set.predicateInHash,
        methods: set.methods,
        fallback: null,
        children: []
    }));

    // Go back over the nodes and work out the correct `fallback` node. There must be precisely one (except for the root).
    nodes.forEach((node, i) => {
        let set = euler2.sets[i];

        // Case 0: the root node has no fallback.
        // Leave fallback as null, but synthesize an additional regular method that always returns CONTINUE.
        if (set.supersets.length === 0) {
            let method = function _unhandled() { return CONTINUE; };
            insertAsLeastSpecificRegularMethod(node.methods, method);
        }

        // Case 1: if there is only one way into the set, then the fallback is the node corresponding to the one-and-only superset.
        else if (set.supersets.length === 1) {
            let j = euler2.sets.indexOf(set.supersets[0]);
            node.fallback = nodes[j];
        }

        // Case 2: there are multiple ways into the set.
        // TODO: explain the rationale and logic of this case and its handling
        else {

            // Find the longest common prefix and suffix of all the alternatives.
            // TODO: possible for prefix and suffix to overlap? What to do?
            let pathsFromRoot = getAllPathsFromRootToSet(set);
            let prefix = getLongestCommonPrefix(pathsFromRoot);
            let suffix = getLongestCommonSuffix(pathsFromRoot);

            // Ensure the divergent sets contain NO meta-methods.
            pathsFromRoot.forEach(path => {
                let divergentSets = path.slice(prefix.length, path.length - suffix.length);
                let hasMetaMethods = divergentSets.some(set => set.methods.some(h => isMetaMethod(h)));
                if (hasMetaMethods) return fatalError.MULTIPLE_PATHS_TO(node.predicate);
            });

            // TODO: explain all below more clearly...
            // Synthesize a 'crasher' method that throws an 'ambiguous' error, and add it to the existing methods.
            let candidates = pathsFromRoot.map(path => path[path.length - suffix.length - 1].predicate).join(', ');
            let method = function _ambiguous() { fatalError.MULTIPLE_FALLBACKS_FROM(node.predicate, candidates); };
            insertAsLeastSpecificRegularMethod(node.methods, method);

            // Set 'fallback' to the node at the end of the common prefix.
            node.fallback = nodes[euler2.sets.indexOf(prefix[prefix.length - 1])];
        }
    });

    // TODO: children...
    nodes.forEach((node, i) => {
        let set = euler2.sets[i];
        node.children = set.subsets.map((subset: any) => nodes[euler2.sets.indexOf(subset)]); // TODO: why cast needed?
    });

    // TODO: all together...
    let name = `MM${multimethodCounter++}`;
    let root = nodes[euler2.sets.indexOf(euler2.universe)];
    return {
        name,
        arity,
        async,
        strict,
        toDiscriminant,
        methods: normalisedMethods,
        nodes,
        root
    };
}





// TODO: doc...
function findMatchingPredicateInMethods(normalisedPredicate: NormalPredicate, methods: Options['methods']) {
    methods = methods || {};
    for (let key in methods) {
        let predicate = toPredicate(key);

        // Skip until we find the right predicate.
        if (toNormalPredicate(predicate) !== normalisedPredicate) continue;

        // Found it!
        return predicate;
    }

    // If we get here, there is no matching predicate in the given `methods`.
    return null;
}





/**
 * Enumerates every walk[1] in the euler diagram from the root to the given `set` following 'subset' edges.
 * Each walk is represented as a list of sets arranged in walk-order (i.e., from the root to the given `set`).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#walk
 */
function getAllPathsFromRootToSet<T extends EulerSet>(set: T): T[][] {
    let allPaths = ([] as T[][]).concat(...(set.supersets as T[]).map(getAllPathsFromRootToSet));
    if (allPaths.length === 0) {

        // No parent paths, therefore this must be the root.
        allPaths = [[]];
    }
    return allPaths.map(path => path.concat(set));
}





// TODO: doc...
function insertAsLeastSpecificRegularMethod(orderedMethods: Function[], method: Function) {
    let i = 0;
    while (i < orderedMethods.length && !isMetaMethod(orderedMethods[i])) ++i;
    orderedMethods.splice(i, 0, method);
}





// TODO: doc...
let multimethodCounter = 0;
