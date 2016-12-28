import insertAsDescendent from './insert-as-descendent';
import {Predicate, toPredicate, toNormalPredicate, NormalPredicate, ANY} from '../set-theory/predicates';
import TaxonomyNode from './taxonomy-node';





// TODO: review comments below - e.g. references to 'address', pattern vs predicate, ...
/**


TextPredicate
TextClassifier
Taxonomy
Hierarchy



Predicate
Set

VennDiagram (SetDiagram, LogicDiagram)
VennSet
vennDiagram.annotate
    .addAnnotation
    .addInfo
vennSet.supersets
vennSet.subsets


EulerDiagram


Classifier
classifier.addInfo
classifierNode

Predicate
Taxonomy
taxonomy.addInfo




 * A taxonomy is a directed acyclic graph (DAG) where each node holds a predicate. The nodes are arranged according to
 * the relationships between their respecive predicates. More specifically, given any two nodes A and B within the same
 * taxonomy, node B is a descendent of node A if and only if the set of strings matched by node B's predicate is a
 * proper subset of the set of strings matched by node A's predicate.
 * 
 *  and where the nodes are arranged
 * according to the set relationships between the predicate's sets of matching strings.







 * 
 *  The predicates in a
 * taxonomy are arranged according to the relationships between the sets of strings they match.
 *
 * Recall that a predicate matches a particular set of strings. Accordingly, two predicates may have
 * a subset, superset, disjoint, or other relationship, according to the respective sets of string they match.
 *
 * Each node in a taxonomy holds a single predicate, as well as links to all parent and child nodes.
 * Every taxonomy has a single root node that holds the universal predicate '…' that matches all strings.
 * 
 * In any given taxonomy,
 * for any two nodes holding predicates P and Q, if Q is a proper subset of P, then Q will be a
 * descendent of P in the taxonomy. Overlapping predicates (i.e., predicates whose intersection is
 * non-empty but neither is a subset of the other) are siblings in the taxonomy. For overlapping
 * patterns, an additional pattern representing their intersection is synthesized and added to the
 * taxonomy as a descendent of both patterns. All patterns in a taxonomy are normalized. Some nodes
 * (such as intersection nodes) may be reached via more than one path from the root, but no two
 * nodes in a taxonomy hold the same pattern. A taxonomy may thus contain 'diamonds', making it a
 * DAG rather than a tree.
 * 
 * NB: The patterns in a taxonomy may not correspond identically to its input patterns, due to (i)
 * pattern normalization, (ii) the addition of the '…' pattern if it was not among the input
 * patterns, and (iii) the addition of intersection patterns for each pair of overlapping input
 * patterns.
 * 
 * For example, the input patterns ['foo', 'bar', 'f{chars}', '*o'] result in this 6-node taxonomy:
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
export default class Taxonomy<T> {


    /**
     * Constructs a new Taxonomy instance from the given list of patterns.
     * @param {Predicate[]} predicates - the list of patterns to be arranged as a DAG.
     */
    constructor(predicates: Predicate[]) {
        initTaxonomy(this, predicates);
    }


    /** Holds the root node of the taxonomy. */
    rootNode: TaxonomyNode & T;


    /** Holds a snapshot of all the nodes in the taxonomy at the time of construction. */
    allNodes: Array<TaxonomyNode & T>;


    // TODO: temp testing... doc... looks up the node for the given predicate. returns undefined if not found.
    // algo: exact match using canonical form of given Predicate/string
    get(predicate: string): TaxonomyNode & T {
        let p = toNormalPredicate(toPredicate(predicate));
        let result = this.allNodes.filter(node => node.predicate === p)[0];
        return result;
    }


    // TODO: temp testing... doc...
    // TODO: better name? It maps the props AND assigns props back to nodes (like a mixin)
    // - augment? addProps?

    augment<U>(callback: (node: TaxonomyNode & T) => U): Taxonomy<T & U> {
        return augmentTaxonomy(this, callback);
    }
}





/** Internal helper function used by the Taxonomy constructor. */
function initTaxonomy<T>(taxonomy: Taxonomy<T>, patterns: Predicate[]) {

    // Create the nodeFor() function to return the node corresponding to a given pattern,
    // creating it on demand if it doesn't already exist. This function ensures that every
    // request for the same pattern gets the same singleton node.
    let nodeMap = new Map<NormalPredicate, TaxonomyNode & T>();
    let nodeFor = (pattern: NormalPredicate) => {
        if (!nodeMap.has(pattern)) nodeMap.set(pattern, <TaxonomyNode & T> new TaxonomyNode(pattern));
        return nodeMap.get(pattern)!;
    }

    // Retrieve the root node, which always corresponds to the '…' pattern.
    let rootNode = taxonomy.rootNode = nodeFor(ANY);

    // Insert each of the given patterns, except '…', into a DAG rooted at '…'.
    // The insertion logic assumes only normalized patterns, which we obtain first.
    patterns
        .map(pattern => toNormalPredicate(pattern)) // TODO: what if normalized patterns contain duplicates?
        .filter(pattern => pattern !== ANY) // TODO: why need this??
        .forEach(pattern => insertAsDescendent(nodeFor(pattern), rootNode, nodeFor));

    // Finally, compute the `allNodes` snapshot.
    taxonomy.allNodes = Array.from(nodeMap.values());
}





/** Internal helper function used to implement Taxonomy#map. */
function augmentTaxonomy<T, U>(taxonomy: Taxonomy<T>, callback: (node: TaxonomyNode & T) => U): Taxonomy<T & U> {

    // Clone the bare taxonomy.
    let oldNodes = taxonomy.allNodes;
    let newNodes = oldNodes.map(old => new TaxonomyNode(old.predicate)) as Array<TaxonomyNode & T & U>;
    let oldToNew = oldNodes.reduce((map, old, i) => map.set(old, newNodes[i]), new Map());
    newNodes.forEach((node, i) => {
        node.generalizations = oldNodes[i].generalizations.map(gen => oldToNew.get(gen));
        node.specializations = oldNodes[i].specializations.map(spc => oldToNew.get(spc));
    });

    // Map and assign the additional properties.
    newNodes.forEach((node: any, i) => {
        let oldProps: any = oldNodes[i];
        let newProps: any = callback(oldProps) || {};
        Object.keys(newProps).forEach(key => { if (!(key in node)) node[key] = newProps[key]; });
        Object.keys(oldProps).forEach(key => { if (!(key in node)) node[key] = oldProps[key]; });
    });

    // Return the new taxonomy.
    let newTaxonomy = new Taxonomy<T & U>([]);
    newTaxonomy.rootNode = oldToNew.get(taxonomy.rootNode);
    newTaxonomy.allNodes = newNodes;
    return newTaxonomy;
}
