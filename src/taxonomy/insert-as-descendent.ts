import {NormalPredicate} from '../set-theory/predicates';
import {intersect} from '../set-theory/sets';
import TaxonomyNode from './taxonomy-node';





// TODO: remove jsdoc ref to pattern '∅' below... Safe to remove? Anything to replace it?

/**
 * Inserts `insertee` into the taxonomy subgraph rooted at `ancestor`, preserving all invariants
 * relating to the arrangement of taxonomy nodes. `insertee`'s pattern is assumed to be a proper
 * subset of `ancestor`'s pattern, and `insertee` must not hold the empty pattern '∅'.
 * @param {TaxonomyNode} insertee - the new node to be inserted into the taxonomy below `ancestor`.
 * @param {TaxonomyNode} ancestor - the root node of the taxonomy subgraph in which `insertee` belongs.
 * @param {(predicate: Predicate) => TaxonomyNode} nodeFor - a function that returns the taxonomy node for
 *        a given pattern. It is expected to return the same instance when passed the same pattern for
 *        the same taxonomy. When `insertee` overlaps an existing node in the subgraph, this function
 *        is used to synthesize the additional intersection node(s).
 */
export default function insertAsDescendent(insertee: TaxonomyNode, ancestor: TaxonomyNode, nodeFor: (predicate: NormalPredicate) => TaxonomyNode) {

    // Determine the set relationship between `insertee` and each of the `ancestor` node's existing children.
    // Subsequent steps only need to know about those children of `ancestor` that are non-disjoint with `insertee`.
    let nonDisjointComparands = ancestor.specializations.reduce(
        (comparands, node) => {
            let intersections = intersect(insertee.predicate, node.predicate); // TODO: messy... has casts... fix...

            // TODO: temp testing...
            intersections.forEach(i => comparands.push({node, intersection: nodeFor(i)}));

            // TODO: was...
            //if (intersection !== Predicate.EMPTY) comparands.push({node, intersection: nodeFor(intersection)});


            return comparands;
        },
        <{node: TaxonomyNode; intersection: TaxonomyNode}[]> []
    );

    // If the `ancestor` pattern has no existing children that are non-disjoint
    // with `insertee`, then we simply add `insertee` as a direct child of `ancestor`.
    if (nonDisjointComparands.length === 0) {
        insertChild(ancestor, insertee);
    }

    // If `insertee` already exists as a direct child of `ancestor` at this point
    // (including if it was just added above), then the insertion is complete.
    if (hasChild(ancestor, insertee)) return;

    // `insertee` has subset/superset/overlapping relationships with one or more of
    // `ancestor`'s existing children. Work out how and where to insert it.
    nonDisjointComparands.forEach(comparand => {
        let isSubsetOfComparand = comparand.intersection === insertee;
        let isSupersetOfComparand = comparand.intersection === comparand.node;
        let isOverlappingComparand = !isSubsetOfComparand && !isSupersetOfComparand;

        if (isSupersetOfComparand) {
            // Remove the comparand from `ancestor`. It will be re-inserted as a child of `insertee` in the next step.
            removeChild(ancestor, comparand.node);
        }

        if (isSupersetOfComparand || isOverlappingComparand) {
            // Add `insertee` as a direct child of `ancestor`.
            insertChild(ancestor, insertee);

            // Recursively re-insert the comparand (or insert the overlap) as a child of `insertee`.
            insertAsDescendent(comparand.intersection, insertee, nodeFor);
        }

        if (isSubsetOfComparand || isOverlappingComparand) {
            // Recursively insert `insertee` (or insert the overlap) as a child of the comparand.
            insertAsDescendent(comparand.intersection, comparand.node, nodeFor);
        }
    });
}





/** Checks if parent/child links exist directly between `node` and `child`. */
function hasChild(node: TaxonomyNode, child: TaxonomyNode): boolean {
    return node.specializations.indexOf(child) !== -1;
}





/** Ensures parent/child links exist directly between `node` and `child`. */
function insertChild(node: TaxonomyNode, child: TaxonomyNode) {
    // NB: If the child is already there, make this a no-op.
    if (hasChild(node, child)) return;
    node.specializations.push(child);
    child.generalizations.push(node);
}





/** Removes the existing parent/child links between `node` and `child`. */
function removeChild(node: TaxonomyNode, child: TaxonomyNode) {
    node.specializations.splice(node.specializations.indexOf(child), 1);
    child.generalizations.splice(child.generalizations.indexOf(node), 1);
}
