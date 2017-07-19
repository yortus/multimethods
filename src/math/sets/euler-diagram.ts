import intersect from './intersect';
import {toPredicate, toNormalPredicate, NormalPredicate, ANY} from '../predicates';
import EulerSet from './euler-set';





/**
 * A euler diagram is a directed acyclic graph (DAG) where each set holds a predicate. The sets are arranged according to
 * the relationships between their respecive predicates. More specifically, given any two sets A and B within the same
 * euler diagram, set B is a descendent of set A if and only if the set of strings matched by set B's predicate is a
 * proper subset of the set of strings matched by set A's predicate.
 * 
 *  and where the sets are arranged
 * according to the set relationships between the predicate's sets of matching strings.







 * 
 *  The predicates in a
 * euler diagram are arranged according to the relationships between the sets of strings they match.
 *
 * Recall that a predicate matches a particular set of strings. Accordingly, two predicates may have
 * a subset, superset, disjoint, or other relationship, according to the respective sets of string they match.
 *
 * Each set in a euler diagram holds a single predicate, as well as links to all parent and child sets.
 * Every euler diagram has a single root set that holds the universal predicate '…' that matches all strings.
 * 
 * In any given euler diagram,
 * for any two sets holding predicates P and Q, if Q is a proper subset of P, then Q will be a
 * descendent of P in the euler diagram. Overlapping predicates (i.e., predicates whose intersection is
 * non-empty but neither is a subset of the other) are siblings in the euler diagram. For overlapping
 * patterns, an additional pattern representing their intersection is synthesized and added to the
 * euler diagram as a descendent of both patterns. All patterns in a euler diagram are normalized. Some sets
 * (such as intersection sets) may be reached via more than one path from the root, but no two
 * sets in a euler diagram hold the same pattern. A euler diagram may thus contain 'diamonds', making it a
 * DAG rather than a tree.
 * 
 * NB: The patterns in a euler diagram may not correspond identically to its input patterns, due to (i)
 * pattern normalization, (ii) the addition of the '…' pattern if it was not among the input
 * patterns, and (iii) the addition of intersection patterns for each pair of overlapping input
 * patterns.
 * 
 * For example, the input patterns ['foo', 'bar', 'f{chars}', '*o'] result in this 6-set euler diagram:
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
export default class EulerDiagram {


    /**
     * Constructs a new euler diagram comprising the sets defined by the given predicates.
     */
    constructor(predicates: string[]) {
        initEulerDiagram(this, predicates);
    }


    /** Holds the root set of the euler diagram. */
    universalSet: EulerSet;


    /** Holds a snapshot of all the sets in the euler diagram at the time of construction. */
    allSets: EulerSet[];


    // TODO: temp testing... doc... looks up the set for the given predicate. returns undefined if not found.
    // algo: exact match using canonical form of given Predicate/string
    findSet(predicate: string): EulerSet | undefined {
        let p = toNormalPredicate(toPredicate(predicate));
        let result = this.allSets.filter(set => set.predicate === p)[0];
        return result;
    }
}





/** Internal helper function used by the EulerDiagram constructor. */
function initEulerDiagram(eulerDiagram: EulerDiagram, predicates: string[]) {

    // Create the setFor() function to return the set corresponding to a given pattern,
    // creating it on demand if it doesn't already exist. This function ensures that every
    // request for the same pattern gets the same singleton set.
    let setLookup = new Map<NormalPredicate, EulerSet>();
    let setFor = (predicate: NormalPredicate) => {
        if (!setLookup.has(predicate)) {
            let newSet: EulerSet = {predicate, supersets: [], subsets: []};
            setLookup.set(predicate, newSet);
        }
        return setLookup.get(predicate)!;
    }

    // Retrieve the universal set for this euler diagram, which always corresponds to the '…' predicate.
    let universe = eulerDiagram.universalSet = setFor(ANY);

    // Insert each of the given predicates, except '…', into a DAG rooted at '…'.
    // The insertion logic assumes only normalized patterns, which we obtain first.
    predicates
        .map(predicate => toNormalPredicate(toPredicate(predicate))) // TODO: what if normalized patterns contain duplicates?
        .filter(predicate => predicate !== ANY) // TODO: why need this??
        .forEach(predicate => insertAsDescendent(setFor(predicate), universe, setFor));

    // Finally, compute the `sets` property.
    let allSets = eulerDiagram.allSets = [] as EulerSet[];
    setLookup.forEach(value => allSets.push(value));
}





// TODO: revise all comments below...
// TODO: remove jsdoc ref to pattern '∅' below... Safe to remove? Anything to replace it?

/**
 * Inserts `insertee` into the euler diagram subgraph rooted at `ancestor`, preserving all invariants
 * relating to the arrangement of sets. `insertee`'s predicate is assumed to be a proper
 * subset of `ancestor`'s predicate, and `insertee` must not hold the 'empty' predicate '∅'.
 * @param {EulerSet} insertee - the new set to be inserted into the euler diagram below `ancestor`.
 * @param {EulerSet} ancestor - the 'root' set of the euler diagram subgraph in which `insertee` belongs.
 * @param {(predicate: Predicate) => EulerSet} setFor - a function that returns the set for
 *        a given predicate. It is expected to return the same instance when passed the same predicate for
 *        the same euler diagram. When `insertee` overlaps an existing set in the subgraph, this function
 *        is used to synthesize the additional intersection set(s).
 */
function insertAsDescendent(insertee: EulerSet, ancestor: EulerSet, setFor: (predicate: NormalPredicate) => EulerSet) {

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
        <{set: EulerSet; intersection: EulerSet}[]> []
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
function hasChild(set: EulerSet, child: EulerSet): boolean {
    return set.subsets.indexOf(child) !== -1;
}





/** Ensures parent/child links exist directly between `set` and `child`. */
function insertChild(set: EulerSet, child: EulerSet) {
    // NB: If the child is already there, make this a no-op.
    if (hasChild(set, child)) return;
    set.subsets.push(child);
    child.supersets.push(set);
}





/** Removes the existing parent/child links between `set` and `child`. */
function removeChild(set: EulerSet, child: EulerSet) {
    set.subsets.splice(set.subsets.indexOf(child), 1);
    child.supersets.splice(child.supersets.indexOf(set), 1);
}
