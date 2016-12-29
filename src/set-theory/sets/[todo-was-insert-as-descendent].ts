import {NormalPredicate} from '../predicates';
import intersect from './intersect';
import Set from './set';





// TODO: revise all comments below...
// TODO: remove jsdoc ref to pattern '∅' below... Safe to remove? Anything to replace it?

/**
 * Inserts `insertee` into the euler diagram subgraph rooted at `ancestor`, preserving all invariants
 * relating to the arrangement of sets. `insertee`'s predicate is assumed to be a proper
 * subset of `ancestor`'s predicate, and `insertee` must not hold the 'empty' predicate '∅'.
 * @param {Set} insertee - the new node to be inserted into the euler diagram below `ancestor`.
 * @param {Set} ancestor - the root node of the euler diagram subgraph in which `insertee` belongs.
 * @param {(predicate: Predicate) => Set} nodeFor - a function that returns the set for
 *        a given predicate. It is expected to return the same instance when passed the same predicate for
 *        the same euler diagram. When `insertee` overlaps an existing node in the subgraph, this function
 *        is used to synthesize the additional intersection node(s).
 */
export default function insertAsDescendent(insertee: Set, ancestor: Set, nodeFor: (predicate: NormalPredicate) => Set) {

    // Determine the set relationship between `insertee` and each of the `ancestor` node's existing children.
    // Subsequent steps only need to know about those children of `ancestor` that are non-disjoint with `insertee`.
    let nonDisjointComparands = ancestor.subsets.reduce(
        (comparands, node) => {
            let intersections = intersect(insertee.predicate, node.predicate); // TODO: messy... has casts... fix...

            // TODO: temp testing...
            intersections.forEach(i => comparands.push({node, intersection: nodeFor(i)}));

            // TODO: was...
            //if (intersection !== Predicate.EMPTY) comparands.push({node, intersection: nodeFor(intersection)});


            return comparands;
        },
        <{node: Set; intersection: Set}[]> []
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
function hasChild(node: Set, child: Set): boolean {
    return node.subsets.indexOf(child) !== -1;
}





/** Ensures parent/child links exist directly between `node` and `child`. */
function insertChild(node: Set, child: Set) {
    // NB: If the child is already there, make this a no-op.
    if (hasChild(node, child)) return;
    node.subsets.push(child);
    child.supersets.push(node);
}





/** Removes the existing parent/child links between `node` and `child`. */
function removeChild(node: Set, child: Set) {
    node.subsets.splice(node.subsets.indexOf(child), 1);
    child.supersets.splice(child.supersets.indexOf(node), 1);
}
