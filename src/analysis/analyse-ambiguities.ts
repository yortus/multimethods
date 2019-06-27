import {EulerDiagram} from '../math/sets';
import * as fatalError from '../util/fatal-error';
import getLongestCommonPrefix from '../util/get-longest-common-prefix';
import getLongestCommonSuffix from '../util/get-longest-common-suffix';
import isMetaMethod from '../util/is-meta-method';
import MMInfo from './mm-info';
import {MethodTableEntry} from './mm-node';





// TODO: doc...
export default function analyseAmbiguities<T extends MethodTableEntry>(mminfo: MMInfo<T>) {
    return mminfo.addProps((node, nodes, set, sets) => {

        // If this is the root node, synthesize an additional regular method that always goes unhandled. Adding
        // this method ensures graceful dispatch behaviour in the case that method table provides no handling for the
        // universal predicate. In particular, it guarantees every possible dispatch has a non-empty method sequence.
        if (set.supersets.length === 0) {
            let method = mminfo.config.unhandled || fatalError.UNHANDLED;
            insertAsLeastSpecificRegularMethod(node.exactMethods, method);
        }

        // If there are multiple ways into the set, analyse and mitigate all potential ambiguities...
        // TODO: explain the rationale and logic of this case and its handling
        else if (set.supersets.length > 1) {

            // Find the longest common prefix and suffix of all the alternatives.
            // TODO: possible for prefix and suffix to overlap? What to do?
            let pathsFromRoot = EulerDiagram.findAllPathsFromRootTo(set);
            let prefix = getLongestCommonPrefix(pathsFromRoot);
            let suffix = getLongestCommonSuffix(pathsFromRoot);

            // Ensure the divergent sets contain NO meta-methods. Otherwise, fail immediately.
            // This guarantees the dispatch result is the same regardless of which path is taken through the methods.
            pathsFromRoot.forEach((path): void => {
                let divergentSets = path.slice(prefix.length, path.length - suffix.length);
                let divergentNodes = divergentSets.map(s => nodes[sets.indexOf(s)]);
                let hasMetaMethods = divergentNodes.some(n => n.exactMethods.some(m => isMetaMethod(m)));
                if (hasMetaMethods) return fatalError.MULTIPLE_PATHS_TO(node.exactPredicate);
            });

            // TODO: explain all below more clearly...
            // Synthesize a 'crasher' method that throws an 'ambiguous' error, and add it to the existing methods.
            // TODO: this allows 'lazy' error handling that won't prevent the best-matching methods from handling
            //       the dispatch as long as they don't fall back to the ambiguous part of the sequence.
            let candidates = pathsFromRoot.map(path => path[path.length - suffix.length - 1].predicate).join(', ');
            let method = function _ambiguous() { fatalError.MULTIPLE_FALLBACKS_FROM(node.exactPredicate, candidates); };
            insertAsLeastSpecificRegularMethod(node.exactMethods, method);
        }

        return {}; // NB: we aren't adding any members to the nodes.
    });
}





// TODO: doc...
function insertAsLeastSpecificRegularMethod(orderedMethods: Function[], method: Function) {
    let i = 0;
    while (i < orderedMethods.length && !isMetaMethod(orderedMethods[i])) ++i;
    orderedMethods.splice(i, 0, method);
}
