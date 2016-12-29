import insertAsDescendent from './[todo-was-insert-as-descendent]';
import {Predicate, toPredicate, toNormalPredicate, NormalPredicate, ANY} from '../predicates';
import Set from './set';





/**
 * A euler diagram is a directed acyclic graph (DAG) where each node holds a predicate. The nodes are arranged according to
 * the relationships between their respecive predicates. More specifically, given any two nodes A and B within the same
 * euler diagram, node B is a descendent of node A if and only if the set of strings matched by node B's predicate is a
 * proper subset of the set of strings matched by node A's predicate.
 * 
 *  and where the nodes are arranged
 * according to the set relationships between the predicate's sets of matching strings.







 * 
 *  The predicates in a
 * euler diagram are arranged according to the relationships between the sets of strings they match.
 *
 * Recall that a predicate matches a particular set of strings. Accordingly, two predicates may have
 * a subset, superset, disjoint, or other relationship, according to the respective sets of string they match.
 *
 * Each node in a euler diagram holds a single predicate, as well as links to all parent and child nodes.
 * Every euler diagram has a single root node that holds the universal predicate '…' that matches all strings.
 * 
 * In any given euler diagram,
 * for any two nodes holding predicates P and Q, if Q is a proper subset of P, then Q will be a
 * descendent of P in the euler diagram. Overlapping predicates (i.e., predicates whose intersection is
 * non-empty but neither is a subset of the other) are siblings in the euler diagram. For overlapping
 * patterns, an additional pattern representing their intersection is synthesized and added to the
 * euler diagram as a descendent of both patterns. All patterns in a euler diagram are normalized. Some nodes
 * (such as intersection nodes) may be reached via more than one path from the root, but no two
 * nodes in a euler diagram hold the same pattern. A euler diagram may thus contain 'diamonds', making it a
 * DAG rather than a tree.
 * 
 * NB: The patterns in a euler diagram may not correspond identically to its input patterns, due to (i)
 * pattern normalization, (ii) the addition of the '…' pattern if it was not among the input
 * patterns, and (iii) the addition of intersection patterns for each pair of overlapping input
 * patterns.
 * 
 * For example, the input patterns ['foo', 'bar', 'f{chars}', '*o'] result in this 6-node euler diagram:
 *
 *        f*
 *      /    \
 *     /      \
 *    /        \
 * … --- *o --- f*o --- foo
 *    \
 *     \
 *      \
 *        bar
 */
export default class EulerDiagram<T> {


    /**
     * Constructs a new euler diagram comprising the sets defined by the given predicates.
     */
    constructor(predicates: Predicate[]) {
        initEulerDiagram(this, predicates);
    }


    /** Holds the root node of the euler diagram. */
    universe: Set & T;


    /** Holds a snapshot of all the nodes in the euler diagram at the time of construction. */
    allNodes: Array<Set & T>;


    // TODO: temp testing... doc... looks up the node for the given predicate. returns undefined if not found.
    // algo: exact match using canonical form of given Predicate/string
    get(predicate: string): Set & T {
        let p = toNormalPredicate(toPredicate(predicate));
        let result = this.allNodes.filter(node => node.predicate === p)[0];
        return result;
    }


    // TODO: temp testing... doc...
    // TODO: better name? It maps the props AND assigns props back to nodes (like a mixin)
    // - augment? addProps?

    augment<U>(callback: (node: Set & T) => U): EulerDiagram<T & U> {
        return augmentEulerDiagram(this, callback);
    }
}





/** Internal helper function used by the EulerDiagram constructor. */
function initEulerDiagram<T>(eulerDiagram: EulerDiagram<T>, patterns: Predicate[]) {

    // Create the nodeFor() function to return the node corresponding to a given pattern,
    // creating it on demand if it doesn't already exist. This function ensures that every
    // request for the same pattern gets the same singleton node.
    let nodeMap = new Map<NormalPredicate, Set & T>();
    let nodeFor = (pattern: NormalPredicate) => {
        if (!nodeMap.has(pattern)) nodeMap.set(pattern, <Set & T> new Set(pattern));
        return nodeMap.get(pattern)!;
    }

    // Retrieve the root node, which always corresponds to the '…' pattern.
    let universe = eulerDiagram.universe = nodeFor(ANY);

    // Insert each of the given patterns, except '…', into a DAG rooted at '…'.
    // The insertion logic assumes only normalized patterns, which we obtain first.
    patterns
        .map(pattern => toNormalPredicate(pattern)) // TODO: what if normalized patterns contain duplicates?
        .filter(pattern => pattern !== ANY) // TODO: why need this??
        .forEach(pattern => insertAsDescendent(nodeFor(pattern), universe, nodeFor));

    // Finally, compute the `allNodes` snapshot.
    eulerDiagram.allNodes = Array.from(nodeMap.values());
}





/** Internal helper function used to implement EulerDiagram#map. */
function augmentEulerDiagram<T, U>(eulerDiagram: EulerDiagram<T>, callback: (node: Set & T) => U): EulerDiagram<T & U> {

    // Clone the bare euler diagram.
    let oldNodes = eulerDiagram.allNodes;
    let newNodes = oldNodes.map(old => new Set(old.predicate)) as Array<Set & T & U>;
    let oldToNew = oldNodes.reduce((map, old, i) => map.set(old, newNodes[i]), new Map());
    newNodes.forEach((node, i) => {
        node.supersets = oldNodes[i].supersets.map(gen => oldToNew.get(gen));
        node.subsets = oldNodes[i].subsets.map(spc => oldToNew.get(spc));
    });

    // Map and assign the additional properties.
    newNodes.forEach((node: any, i) => {
        let oldProps: any = oldNodes[i];
        let newProps: any = callback(oldProps) || {};
        Object.keys(newProps).forEach(key => { if (!(key in node)) node[key] = newProps[key]; });
        Object.keys(oldProps).forEach(key => { if (!(key in node)) node[key] = oldProps[key]; });
    });

    // Return the new euler diagram.
    let newEulerDiagram = new EulerDiagram<T & U>([]);
    newEulerDiagram.universe = oldToNew.get(eulerDiagram.universe);
    newEulerDiagram.allNodes = newNodes;
    return newEulerDiagram;
}
