import insertAsDescendent from './insert-as-descendent';
import Pattern from '../pattern';
import TaxonomyNode from './taxonomy-node';





/**
 * A taxonomy is an arrangement of patterns into a directed acyclic graph (DAG), according to their
 * set relationships. Recall that a pattern represents a set of addresses, so two patterns may have
 * a subset, superset, disjoint, or other relationship, according to the set of addresses they match.
 * Each node in a taxonomy holds a single pattern, as well as links to all parent and child nodes.
 * Every taxonomy has a single root node that holds the universal pattern '…'. In any given taxonomy,
 * for any two nodes holding patterns P and Q, if Q is a proper subset of P, then Q will be a
 * descendent of P in the taxonomy. Overlapping patterns (i.e., patterns whose intersection is
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
export default class Taxonomy {


    /**
     * Constructs a new Taxonomy instance from the given list of patterns.
     * @param {Pattern[]} patterns - the list of patterns to be arranged as a DAG.
     */
    constructor(patterns: Pattern[]) {
        initTaxonomy(this, patterns);
    }


    /** Holds the root node of the taxonomy. */
    rootNode: TaxonomyNode;


    /** Holds a snapshot of all the nodes in the taxonomy at the time of construction. */
    allNodes: TaxonomyNode[];
}





/** Internal helper function used by the Taxonomy constructor. */
function initTaxonomy(taxonomy: Taxonomy, patterns: Pattern[]) {

    // Create the nodeFor() function to return the node corresponding to a given pattern,
    // creating it on demand if it doesn't already exist. This function ensures that every
    // request for the same pattern gets the same singleton node.
    let nodeMap = new Map<Pattern, TaxonomyNode>();
    let nodeFor = (pattern: Pattern) => {
        if (!nodeMap.has(pattern)) nodeMap.set(pattern, new TaxonomyNode(pattern));
        return nodeMap.get(pattern);
    }

    // Retrieve the root node, which always corresponds to the '…' pattern.
    let rootNode = taxonomy.rootNode = nodeFor(Pattern.ANY);

    // Insert each of the given patterns, except '…', into a DAG rooted at '…'.
    // The insertion logic assumes only normalized patterns, which we obtain first.
    patterns
        .map(pattern => pattern.normalized) // TODO: what if normalized patterns contain duplicates?
        .filter(pattern => pattern !== Pattern.ANY) // TODO: why need this??
        .forEach(pattern => insertAsDescendent(nodeFor(pattern), rootNode, nodeFor));

    // Finally, compute the `allNodes` snapshot.
    taxonomy.allNodes = Array.from(nodeMap.values());
}
