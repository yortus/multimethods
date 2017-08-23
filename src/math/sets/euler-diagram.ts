import {TOO_COMPLEX} from '../../util/fatal-error';
import {ALL, intersect, isSubsetOf, NONE, NormalPredicate, toNormalPredicate, Unreachable} from '../predicates';
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
function initEulerDiagram(eulerDiagram: EulerDiagram, methodTablePredicates: string[], unreachable?: Unreachable) {

    // Generate the list of principal predicates. They are all normalised predicates.
    // The list always includes '**', always excludes '∅', and contains no duplicates.
    let predicates = methodTablePredicates.map(toNormalPredicate);
    let rootIsPrincipal = predicates.filter(p => p === ALL).length > 0;
    predicates.unshift(ALL); // ensure '**' is always first in the list.
    predicates = predicates.filter((el, i, arr) => arr.indexOf(el) === i); // de-duplicate.
    predicates = predicates.filter(p => p !== NONE); // '∅' is always omitted from EDs.

    // Count up the principal predicates. Ensure the count does not exceed the complexity limit (more on this below).
    let principalCount = predicates.length;
    if (principalCount > MAX_PRINCIPAL_PREDICATES) return TOO_COMPLEX();

    // Prepare for the generation of auxiliary predicates and ancestry information below.
    // NB: `ancestors` is an array of sets corresponding 1:1 to the elements in the `predicates` array.
    //     Each set contains numbers; each number in the set at `ancestors[i]` is an index into the
    //     `predicates` array of a predicate that is a proper superset of the predicate at `predicates[i]`.
    let auxiliaries = new Set<NormalPredicate>();
    let ancestors = predicates.map(_ => new Set<number>());

    // [PASS 1]: Compute the intersection of every possible pair of principal predicates. This will generate
    // all auxiliary predicates. It will also reveal the ancestry relationships between principal predicates.
    // NB: This is O(N^2) in the number of principal predicates. We imposed a modest upper bound on N above
    // because computing N^2 intersections rapidly becomes expensive with increasing N.
    for (let i = 0; i < principalCount; ++i) {
        let lhs = predicates[i];
        for (let j = 0; j < i; ++j) {
            let rhs = predicates[j];
            let intersection = intersect(lhs, rhs, unreachable);
            if (intersection === rhs) {
                ancestors[j].add(i);
            }
            else if (intersection === lhs) {
                ancestors[i].add(j);
            }
            else if (intersection !== NONE) {
                auxiliaries.add(intersection);
            }
        }
    }

    // Apply another complexity upper bound to the number of auxiliary predicates. Since the following passes
    // are O(N^2) in the number of auxiliary predicates, N must be constrained to a modest value to prevent the
    // next passes from being too computationally expensive. However, the upper bound for auxiliary predicates
    // is higher than that for principal predicates, because the `isSubSetOf` checks done in the following passes
    // are significantly less costly than the `intersect` operations in pass 1.
    predicates.forEach(p => auxiliaries.delete(p));
    if (auxiliaries.size > MAX_AUXILIARY_PREDICATES) return TOO_COMPLEX();

    // Add the auxiliary predicates to the predicates list, and extend `ancestors` to cover the new predicates.
    auxiliaries.forEach(aux => {
        predicates.push(aux);
        ancestors.push(new Set());
    });

    // [PASS 2]: Check for subset/superset relationships between every possible pairing of a principal
    // predicate with an auxiliary predicate. This adds essential information to `ancestors`. In this pass
    // we also detect auxiliary predicates that have no principal descendents, in order to speed up pass 3.
    let hasPrincipalDescendents = predicates.map(_ => false);
    for (let i = principalCount; i < predicates.length; ++i) {
        let lhs = predicates[i];
        for (let j = 0; j < principalCount; ++j) {
            let rhs = predicates[j];
            if (isSubsetOf(lhs, rhs)) {
                ancestors[i].add(j);
            }
            else if (isSubsetOf(rhs, lhs)) {
                hasPrincipalDescendents[i] = true;
                ancestors[j].add(i);
            }
        }
    }

    // [PASS 3]: Check for subset/superset relationships between every possible pair of auxiliary predicates.
    // We can skip the check where neither predicate has any principal descendents, as detected in pass 2.
    for (let i = principalCount; i < predicates.length; ++i) {
        let lhs = predicates[i];
        for (let j = principalCount; j < i; ++j) {
            if (!hasPrincipalDescendents[i] && !hasPrincipalDescendents[j]) continue;
            let rhs = predicates[j];
            if (isSubsetOf(lhs, rhs)) {
                ancestors[i].add(j);
            }
            else if (isSubsetOf(rhs, lhs)) {
                ancestors[j].add(i);
            }
        }
    }

    // We now have enough ancestry information to construct a DAG with a node for each predicate, and edges
    // corresponding to every superset/subset relationship between nodes. In particular, we want the 'minimum
    // equivalent graph' with only edges for direct parent/child relationships between supersets/subsets.
    // Note that we left out the computation of some ancestry information in the passes above (e.g. in pass 3).
    // That is an optimisation to greatly reduce combinatorial complexity based on the observation that not
    // all of the ancestry information is necessary for our purposes. What we essentially need to know is every
    // 'way into' and 'way out of' every principal predicate via supersets/subsets, such that we know (i) precisely
    // which principal predicate (if any) is the unambiguous best match for any given discriminant string; and
    // (ii) regardless which path we take from the root following matching predicates, we will arrive at the
    // same best-matching predicate if a unique one exists; and (iii) leaves = carve-outs showing ambiguities

    // [1] see transitive reduction: https://en.wikipedia.org/wiki/Transitive_reduction


    // first make the nodes for the DAG.
    let allSets = eulerDiagram.allSets = predicates.map((predicate, i) => {
        let eulerSet: EulerSet = {
            predicate,
            supersets: [],
            subsets: [],
            isPrincipal: i === 0 ? rootIsPrincipal : i < principalCount,
        };
        return eulerSet;
    });

    // console.log('\n\n');
    // normalPredicates.forEach((p, i) => {
    //     console.log(`${i}   ${p}   ${ancestors[i].join(' ')}`);
    // });
    // console.log('\n');
    // for (let i = 0; i < normalPredicates.length; ++i) {
    //     let s = '';
    //     for (let j = 0; j < normalPredicates.length; ++j) {
    //         switch (rels[i * stride + j]) {
    //             case Rel.unknown: s += '  '; break;
    //             case Rel.disjoint: s += '∙ '; break;
    //             case Rel.super: s += '> '; break;
    //             case Rel.sub: s += '< '; break;
    //             case Rel.noncom: s += '~ '; break;
    //             case Rel.dontcare: s += '# '; break;
    //         }
    //     }
    //     console.log(s);
    // }
    // console.log('\n\n');

    console.log('EEE');

    // now the edges for the DAG... this does the 'transitive reduction' of ancestors
    const enum Stage {TODO, DOING, DONE}
    let stage = predicates.map(_ => Stage.TODO);
    let doneCount = 0;
    while (doneCount < allSets.length) {

        // 1. Mark next round of 'todo' sets as 'doing'
        for (let i = 0; i < allSets.length; ++i) {
            if (stage[i] !== Stage.TODO) continue;
            let allAncestorsDone = true;
            ancestors[i].forEach(anc => allAncestorsDone = allAncestorsDone && stage[anc] === Stage.DONE);
            if (!allAncestorsDone) continue;
            stage[i] = Stage.DOING;
        }

        // 2. Work out direct children of sets marked 'doing'
        for (let i = 0; i < allSets.length; ++i) {
            if (stage[i] !== Stage.TODO) continue;
            let someAncestorsTodo = false;
            ancestors[i].forEach(anc => someAncestorsTodo = someAncestorsTodo || stage[anc] === Stage.TODO);
            if (someAncestorsTodo) continue;
            ancestors[i].forEach(anc => {
                if (stage[anc] === Stage.DOING) {
                    let child = allSets[i];
                    let parent = allSets[anc];
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

    console.log('FFF');

    // Retrieve the universal set for this euler diagram, which always corresponds to the '**' predicate.
    eulerDiagram.universalSet = allSets[0];

    // Mark all sets corresponding to the given `predicates` as principal sets.
    //...

    // Finally, compute the `sets` property.
    //...
}





const MAX_PRINCIPAL_PREDICATES = 1000;
const MAX_AUXILIARY_PREDICATES = 5000;
