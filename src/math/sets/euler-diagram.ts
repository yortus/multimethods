import {ALL, intersect, NONE, NormalPredicate, toNormalPredicate, Unreachable} from '../predicates';
import EulerSet from './euler-set';





// TODO: update ED description. Ideas:
/**
 * An EulerDiagram instance depicts the important relationships between the given predicates.
 * An EulerDiagram instance is equivalent to a directed acyclic graph (DAG) with nodes/edges ... with invariants:
 * - '**' is a node
 * - for any given predicate P, P is a node
 * - for any two given predicates P and Q, PnQ is a node
 * - there is an edge from P to Q *iff* P is a proper superset of Q *and* there does not exist a predicate R such that
 *   P is a proper superset of R and R is a proper superset of Q.
 */




// TODO: doc... the NONE predicate `∅` is the *universal subset* or 'bottom', and is always omitted from EulerDiagram
//       instances. It can never match anything anyway, so this omission should not cause any surpising behaviour.





/**
 * A euler diagram is a directed acyclic graph (DAG) where each set holds a predicate. The sets are arranged according
 * to the relationships between their respecive predicates. More specifically, given any two sets A and B within the
 * same euler diagram, set B is a descendent of set A if and only if the set of strings matched by set B's predicate is
 * a proper subset of the set of strings matched by set A's predicate.
 *
 *  and where the sets are arranged
 * according to the set relationships between the predicate's sets of matching strings.
 *
 *
 *
 *
 *
 *
 *  The predicates in a
 * euler diagram are arranged according to the relationships between the sets of strings they match.
 *
 * Recall that a predicate matches a particular set of strings. Accordingly, two predicates may have
 * a subset, superset, disjoint, or other relationship, according to the respective sets of string they match.
 *
 * Each set in a euler diagram holds a single predicate, as well as links to all parent and child sets.
 * Every euler diagram has a single root set that holds the universal predicate '**' that matches all strings.
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
 * pattern normalization, (ii) the addition of the '**' pattern if it was not among the input
 * patterns, and (iii) the addition of intersection patterns for each pair of overlapping input
 * patterns.
 *
 * For example, the input patterns ['foo', 'bar', 'f{chars}', '*o'] result in this 6-set euler diagram:
 *
 *        f*
 *      /    \
 *     /      \
 *    /        \
 * ** --- *o --- f*o --- foo
 *    \
 *     \
 *      \
 *        bar
 */
export default class EulerDiagram {


    /**
     * Constructs a new euler diagram comprising the sets defined by the given predicates.
     */
    constructor(predicates: string[], unreachable?: Unreachable) {
        initEulerDiagram(this, predicates, unreachable);
    }


    /** Holds the root set of the euler diagram. */
    universalSet: EulerSet;


    /** Holds a snapshot of all the sets in the euler diagram at the time of construction. */
    allSets: EulerSet[];


    // TODO: temp testing... doc... looks up the set for the given predicate. returns undefined if not found.
    // algo: exact match using canonical form of given Predicate/string
    findSet(predicate: string): EulerSet | undefined {
        let p = toNormalPredicate(predicate);
        let result = this.allSets.filter(set => set.predicate === p)[0];
        return result;
    }


    /**
     * Enumerates every walk[1] in the euler diagram from the root to the given `set` following 'subset' edges.
     * Each walk is represented as a list of sets arranged in walk-order (i.e., from the root to the given `set`).
     * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#walk
     */
    static findAllPathsFromRootTo(set: EulerSet): EulerSet[][] {
        if (set.supersets.length === 0) return [[set]]; // Base case: there is a single path to the root set.
        let result = ([] as EulerSet[][]).concat(...set.supersets.map(EulerDiagram.findAllPathsFromRootTo));
        return result.map(path => path.concat(set));
    }
}





