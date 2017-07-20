import MMInfo from './mm-info';
import getLongestCommonPrefix from '../util/get-longest-common-prefix';
import {EulerDiagram} from '../math/sets';
import {ExactPredicate, ExactMethods, ParentNode} from './mm-node';





// TODO: doc...Go back over the nodes and work out the correct parent node. There must be precisely one (except for the root which has no parent).
export default function analyseParentNodes<T extends ExactPredicate & ExactMethods>(mminfo: MMInfo<T>) {
    return mminfo.addProps((_, nodes, set, sets) => {
        let parentNode: (T & ParentNode<T>) | null;

        // The root node has no parent node. Set it to `null`.
        if (set.supersets.length === 0) {
            parentNode = null;
        }

        // If there is only one way into the set, then the parent is the node corresponding to the one-and-only superset.
        else if (set.supersets.length === 1) {
            parentNode = nodes[sets.indexOf(set.supersets[0])] as T & ParentNode<T>;
        }

        // If there are multiple ways into the set, the parent node is the last node in the common prefix.
        // TODO: explain better. Also note that ambiguities in this case have been dealt with in analyse-ambiguities.ts,
        // so we can make some stronger assumptions here.
        else {
            let pathsFromRoot = EulerDiagram.findAllPathsFromRootTo(set);
            let prefix = getLongestCommonPrefix(pathsFromRoot);
            parentNode = nodes[sets.indexOf(prefix[prefix.length - 1])] as T & ParentNode<T>;
        }
        return {parentNode} as ParentNode<T>;
    });
}
