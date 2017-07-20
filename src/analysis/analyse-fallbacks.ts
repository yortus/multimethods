import MMInfo from './mm-info';
import getLongestCommonPrefix from '../util/get-longest-common-prefix';
import getLongestCommonSuffix from '../util/get-longest-common-suffix';
import isMetaMethod from '../util/is-meta-method';
import fatalError from '../util/fatal-error';
import {EulerSet} from '../math/sets';
import {CONTINUE} from '../sentinels';
import {PredicateInMethodTable, ExactlyMatchingMethods, Fallback} from './node-parts';





// TODO: doc...Go back over the nodes and work out the correct `fallback` node. There must be precisely one (except for the root).
export default function analyseFallbacks<T extends PredicateInMethodTable & ExactlyMatchingMethods>(mminfo: MMInfo<T>) {
    return mminfo.addProps((node, nodes, set, sets) => {
        let result: Fallback<T> = {fallback: null};

        // Case 0: the root node has no fallback.
        // Leave fallback as null, but synthesize an additional regular method that always returns CONTINUE.
        if (set.supersets.length === 0) {
            let method = function _unhandled() { return CONTINUE; };
            insertAsLeastSpecificRegularMethod(node.exactlyMatchingMethods, method);
        }

        // Case 1: if there is only one way into the set, then the fallback is the node corresponding to the one-and-only superset.
        else if (set.supersets.length === 1) {
            result.fallback = nodes[sets.indexOf(set.supersets[0])] as T & Fallback<T>;
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
                let divergentNodes = divergentSets.map(set => nodes[sets.indexOf(set)]);
                let hasMetaMethods = divergentNodes.some(node => node.exactlyMatchingMethods.some(h => isMetaMethod(h)));
                if (hasMetaMethods) return fatalError.MULTIPLE_PATHS_TO(node.predicateInMethodTable);
            });

            // TODO: explain all below more clearly...
            // Synthesize a 'crasher' method that throws an 'ambiguous' error, and add it to the existing methods.
            let candidates = pathsFromRoot.map(path => path[path.length - suffix.length - 1].predicate).join(', ');
            let method = function _ambiguous() { fatalError.MULTIPLE_FALLBACKS_FROM(node.predicateInMethodTable, candidates); };
            insertAsLeastSpecificRegularMethod(node.exactlyMatchingMethods, method);

            // Set 'fallback' to the node at the end of the common prefix.
            result.fallback = nodes[sets.indexOf(prefix[prefix.length - 1])] as T & Fallback<T>;
        }
        return result;
    });
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