/** Internal helper function used by the EulerDiagram constructor. */
function initEulerDiagram(eulerDiagram: EulerDiagram, predicates: string[], unreachable?: Unreachable) {

    let eulerSets = eulerDiagram.allSets = init2(predicates, unreachable);
    eulerDiagram.universalSet = eulerSets.filter(s => s.predicate === ALL)[0];
    if (!!true) return;

    // // Create the setFor() function to return the set corresponding to a given predicate,
    // // creating it on demand if it doesn't already exist. This function ensures that every
    // // request for the same predicate gets the same singleton set.
    // let setLookup = new Map<NormalPredicate, EulerSet>();
    // let setFor = (predicate: NormalPredicate) => {
    //     if (!setLookup.has(predicate)) {
    //         let newSet: EulerSet = {predicate, supersets: [], subsets: [], isPrincipal: false};
    //         setLookup.set(predicate, newSet);
    //     }
    //     return setLookup.get(predicate)!;
    // };

    // // Mark all sets corresponding to the given `predicates` as principal sets.
    // let principalPredicates = predicates.map(predicate => toNormalPredicate(predicate));
    // principalPredicates.forEach(p => setFor(p).isPrincipal = true);

    // // Retrieve the universal set for this euler diagram, which always corresponds to the '**' predicate.
    // let universe = eulerDiagram.universalSet = setFor(ALL);

    // // Insert each of the principal predicates into a DAG rooted at '**'.
    // // We never insert '**', because it is already the root set, and we just need to insert all its proper subsets.
    // // We never insert '∅', because it will never match any string, so its presence is unnecessary.
    // principalPredicates
    //     .filter(predicate => predicate !== ALL && predicate !== NONE)
    //     .forEach(predicate => insertAsDescendent(setFor(predicate), universe, setFor));

    // // TODO: temp testing...
    // removeSuperfluousSets(setLookup);

    // // Finally, compute the `sets` property.
    // let allSets = eulerDiagram.allSets = [] as EulerSet[];
    // setLookup.forEach(value => allSets.push(value));
}





// // TODO: revise all comments below...
// /**
//  * Inserts `insertee` into the euler diagram subgraph rooted at `ancestor`, preserving all invariants relating to the
//  * arrangement of sets. `insertee`'s predicate is assumed to be a proper subset of `ancestor`'s predicate.
//  * @param {EulerSet} insertee - the new set to be inserted into the euler diagram below `ancestor`.
//  * @param {EulerSet} ancestor - the 'root' set of the euler diagram subgraph in which `insertee` belongs.
//  * @param {(predicate: Predicate) => EulerSet} setFor - a function that returns the set for
//  *        a given predicate. It is expected to return the same instance when passed the same predicate for
//  *        the same euler diagram. When `insertee` overlaps an existing set in the subgraph, this function
//  *        is used to synthesize the additional intersection set(s).
//  */
// function insertAsDescendent(insertee: EulerSet, ancestor: EulerSet, setFor: (predicate: NormalPredicate) => EulerSet) {
//     //console.log(`${ancestor.predicate}   ===insert==>   ${insertee.predicate}`);

//     // If `insertee` already exists as a direct child of `ancestor`, there is nothing to do.
//     if (hasChild(insertee, ancestor)) return;

//     // Determine the set relationship between `insertee` and each of the `ancestor` set's existing children.
//     // Subsequent steps only need to know about those children of `ancestor` that are non-disjoint with `insertee`.
//     let hasSubsetOrSupersetComparands = false;
//     let nonDisjointComparands = ancestor.subsets.reduce(
//         (comparands, set) => {
//             let intersection = intersect(insertee.predicate, set.predicate);
//             if (intersection === insertee.predicate) hasSubsetOrSupersetComparands = true;
//             if (intersection === set.predicate) hasSubsetOrSupersetComparands = true;
//             if (intersection !== NONE) comparands.push({set, intersection: setFor(intersection)});
//             return comparands;
//         },
//         [] as Array<{set: EulerSet; intersection: EulerSet}>
//     );

//     // If the `ancestor` predicate has no existing children, or they are all disjoint with `insertee`,
//     // then we simply add `insertee` as a direct child of `ancestor`, and we are done.
//     if (nonDisjointComparands.length === 0) {
//         insertChild(insertee, ancestor);
//         return;
//     }

//     // `insertee` does have subset/superset/overlapping relationships with one or more of
//     // `ancestor`'s existing children. Work out how and where to insert it.
//     nonDisjointComparands.forEach(comparand => {

//         // `insertee` is a superset of the current comparand.
//         if (comparand.intersection === comparand.set) {
//             // Remove the comparand from `ancestor`.
//             removeChild(comparand.set, ancestor);

//             // Add `insertee` as a direct child of `ancestor`.
//             insertChild(insertee, ancestor);

