import {NormalPredicate, Predicate, toNormalPredicate, toPredicate} from '../math/predicates';
import {EulerDiagram} from '../math/sets';
import {MMInfo} from '../mm-info';
import {fatalError, getLongestCommonPrefix, getLongestCommonSuffix} from '../util';
import {MMInfoEx} from './build-mm-info';




// TODO: doc...
export function pass1(mminfo: MMInfoEx) {
    let mminfo1 = mminfo.map(node => {
        let exactPredicate = findExactPredicateInMethodTable(node.predicate, mminfo.allMethods) || node.predicate;
        let exactMethods = mminfo.allMethods[exactPredicate] || [];
        return {...node, exactPredicate, exactMethods};
    });


    // TODO: ambiguities...
    return mminfo1.map(node => {
        type TNode = typeof mminfo1.rootNode;

        // If this is the root node, synthesize an additional regular method that always goes unhandled. Adding
        // this method ensures graceful dispatch behaviour in the case that method table provides no handling for the
        // universal predicate. In particular, it guarantees every possible dispatch has a non-empty method sequence.
        if (node.supersets.length === 0) {
            let method = mminfo.config.unhandled || fatalError.UNHANDLED;
            insertAsLeastSpecificRegularMethod(mminfo, node.exactMethods, method);
        }

        // If there are multiple ways into the set, analyse and mitigate all potential ambiguities...
        // TODO: explain the rationale and logic of this case and its handling
        else if (node.supersets.length > 1) {

            // Find the longest common prefix and suffix of all the alternatives.
            // TODO: possible for prefix and suffix to overlap? What to do?
            let pathsFromRoot = EulerDiagram.findAllPathsFromRootTo(node) as TNode[][];
            let prefix = getLongestCommonPrefix(pathsFromRoot);
            let suffix = getLongestCommonSuffix(pathsFromRoot);

            // Ensure the divergent sets contain NO meta-methods. Otherwise, fail immediately.
            // This guarantees the dispatch result is the same regardless of which path is taken through the methods.
            pathsFromRoot.forEach((path): void => {
                let divergentNodes = path.slice(prefix.length, path.length - suffix.length);
                let hasMetaMethods = divergentNodes.some(n => n.exactMethods.some(m => mminfo.isDecorator(m)));
                if (hasMetaMethods) return fatalError.MULTIPLE_PATHS_TO(node.exactPredicate);
            });

            // TODO: explain all below more clearly...
            // Synthesize a 'crasher' method that throws an 'ambiguous' error, and add it to the existing methods.
            // TODO: this allows 'lazy' error handling that won't prevent the best-matching methods from handling
            //       the dispatch as long as they don't fall back to the ambiguous part of the sequence.
            let candidates = pathsFromRoot.map(path => path[path.length - suffix.length - 1].predicate).join(', ');
            let method = function _ambiguous() { fatalError.MULTIPLE_FALLBACKS_FROM(node.exactPredicate, candidates); };
            insertAsLeastSpecificRegularMethod(mminfo, node.exactMethods, method);
        }

        return node; // NB: we aren't adding any members to the nodes.
    });
}




// TODO: doc...
function findExactPredicateInMethodTable(normalisedPredicate: NormalPredicate, methods: Record<string, Function[]>): Predicate | undefined {
    for (let key of Object.keys(methods)) {
        let predicate = toPredicate(key);

        // Skip until we find the right predicate.
        if (toNormalPredicate(predicate) !== normalisedPredicate) continue;

        // Found it!
        return predicate;
    }

    // If we get here, there is no matching predicate in the method table.
    return undefined;
}




// TODO: doc...
function insertAsLeastSpecificRegularMethod(mminfo: MMInfo<{}>, orderedMethods: Function[], method: Function) {
    let i = 0;
    while (i < orderedMethods.length && !mminfo.isDecorator(orderedMethods[i])) ++i;
    orderedMethods.splice(i, 0, method);
}
