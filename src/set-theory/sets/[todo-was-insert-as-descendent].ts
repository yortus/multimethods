import {NormalPredicate} from '../predicates';
import intersect from './intersect';
import Set from './set';





// TODO: revise all comments below...
// TODO: remove jsdoc ref to pattern '∅' below... Safe to remove? Anything to replace it?

/**
 * Inserts `insertee` into the euler diagram subgraph rooted at `ancestor`, preserving all invariants
 * relating to the arrangement of sets. `insertee`'s predicate is assumed to be a proper
 * subset of `ancestor`'s predicate, and `insertee` must not hold the 'empty' predicate '∅'.
 * @param {Set} insertee - the new set to be inserted into the euler diagram below `ancestor`.
 * @param {Set} ancestor - the 'root' set of the euler diagram subgraph in which `insertee` belongs.
 * @param {(predicate: Predicate) => Set} setFor - a function that returns the set for
 *        a given predicate. It is expected to return the same instance when passed the same predicate for
 *        the same euler diagram. When `insertee` overlaps an existing set in the subgraph, this function
 *        is used to synthesize the additional intersection set(s).
 */
export default function insertAsDescendent(insertee: Set, ancestor: Set, setFor: (predicate: NormalPredicate) => Set) {

    // Determine the set relationship between `insertee` and each of the `ancestor` set's existing children.
    // Subsequent steps only need to know about those children of `ancestor` that are non-disjoint with `insertee`.
    let nonDisjointComparands = ancestor.subsets.reduce(
        (comparands, set) => {
            let intersections = intersect(insertee.predicate, set.predicate); // TODO: messy... has casts... fix...

            // TODO: temp testing...
            intersections.forEach(i => comparands.push({set, intersection: setFor(i)}));

            // TODO: was...
            //if (intersection !== Predicate.EMPTY) comparands.push({set, intersection: setFor(intersection)});


            return comparands;
        },
        <{set: Set; intersection: Set}[]> []
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
        let isSupersetOfComparand = comparand.intersection === comparand.set;
        let isOverlappingComparand = !isSubsetOfComparand && !isSupersetOfComparand;

        if (isSupersetOfComparand) {
            // Remove the comparand from `ancestor`. It will be re-inserted as a child of `insertee` in the next step.
            removeChild(ancestor, comparand.set);
        }

        if (isSupersetOfComparand || isOverlappingComparand) {
            // Add `insertee` as a direct child of `ancestor`.
            insertChild(ancestor, insertee);

            // Recursively re-insert the comparand (or insert the overlap) as a child of `insertee`.
            insertAsDescendent(comparand.intersection, insertee, setFor);
        }

        if (isSubsetOfComparand || isOverlappingComparand) {
            // Recursively insert `insertee` (or insert the overlap) as a child of the comparand.
            insertAsDescendent(comparand.intersection, comparand.set, setFor);
        }
    });
}





/** Checks if parent/child links exist directly between `set` and `child`. */
function hasChild(set: Set, child: Set): boolean {
    return set.subsets.indexOf(child) !== -1;
}





/** Ensures parent/child links exist directly between `set` and `child`. */
function insertChild(set: Set, child: Set) {
    // NB: If the child is already there, make this a no-op.
    if (hasChild(set, child)) return;
    set.subsets.push(child);
    child.supersets.push(set);
}





/** Removes the existing parent/child links between `set` and `child`. */
function removeChild(set: Set, child: Set) {
    set.subsets.splice(set.subsets.indexOf(child), 1);
    child.supersets.splice(child.supersets.indexOf(set), 1);
}