//             // Recursively re-insert the comparand as a child of `insertee`.
//             insertAsDescendent(comparand.set, insertee, setFor);
//         }

//         // `insertee` is a subset of the current comparand.
//         else if (comparand.intersection === insertee) {
//             // Recursively insert `insertee` as a child of the comparand.
//             insertAsDescendent(insertee, comparand.set, setFor);
//         }

//         // `insertee` overlaps with the current comparand (i.e., it is not disjoint, nor a superset or subset).
//         else {
//             // TODO: document mod: *only* add as child if not a superset or subset of any other comparand
//             // Add `insertee` as a direct child of `ancestor`.
//             if (!hasSubsetOrSupersetComparands) insertChild(insertee, ancestor);

//             // TODO: BUG!!!...
//             // The following optimisation breaks invariants in some cases...
//             // - if the omitted intersection is added later elsewhere in the ED, then it may *not* end up being
//             //   a descendent of all supersets as it should be.


//             // As an optimisation, we *don't* recursively insert the intersection of `insertee` and the comparand
//             // when they are both auxiliary sets. Doing so adds needless extra recursive computation of intersections
//             // that can dominate total ED construction time in many cases. This optimisation is safe (i.e. it doesn't
//             // produce an invalid ED), because:
//             // - auxiliary sets (other than root) represent 'ambiguous' outcomes:
//             //   - they are *always* produced as the intersection of other sets;
//             //   - therefore, they *always* have more than one parent;
//             //   - therefore, there are *always* multiple paths to them from the root set.
//             // - if the best-matching set for some string is an auxiliary set, then we have an ambiguous outcome.
//             // - it is therefore unecessary to further refine the ED by adding the intersection of two auxiliary sets,
//             //   as the outcome will still be ambiguous so the additional set adds no functional distinction to the ED.
//             if (!insertee.isPrincipal && !comparand.set.isPrincipal) return;
//             //if (!insertee.isPrincipal && !comparand.set.isPrincipal && comparand.intersection.supersets.length === 0) return;

//             // TODO: temp testing...
//             // Recursively insert the intersection (i.e. the set representing the overlap between `insertee` and the
//             // comparand) into the EulerDiagram. By inserting it at root level, it will 'trickle down' to become a
//             // descendent of all existing supersets. This restores the invariant that the previous step may have
//             // suspended. At the very least, the overlap will become a child of both `insertee` and the comparand.
//             //insertAsDescendent(comparand.intersection, setFor(ALL), setFor);

//             // TODO: was...
//             insertAsDescendent(comparand.intersection, insertee, setFor);
//             insertAsDescendent(comparand.intersection, comparand.set, setFor);
//         }
//     });
// }





// /** Checks if parent/child links exist directly between `set` and `child`. */
// function hasChild(child: EulerSet, set: EulerSet): boolean {
//     return set.subsets.indexOf(child) !== -1;
// }





// /** Ensures parent/child links exist directly between `set` and `child`. */
// function insertChild(child: EulerSet, set: EulerSet) {
//     // NB: If the child is already there, make this a no-op.
//     if (hasChild(child, set)) return;
//     set.subsets.push(child);
//     child.supersets.push(set);
// }





// /** Removes the existing parent/child links between `set` and `child`. */
// function removeChild(child: EulerSet, set: EulerSet) {
//     set.subsets.splice(set.subsets.indexOf(child), 1);
//     child.supersets.splice(child.supersets.indexOf(set), 1);
// }





// // TODO: doc... defn superfluous set:
// // - is auxiliary
// // - has no children
// // - all parents are auxiliary
// function removeSuperfluousSets(allSets: Map<NormalPredicate, EulerSet>) {

//     while (true) {
//         let isUnchanged = true;
//         allSets.forEach((set, predicate) => {
//             let isKeeper = set.isPrincipal;
//             isKeeper = isKeeper || set.subsets.length > 0;
//             isKeeper = isKeeper || set.supersets.some(superset => superset.isPrincipal);
//             if (!isKeeper) {
//                 isUnchanged = false;
//                 allSets.delete(predicate);
//                 set.supersets.slice().forEach(superset => {
//                     removeChild(set, superset);
//                 });
//             }
//         });
//         if (isUnchanged) break;
//     }
// }










