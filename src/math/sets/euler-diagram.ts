import {fatalError} from '../../util';
import {ALL, intersect, isSubsetOf, NONE, NormalPredicate, toNormalPredicate, Unreachable} from '../predicates';
import {EulerSet} from './euler-set';





/*
 * An EulerDiagram depicts the relationships between a given list of predicates, such as those comprising the method
 * table of a multimethod. The predicates and their relationships are represented as a directed acyclic graph (DAG),
 * with predicates for nodes, and superset/subset relationships for edges. The DAG is in the form of a minimum
 * equivalent graph w.r.t. superset/subset relationships (i.e., only irreducible relationships have edges).
 *
 * The predicates in DAG nodes are all normalised, with no duplicates, and are of two kinds:
 * 1. 'principal predicates' are the normal forms of the predicates passed to the constructor.
 *    They are all guaranteed to be present in the DAG.
 * 2. 'auxiliary predicates' are added to the DAG to represent the intersections between principal predicates. For
 *    example, if `a*` and `*b` are the principal predicates, then `ab|a*b` will be added as an auxiliary predicate.
 *
 * Every DAG is rooted at the universal predicate `**`, which is added as an auxiliary predicate if not supplied as a
 * principal predicate. The predicate `∅` is always omitted from EulerDiagrams.
 *
 * The main use for an EulerDiagram is to find all matching predicates and the best-matching predicate for any given
 * discriminant string. This is achieved by traversing the DAG from the root, and following edges leading to nodes
 * whose predicate matches the discriminant. This may yield one or more paths, which may terminate at either a principal
 * predicate or an auxiliary predicate. These cases are described below:
 * a) The path(s) terminate at an auxiliary predicate. This means there is no unambiguous best-matching principal
 *    predicate for the discriminant. Recall that an auxiliary predicate is the intersection of two principal
 *    predicates, and thus has at least two principal supersets, which are equally-good matches for the discriminant.
 * b) The paths(s) terminate at a principal predicate. Due to the nature of the DAG, if there are multiple paths, then
 *    they will all terminate at the same principal predicate, which is the unambiguous best-match for the discriminant.
 * c) There is a single path to the best-matching predicate. The path contains all principal predicates that match the
 *    discriminant, ordered unambiguously from most-general match to most-specific match.
 * d) There are multiple paths to the best-matching predicate. The best-matching predicate is unambiguous,
 *    but there are multiple distinct ways to reach it and hence no unambiguous ordering of matching predicates
 *    from most-general to most-specific.
 *
 * EXAMPLE:
 * The input predicates `foo`, `bar`, `f{chars}`, `*o` result in the following
 * six-node DAG, with auxiliary predicates indicated by square brackets:
 *
 *          f*
 *        /    \
 *       /      \
 *      /        \
 * [**] --- *o --- [f*o] --- foo
 *      \
 *       \
 *        \
 *          bar
 *
 * PERFORMANCE NOTES:
 * Instantiating an EulerDiagram can be computationally expensive, with a worst case complexity of O(N^4), N being the
 * number of principal predicates. If every pair of principal predicates has a distinct non-empty intersection, then
 * there are O(N^2) auxiliary predicates, and all of these are potentially pairwise-compared for superset/subset
 * relationships, leading to the O(N^4) figure. In practice however, the amount of computation is typically orders of
 * magnitude less than the worst case because:
 * - the number of auxiliary predicates generated by intersecting principal predicates is typically far lower than
 *   O(N^2), and often closer to O(N), taking into account the likelihood of superset/subset/disjoint relationships
 *   between many pairs of principal predicates; and
 * - pairs of auxiliary predicates only need to be compared if either or both have at least one principal predicate as
 *   a subset. This eliminates the vast majority of auxiliary pair comparisons in typical cases.
 *
 * Upper bounds on the number of principal and auxiliary predicates are imposed so that instantiations do not cause
 * unresponsiveness or process crashes in pathological cases. The upper bounds are currently 625 and 3125 respectively.
 *
 * In the context of multimethods, it may also be pointed out that EulerDiagram instantiation is not on a critical path.
 * For each multimethod created, a single EulerDiagram is instantiated during the multimethod creation process.
 */
export class EulerDiagram {

