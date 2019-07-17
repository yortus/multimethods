import {EulerDiagram} from '../math/sets';
import {DeepReplace, fatalError, getLongestCommonPrefix, getLongestCommonSuffix} from '../util';




// TODO: doc...
export function pass2(mminfo: ReturnType<typeof import('./pass-1').pass1>) {
    type OldNode = typeof mminfo.rootNode;
    type NewNode = OldNode & {parentNode: OldNode};

    for (let node of mminfo.allNodes) {

        // If this is the root node, synthesize an additional regular method that always goes unhandled. Adding
        // this method ensures graceful dispatch behaviour in the case that method table provides no handling for the
        // universal predicate. In particular, it guarantees every possible dispatch has a non-empty method sequence.
        if (node.supersets.length === 0) {
            insertAsLeastSpecificRegularMethod(mminfo, node.exactMethods, mminfo.options.unhandled);
        }

        // If there are multiple ways into the set, analyse and mitigate all potential ambiguities...
        // TODO: explain the rationale and logic of this case and its handling
        else if (node.supersets.length > 1) {

            // Find the longest common prefix and suffix of all the alternatives.
            // TODO: possible for prefix and suffix to overlap? What to do?
            let pathsFromRoot = EulerDiagram.findAllPathsFromRootTo(node) as OldNode[][];
            let prefix = getLongestCommonPrefix(pathsFromRoot);
            let suffix = getLongestCommonSuffix(pathsFromRoot);

            // Ensure the divergent sets contain NO decorators. Otherwise, fail immediately.
            // This guarantees the dispatch result is the same regardless of which path is taken through the methods.
            pathsFromRoot.forEach((path): void => {
                let divergentNodes = path.slice(prefix.length, path.length - suffix.length);
                let hasDecorators = divergentNodes.some(n => n.exactMethods.some(m => mminfo.isDecorator(m)));
                if (hasDecorators) return fatalError.MULTIPLE_PATHS_TO(node.exactPredicate);
            });

            // TODO: explain all below more clearly...
            // Synthesize a 'crasher' method that throws an 'ambiguous' error, and add it to the existing methods.
            // TODO: this allows 'lazy' error handling that won't prevent the best-matching methods from handling
            //       the dispatch as long as they don't fall back to the ambiguous part of the sequence.
            let candidates = pathsFromRoot.map(path => path[path.length - suffix.length - 1].predicate).join(', ');
            let method = function _ambiguous() { fatalError.MULTIPLE_FALLBACKS_FROM(node.exactPredicate, candidates); };
            insertAsLeastSpecificRegularMethod(mminfo, node.exactMethods, method);
        }


        // TODO: parent node...
        let parentNode: OldNode | undefined; // NB: will remain undefined for the root node
        if (node.supersets.length === 1) {
            // If there is only one way into the set, then the parent
            // is the node corresponding to the one-and-only superset.
            parentNode = node.supersets[0] as OldNode;
        }
        else if (node.supersets.length > 1) {
            // If there are multiple ways into the set, the parent node is the last node in the common prefix.
            // TODO: explain better. Also note that ambiguities in this case have been dealt with in
            // analyse-ambiguities.ts, so we can make some stronger assumptions here.
            let pathsFromRoot = EulerDiagram.findAllPathsFromRootTo(node);
            let prefix = getLongestCommonPrefix(pathsFromRoot);
            parentNode = prefix[prefix.length - 1] as OldNode;
        }

        Object.assign(node, {parentNode});
    }

    return mminfo as DeepReplace<typeof mminfo, OldNode, NewNode>;
}




// TODO: doc...
function insertAsLeastSpecificRegularMethod(mminfo: ReturnType<typeof import('./pass-1').pass1>, orderedMethods: Function[], method: Function) {
    let i = 0;
    while (i < orderedMethods.length && !mminfo.isDecorator(orderedMethods[i])) ++i;
    orderedMethods.splice(i, 0, method);
}
