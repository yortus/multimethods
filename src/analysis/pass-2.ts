import {EulerDiagram} from '../math/sets';
import {getLongestCommonPrefix} from '../util';




// TODO: doc...
export function pass2(mminfo: ReturnType<typeof import('./pass-1').pass1>) {
    type TNode = typeof mminfo.rootNode;

    return mminfo.map(node => {

        // TODO: child nodes...
        let childNodes = node.subsets;

        // TODO: parent node...
        let parentNode: TNode | undefined; // NB: will remain undefined for the root node
        if (node.supersets.length === 1) {
            // If there is only one way into the set, then the parent
            // is the node corresponding to the one-and-only superset.
            parentNode = node.supersets[0] as TNode;
        }
        else if (node.supersets.length > 1) {
            // If there are multiple ways into the set, the parent node is the last node in the common prefix.
            // TODO: explain better. Also note that ambiguities in this case have been dealt with in
            // analyse-ambiguities.ts, so we can make some stronger assumptions here.
            let pathsFromRoot = EulerDiagram.findAllPathsFromRootTo(node);
            let prefix = getLongestCommonPrefix(pathsFromRoot);
            parentNode = prefix[prefix.length - 1] as TNode;
        }

        // TODO: ...
        return {...node, childNodes, parentNode};
    });
}