    /** Constructs a new EulerDiagram instance. */
    constructor(predicates: string[], unreachable?: Unreachable) {
        let principalPredicates = getPrincipalPredicates(predicates);
        let {allPredicates, supersets} = getSupersetRelationships(principalPredicates, unreachable);
        this.allSets = getMinimumEquivalentDAG(allPredicates, principalPredicates, supersets);
        this.universalSet = this.allSets.filter(s => s.predicate === ALL)[0];
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





// TODO: doc...
const MAX_PRINCIPAL_PREDICATES = 625;
const MAX_AUXILIARY_PREDICATES = 3125;





/** Helper to generate the list of principal predicates. These are normalised, duplicate-free, and exclude '∅'. */
function getPrincipalPredicates(originalPredicates: string[]) {
    let principalPredicates = originalPredicates.map(toNormalPredicate);
    principalPredicates = principalPredicates.filter((el, i, arr) => arr.indexOf(el) === i); // de-duplicate.
    principalPredicates = principalPredicates.filter(p => p !== NONE); // '∅' is always omitted.
    return principalPredicates;
}





/** Helper to obtain all auxiliary predicates, and all superset/subset relationships between predicates. */
function getSupersetRelationships(principalPredicates: NormalPredicate[], unreachable?: Unreachable) {

    // Count up the principal predicates. Ensure the count does not exceed the complexity limit (more on this below).
    let principalCount = principalPredicates.length;
    if (principalCount > MAX_PRINCIPAL_PREDICATES) return fatalError.TOO_COMPLEX();

    // Create a list to hold all principal and auxiliary predicates. It always starts with the principal predicates
    // in the order given. Create a separate variable to accumulate auxiliary predicates as they are generated.
    let allPredicates = principalPredicates.slice();
    let auxiliaryPredicates = new Set<NormalPredicate>();

    // Add an auxiliary predicate for the universal set '**' if it is not already a principal predicate.
    if (principalPredicates.indexOf(ALL) === -1) auxiliaryPredicates.add(ALL);

    // `supersets` is an array whose elements correspond 1:1 to the elements in the `predicates` array, in the
    // same order. Each element in `supersets` holds a set of numbers; each number `j` in the set at `supersets[i]`
    // is an index into the `predicates` array, and indicates that `predicates[j]` is a superset of `predicates[i]`.
    let supersets = principalPredicates.map(_ => new Set<number>());

    // [PASS 1]: Compute the intersection of every possible pair of principal predicates. This will generate
    // all auxiliary predicates. It will also reveal the ancestry relationships between principal predicates.
    // NB: This is O(N^2) in the number of principal predicates. We imposed a modest upper bound on N above
    // because computing N^2 intersections rapidly becomes expensive with increasing N.
    for (let i = 0; i < principalCount; ++i) {
        let lhs = allPredicates[i];
        for (let j = 0; j < i; ++j) {
            let rhs = allPredicates[j];
            let intersection = intersect(lhs, rhs, unreachable);
            if (intersection === rhs) {
                supersets[j].add(i);
            }
            else if (intersection === lhs) {
                supersets[i].add(j);
            }
            else if (intersection !== NONE) {
                auxiliaryPredicates.add(intersection);
            }
        }
    }

    // Apply another complexity upper bound to the number of auxiliary predicates. Since the following passes
    // are O(N^2) in the number of auxiliary predicates, N must be constrained to a modest value to prevent the
    // next passes from being too computationally expensive. However, the upper bound for auxiliary predicates
    // is higher than that for principal predicates, because the `isSubSetOf` checks done in the following passes
    // are significantly less costly than the `intersect` operations in pass 1.
    principalPredicates.forEach(p => auxiliaryPredicates.delete(p));
    if (auxiliaryPredicates.size > MAX_AUXILIARY_PREDICATES) return fatalError.TOO_COMPLEX();

    // Add the auxiliary predicates to the predicates list, and extend `supersets` to cover the new predicates.
    auxiliaryPredicates.forEach(aux => {
        allPredicates.push(aux);
        supersets.push(new Set());
    });

    // [PASS 2]: Check for subset/superset relationships between every possible pairing of a principal
    // predicate with an auxiliary predicate. This adds essential information to `supersets`. In this pass
    // we also detect auxiliary predicates that have no principal subsets, in order to speed up pass 3.
    let hasPrincipalSubsets = allPredicates.map(_ => false);
    for (let i = principalCount; i < allPredicates.length; ++i) {
        let lhs = allPredicates[i];
        for (let j = 0; j < principalCount; ++j) {
            let rhs = allPredicates[j];
            if (isSubsetOf(lhs, rhs)) {
                supersets[i].add(j);
            }
            else if (isSubsetOf(rhs, lhs)) {
                hasPrincipalSubsets[i] = true;
                supersets[j].add(i);
            }
        }
    }

    // [PASS 3]: Check for subset/superset relationships between every possible pair of auxiliary predicates.
    // We can skip this comparison when neither predicate has any principal subsets, as detected in pass 2.
    // This is because in such cases, each auxiliary predicate represents a better match for some subset of a
    // best-matching principal predicate, and that is all the information needed to determine the cases in which
    // a principal predicate is not an unambiguous best-match for a discriminant. Comparing two such auxiliary
    // predicates adds no useful information in this regard, so can be skipped.
    for (let i = principalCount; i < allPredicates.length; ++i) {
        let lhs = allPredicates[i];
        for (let j = principalCount; j < i; ++j) {
            if (!hasPrincipalSubsets[i] && !hasPrincipalSubsets[j]) continue;
            let rhs = allPredicates[j];
            if (isSubsetOf(lhs, rhs)) {
                supersets[i].add(j);
            }
            else if (isSubsetOf(rhs, lhs)) {
                supersets[j].add(i);
            }
        }
    }

    // All done. Return the principal + auxiliary predicate array, and the superset information that indexes into it.
    return {allPredicates, supersets};
}




/**
 * Helper to generate a minimum equivalent DAG. `allPredicates` represents the nodes in the DAG, and `supersets`
 * represents the edges. We create a minimal DAG by performing a transitive reduction [1] over the edges. For example,
 * if the predicates are `a*`, `a*t`, and `ant`, then `supersets` will contain 3 corresponding edges: `a*<-a*t`,
 * `a*<-ant` and `a*t<-ant`. After transitive reduction, the edge `a*<-ant` is removed, since there is still a path
 * from `a*` to `ant` via the other two edges.
 *
 * After transitive reduction, the DAG has the property that each path from the root to
 * a node represents a list of predicates in strict order from most-general to most-specific.
 *
 * [1] see transitive reduction: https://en.wikipedia.org/wiki/Transitive_reduction
 */
function getMinimumEquivalentDAG(allPredicates: NormalPredicate[],
                                 principalPredicates: NormalPredicate[],
                                 supersets: Array<Set<number>>) {

    // Create a node for each principal and auxiliary predicate. Each node has the shape of an EulerSet.
    let nodes: EulerSet[] = allPredicates.map(predicate => ({
        predicate,
        supersets: [],
        subsets: [],
        isPrincipal: principalPredicates.indexOf(predicate) !== -1,
    }));

    // Give every node a state, being either TODO, DOING, or DONE.
    const enum State {TODO, DOING, DONE}
    let state = nodes.map(_ => State.TODO);

    // Iterate until every node's edges have been reduced.
    let doneCount = 0;
    while (doneCount < nodes.length) {

        // 1. Mark next round of nodes to be reduced. These are nodes in the TODO state, whose superset nodes (if any)
        // are all in the DONE state. On the first iteration, this will be just the root `**` node. On the next
        // The next iteration, it will be the 'direct' subsets of '**', and so on. This implies a breadth-first search.
        for (let i = 0; i < nodes.length; ++i) {
            if (state[i] !== State.TODO) continue; // Only consider nodes marked TODO.
            let allSupersetsDone = true;
            supersets[i].forEach(sup => allSupersetsDone = allSupersetsDone && state[sup] === State.DONE);
            if (!allSupersetsDone) continue; // Skip nodes with any supersets that are not marked DONE.
            state[i] = State.DOING;
        }

        // 2. Work out 'direct' subsets of all nodes marked DOING.
        for (let i = 0; i < nodes.length; ++i) {
            if (state[i] !== State.TODO) continue; // Only consider nodes marked TODO.
            let someSupersetsTodo = false;
            supersets[i].forEach(sup => someSupersetsTodo = someSupersetsTodo || state[sup] === State.TODO);
            if (someSupersetsTodo) continue; // Skip nodes with any supersets marked TODO.
            supersets[i].forEach(sup => {
                // The 'direct' supersets of the TODO node are those of its supersets that are marked DOING.
                if (state[sup] === State.DOING) {
                    let child = nodes[i];
                    let parent = nodes[sup];
                    parent.subsets.push(child);
                    child.supersets.push(parent);
                }
            });
        }

        // 3. Mark all DOING nodes as DONE.
        for (let i = 0; i < nodes.length; ++i) {
            if (state[i] !== State.DOING) continue;
            state[i] = State.DONE;
            ++doneCount;
        }
    }

    // `nodes` now represents a DAG with minimal superset/subset edges.
    return nodes;
}
