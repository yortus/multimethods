import {ALL, intersect, isSubsetOf, NONE, toNormalPredicate, Unreachable} from '../predicates';
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

    let eulerSets = eulerDiagram.allSets = init3(predicates, unreachable);
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





function init3(predicates: string[], unreachable?: Unreachable) {

    console.log('AAA');

    let normalPredicates = predicates.map(toNormalPredicate);
    normalPredicates.unshift(ALL); // ensure '**' is there at the start
    normalPredicates = normalPredicates.filter((el, i, arr) => arr.indexOf(el) === i); // de-duplicate.
    normalPredicates = normalPredicates.filter(p => p !== NONE); // '∅' is always omitted from EDs.

    let principalCount = normalPredicates.length;
    let descendents = normalPredicates.map(_ => [] as number[]);

    for (let i = 0; i < normalPredicates.length; ++i) {
        let lhs = normalPredicates[i];
        for (let j = 0; j < i && j < principalCount; ++j) {
            let rhs = normalPredicates[j];
            if (i < principalCount) {

                // LHS and RHS are both principal predicates - we need to intersect them
                let intersection = intersect(lhs, rhs, unreachable);
                if (intersection === rhs) {
                    descendents[i].push(j);
                }
                else if (intersection === lhs) {
                    descendents[j].push(i);
                }
                else if (intersection !== NONE) {
                    // an auxiliary is born or recalled
                    let k = normalPredicates.indexOf(intersection);
                    if (k === -1) {
                        k = normalPredicates.push(intersection) - 1;
                        descendents.push([]);
                    }
                    descendents[i].push(k);
                    descendents[j].push(k);
                }
            }
            else {
                // LHS is an auxiliary predicate - only use isSubsetOf - no more intersections
                if (isSubsetOf(lhs, rhs)) {
                    descendents[j].push(i);
                }
                else if (isSubsetOf(rhs, lhs)) {
                    descendents[i].push(j);
                }
            }
        }
    }

    console.log('BBB');

    // // TODO: what we got?
    // normalPredicates.forEach((p, i) => {
    //     console.log(`${i}   ${p}   ${ancestors[i].join(' ')}`);
    // });
    // console.log('\n');
    // matrix.forEach(row => {
    //     let s = row.map(cmp => {
    //         switch (cmp) {
    //             case 0: return ' ';
    //             case 1: return 'v';
    //         }
    //     }).join(' ');
    //     console.log(s);
    // });
    // console.log('\n');

    let allSets = normalPredicates.map((predicate, i) => {
        let eulerSet: EulerSet = {
            predicate,
            supersets: [],
            subsets: [],
            isPrincipal: i < principalCount,
        };
        return eulerSet;
    });

    console.log('CCC');

    const enum Stage {TODO, DOING, DONE}
    let stage = normalPredicates.map(_ => Stage.TODO);
    let doneCount = 0;
    while (doneCount < allSets.length) {

        // 1. Mark next round of 'todo' sets as 'doing'
        for (let i = 0; i < allSets.length; ++i) {
            if (stage[i] !== Stage.TODO) continue;
            if (descendents[i].some(dsc => stage[dsc] !== Stage.DONE)) continue;
            stage[i] = Stage.DOING;
        }

        // 2. Work out direct children of sets marked 'doing'
        for (let i = 0; i < allSets.length; ++i) {
            if (stage[i] !== Stage.TODO) continue;
            if (descendents[i].some(dsc => stage[dsc] === Stage.TODO)) continue;
            descendents[i].forEach(dsc => {
                if (stage[dsc] === Stage.DOING) {
                    let child = allSets[dsc];
                    let parent = allSets[i];
                    parent.subsets.push(child);
                    child.supersets.push(parent);
                }
            });
        }

        // 3. Mark all 'doing' as 'done'
        for (let i = 0; i < allSets.length; ++i) {
            if (stage[i] !== Stage.DOING) continue;
            stage[i] = Stage.DONE;
            ++doneCount;
        }
    }

    console.log('DDD');

    return allSets;
}
