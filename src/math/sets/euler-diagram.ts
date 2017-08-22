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
    const enum Rel { unknown, super, sub, disjoint, noncom, dontcare }

    let normalPredicates = predicates.map(toNormalPredicate);
    let rootIsPrincipal = normalPredicates.filter(p => p === ALL).length > 0;
    normalPredicates.unshift(ALL); // ensure '**' is always the first predicate
    normalPredicates = normalPredicates.filter((el, i, arr) => arr.indexOf(el) === i); // de-duplicate.
    normalPredicates = normalPredicates.filter(p => p !== NONE); // '∅' is always omitted from EDs.

    let principalCount = normalPredicates.length;
    let rels = normalPredicates.map(_ => normalPredicates.map(__ => Rel.unknown));

console.log('AAA');
//TODO: SLOWEST PART...

// ---------- Pass 1 ----------
    for (let i = 0; i < principalCount; ++i) {
        let lhs = normalPredicates[i];
        for (let j = 0; j < i; ++j) {
            let rhs = normalPredicates[j];

            let intersection = intersect(lhs, rhs, unreachable);
            if (intersection === rhs) {
                rels[i][j] = Rel.super;
                rels[j][i] = Rel.sub;
            }
            else if (intersection === lhs) {
                rels[i][j] = Rel.sub;
                rels[j][i] = Rel.super;
            }
            else if (intersection === NONE) {
                rels[i][j] = Rel.disjoint;
                rels[j][i] = Rel.disjoint;
            }
            else /* overlapping */ {
                // an auxiliary is born or recalled
                let k = normalPredicates.indexOf(intersection);
                if (k === -1) {
                    k = normalPredicates.push(intersection) - 1;
                    rels.push(normalPredicates.map(_ => Rel.unknown));
                    rels.forEach(rel => rel.push(Rel.unknown));
                }
                rels[i][j] = rels[j][i] = Rel.noncom;
                rels[k][i] = rels[k][j] = Rel.sub;
                rels[i][k] = rels[j][k] = Rel.super;

                // intersection inherits all supersets and disjoint sets from both lhs and rhs
                for (let kk = 0; kk < normalPredicates.length; ++kk) {
                    if (rels[k][kk] !== Rel.unknown) continue;
                    if (rels[i][kk] === Rel.disjoint || rels[j][kk] === Rel.disjoint) {
                        rels[k][kk] = rels[kk][k] = Rel.disjoint;
                    }
                    if (rels[i][kk] === Rel.sub || rels[j][kk] === Rel.sub) {
                        rels[k][kk] = Rel.sub;
                        rels[kk][k] = Rel.super;
                    }
                }
            }
        }
    }

    console.log('BBB');

    // ---------- Pass 2 ----------
    let hasPrincipalDescendents = normalPredicates.map(_ => false);
    for (let i = principalCount; i < normalPredicates.length; ++i) {
        let lhs = normalPredicates[i];
        for (let j = 0; j < principalCount; ++j) {
            if (rels[i][j] !== Rel.unknown) {
                if (rels[i][j] === Rel.super) hasPrincipalDescendents[i] = true;
                continue;
            }
            let rhs = normalPredicates[j];

            if (isSubsetOf(lhs, rhs)) {
                rels[i][j] = Rel.sub;
                rels[j][i] = Rel.super;
            }
            else if (isSubsetOf(rhs, lhs)) {
                rels[i][j] = Rel.super;
                rels[j][i] = Rel.sub;
                hasPrincipalDescendents[i] = true;
            }
            else {
                rels[i][j] = rels[j][i] = Rel.noncom;
            }
        }
    }

    console.log('CCC');

    // ---------- Pass 3 ----------
    for (let i = principalCount; i < normalPredicates.length; ++i) {
        let lhs = normalPredicates[i];
        for (let j = principalCount; j < i; ++j) {
            if (rels[i][j] !== Rel.unknown) continue;
            let rhs = normalPredicates[j];

            if (!hasPrincipalDescendents[i] && !hasPrincipalDescendents[j]) {
                rels[i][j] = rels[j][i] = Rel.dontcare;
            }
            else if (isSubsetOf(lhs, rhs)) {
                rels[i][j] = Rel.sub;
                rels[j][i] = Rel.super;
            }
            else if (isSubsetOf(rhs, lhs)) {
                rels[i][j] = Rel.super;
                rels[j][i] = Rel.sub;
            }
            else {
                rels[i][j] = rels[j][i] = Rel.noncom;
            }
        }
    }

    console.log('DDD');

    let allSets = eulerDiagram.allSets = normalPredicates.map((predicate, i) => {
        let eulerSet: EulerSet = {
            predicate,
            supersets: [],
            subsets: [],
            isPrincipal: i === 0 ? rootIsPrincipal : i < principalCount,
        };
        return eulerSet;
    });

    let ancestors = normalPredicates.map(_ => [] as number[]);
    for (let i = 0; i < normalPredicates.length; ++i) {
        for (let j = 0; j < normalPredicates.length; ++j) {
            if (rels[i][j] === Rel.sub) {
                ancestors[i].push(j);
            }
        }
    }

    // console.log('\n\n');
    // normalPredicates.forEach((p, i) => {
    //     console.log(`${i}   ${p}   ${ancestors[i].join(' ')}`);
    // });
    // console.log('\n');
    // rels.forEach(rel => {
    //     let strs = rel.map(r => {
    //         switch (r) {
    //             case Rel.unknown: return ' ';
    //             case Rel.disjoint: return '∙';
    //             case Rel.super: return '>';
    //             case Rel.sub: return '<';
    //             case Rel.noncom: return '~';
    //             case Rel.dontcare: return '#';
    //         }
    //     });
    //     console.log(strs.join(' '));
    // });
    // console.log('\n\n');


    console.log('EEE');

    const enum Stage {TODO, DOING, DONE}
    let stage = normalPredicates.map(_ => Stage.TODO);
    let doneCount = 0;
    while (doneCount < allSets.length) {

        // 1. Mark next round of 'todo' sets as 'doing'
        for (let i = 0; i < allSets.length; ++i) {
            if (stage[i] !== Stage.TODO) continue;
            if (ancestors[i].some(anc => stage[anc] !== Stage.DONE)) continue;
            stage[i] = Stage.DOING;
        }

        // 2. Work out direct children of sets marked 'doing'
        for (let i = 0; i < allSets.length; ++i) {
            if (stage[i] !== Stage.TODO) continue;
            if (ancestors[i].some(anc => stage[anc] === Stage.TODO)) continue;
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