function init2(predicates: string[], unreachable?: Unreachable) {
    let eulerSets = new Map<NormalPredicate, EuSet>();

    let normalPredicates = predicates.map(toNormalPredicate);
    normalPredicates = normalPredicates.filter((el, i, arr) => arr.indexOf(el) === i); // de-duplicate.
    normalPredicates = normalPredicates.filter(p => p !== NONE); // '∅' is always omitted from EDs.
    let root = setFor(ALL);
    normalPredicates.map(setFor).forEach(eulerSet => {
        eulerSet.isPrincipal = true;
        eulerSet.ancestors.push(root);
    });
    normalPredicates = normalPredicates.filter(p => p !== ALL); // TODO: explain... If there, remove '**'

    // Phase I   O(n^3)   add all intersections to the list of NormalPredicates
    // TODO: make O(n^2) using HashSet of some kind
    for (let i = 0, len = normalPredicates.length; i < len; ++i) {
        let pi = normalPredicates[i];
        for (let j = i + 1; j < len; ++j) {
            let pj = normalPredicates[j];
            let intersection = intersect(pi, pj, unreachable);
            if (intersection === NONE || intersection === pi || intersection === pj) continue;
            if (normalPredicates.indexOf(intersection) === -1) normalPredicates.push(intersection); // NB makes O(n^3)!
        }
    }

    // Phase II   O(n^2)
    for (let i = 0, len = normalPredicates.length; i < len; ++i) {
        let pi = normalPredicates[i];
        let si = setFor(pi);
        for (let j = 0; j < len; ++j) {
            if (i === j) continue;
            let pj = normalPredicates[j];
            //TODO: BUG: if either pi or pj have alternations, `isSubsetOf` will throw
            if (intersect(pi, pj, unreachable) === pj) {
            //TODO: was... if (isSubsetOf(pj, pi)) {
                setFor(pj).ancestors.push(si);
            }
        }
    }



    // // TODO: temp print...
    // console.log('\n');
    // eulerSets.forEach(eset => {
    //     let ancs = eset.ancestors.map(s => s.predicate);
    //     console.log(`Ancestors:  ${eset.predicate}  <---  ${ancs.join(' ')}`);
    // });
    // console.log('\n');



    root.stage = 'doing';
    let doneCount = 0;
    while (doneCount < eulerSets.size) {

        // 1. Work out direct children of sets marked 'doing'
        eulerSets.forEach(eulerSet => {
            if (eulerSet.stage !== 'todo') return;
            if (eulerSet.ancestors.some(anc => anc.stage === 'todo')) return;
            eulerSet.ancestors.forEach(anc => {
                if (anc.stage === 'doing') {
                    anc.subsets.push(eulerSet);
                    eulerSet.supersets.push(anc);
                }
            });
        });

        // 2. Mark all 'doing' as 'done'
        eulerSets.forEach(eulerSet => {
            if (eulerSet.stage !== 'doing') return;
            eulerSet.stage = 'done';
            ++doneCount;
        });

        // 3. Mark next round of 'todo' sets as 'doing'
        eulerSets.forEach(eulerSet => {
            if (eulerSet.stage !== 'todo') return;
            if (eulerSet.ancestors.some(anc => anc.stage !== 'done')) return;
            eulerSet.stage = 'doing';
        });
    }



    // // TODO: temp print...
    // console.log('\n');
    // eulerSets.forEach(eset => {
    //     let children = eset.subsets.map(c => c.predicate);
    //     console.log(`Children:  ${eset.predicate}  --->  ${children.join(' ')}`);
    // });
    // console.log('\n');



    let allSets = [] as EulerSet[];
    eulerSets.forEach(eset => allSets.push(eset));
    return allSets;



    function setFor(predicate: NormalPredicate) {
        let eulerSet = eulerSets.get(predicate);
        if (!eulerSet) {
            eulerSet = {
                predicate,
                supersets: [],
                subsets: [],
                isPrincipal: false,
                ancestors: [],
                stage: 'todo',
            };
            eulerSets.set(predicate, eulerSet);
        }
        return eulerSet;
    }
}





interface EuSet {
    predicate: NormalPredicate;
    supersets: EuSet[];
    subsets: EuSet[];
    isPrincipal: boolean;

    ancestors: EuSet[];
    stage: 'todo'|'doing'|'done';
}
