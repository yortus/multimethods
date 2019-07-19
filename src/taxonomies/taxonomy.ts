import {ALL, intersect, isSubsetOf, NONE, NormalisedPattern, Unreachable} from '../patterns';
import {fatalError} from '../util';
import {Taxon} from './taxon';




/*
 * A taxonomy depicts the relationships between a given list of patterns, such as those comprising the method
 * table of a multimethod. The patterns and their relationships are represented as a directed acyclic graph (DAG),
 * with patterns for nodes, and superset/subset relationships for edges. The DAG is in the form of a minimum
 * equivalent graph w.r.t. superset/subset relationships (i.e., only irreducible relationships have edges).
 *
 * The patterns in DAG nodes are all normalised, with no duplicates, and are of two kinds:
 * 1. 'principal patterns' are the normal forms of the patterns passed to the constructor.
 *    They are all guaranteed to be present in the DAG.
 * 2. 'auxiliary patterns' are added to the DAG to represent the intersections between principal patterns. For
 *    example, if `a*` and `*b` are the principal patterns, then `ab|a*b` will be added as an auxiliary pattern.
 *
 * Every DAG is rooted at the universal pattern `**`, which is added as an auxiliary pattern if not supplied as a
 * principal pattern. The pattern `∅` is always omitted from a taxonomy.
 *
 * The main use for a taxonomy is to find all matching patterns and the best-matching pattern for any given
 * discriminant string. This is achieved by traversing the DAG from the root, and following edges leading to nodes
 * whose pattern matches the discriminant. This may yield one or more paths, which may terminate at either a principal
 * pattern or an auxiliary pattern. These cases are described below:
 * a) The path(s) terminate at an auxiliary pattern. This means there is no unambiguous best-matching principal
 *    pattern for the discriminant. Recall that an auxiliary pattern is the intersection of two principal
 *    patterns, and thus has at least two principal supersets, which are equally-good matches for the discriminant.
 * b) The paths(s) terminate at a principal pattern. Due to the nature of the DAG, if there are multiple paths, then
 *    they will all terminate at the same principal pattern, which is the unambiguous best-match for the discriminant.
 * c) There is a single path to the best-matching pattern. The path contains all principal patterns that match the
 *    discriminant, ordered unambiguously from most-general match to most-specific match.
 * d) There are multiple paths to the best-matching pattern. The best-matching pattern is unambiguous,
 *    but there are multiple distinct ways to reach it and hence no unambiguous ordering of matching patterns
 *    from most-general to most-specific.
 *
 * EXAMPLE:
 * The input patterns `foo`, `bar`, `f{chars}`, `*o` result in the following
 * six-node DAG, with auxiliary patterns indicated by square brackets:
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
 * Creating a Taxonomy instance can be computationally expensive, with a worst case complexity of O(N^4), N being
 * the number of principal patterns. If every pair of principal patterns has a distinct non-empty intersection, then
 * there are O(N^2) auxiliary patterns, and all of these are potentially pairwise-compared for superset/subset
 * relationships, leading to the O(N^4) figure. In practice however, the amount of computation is typically orders of
 * magnitude less than the worst case because:
 * - the number of auxiliary patterns generated by intersecting principal patterns is typically far lower than
 *   O(N^2), and often closer to O(N), taking into account the likelihood of superset/subset/disjoint relationships
 *   between many pairs of principal patterns; and
 * - pairs of auxiliary patterns only need to be compared if either or both have at least one principal pattern as
 *   a subset. This eliminates the vast majority of auxiliary pair comparisons in typical cases.
 *
 * Upper bounds on the number of principal and auxiliary patterns are imposed so that instantiations do not cause
 * unresponsiveness or process crashes in pathological cases. The upper bounds are currently 625 and 3125 respectively.
 *
 * In the context of multimethods, it may also be pointed out that taxonomy instantiation is not on a critical path.
 * For each multimethod created, a single Taxonomy instance is instantiated during the multimethod creation process.
 */
export class Taxonomy {

    /** Constructs a new Taxonomy instance. */
    constructor(patterns: string[], unreachable?: Unreachable) {
        let principalPatterns = getPrincipalPatterns(patterns);
        let {allPatterns, supersets} = getSupersetRelationships(principalPatterns, unreachable);
        this.allTaxons = getMinimumEquivalentDAG(allPatterns, principalPatterns, supersets);
        this.rootTaxon = this.allTaxons.filter(t => t.pattern === ALL)[0];
    }

    /** The root of the taxonomy, which always represents the universal pattern '**'. */
    rootTaxon: Taxon;

    /** Holds a snapshot of all the taxons in the taxonomy at the time of construction. */
    allTaxons: Taxon[];

    // TODO: temp testing... doc... looks up the taxon for the given pattern. returns undefined if not found.
    // algo: exact match using canonical form of given Pattern/string
    findTaxon(pattern: string): Taxon | undefined {
        let p = NormalisedPattern(pattern);
        let result = this.allTaxons.filter(t => t.pattern === p)[0];
        return result;
    }

    /**
     * Enumerates every walk[1] in the taxonomy DAG from the root to the given `taxon` following 'subset' edges.
     * Each walk is represented as a list of sets arranged in walk-order (i.e., from the root to the given `taxon`).
     * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#walk
     */
    static findAllPathsFromRootTo(taxon: Taxon): Taxon[][] {
        if (taxon.generalisations.length === 0) return [[taxon]]; // Base case: there is a single path to the root taxon.
        let result = ([] as Taxon[][]).concat(...taxon.generalisations.map(Taxonomy.findAllPathsFromRootTo));
        return result.map(path => path.concat(taxon));
    }
}




// TODO: doc...
const MAX_PRINCIPAL_PATTERNS = 625;
const MAX_AUXILIARY_PATTERNS = 3125;




/** Helper to generate the list of principal patterns. These are normalised, duplicate-free, and exclude '∅'. */
function getPrincipalPatterns(originalPatterns: string[]) {
    let result = originalPatterns.map(NormalisedPattern);
    result = result.filter((el, i, arr) => arr.indexOf(el) === i); // de-duplicate.
    result = result.filter(p => p !== NONE); // '∅' is always omitted.
    return result;
}




/** Helper to obtain all auxiliary patterns, and all superset/subset relationships between patterns. */
function getSupersetRelationships(principalPatterns: NormalisedPattern[], unreachable?: Unreachable) {

    // Count up the principal patterns. Ensure the count does not exceed the complexity limit (more on this below).
    let principalCount = principalPatterns.length;
    if (principalCount > MAX_PRINCIPAL_PATTERNS) return fatalError.TOO_COMPLEX();

    // Create a list to hold all principal and auxiliary patterns. It always starts with the principal patterns
    // in the order given. Create a separate variable to accumulate auxiliary patterns as they are generated.
    let allPatterns = principalPatterns.slice();
    let auxiliaryPatterns = new Set<NormalisedPattern>();

    // Add an auxiliary pattern for the universal pattern '**' if it is not already a principal pattern.
    if (principalPatterns.indexOf(ALL) === -1) auxiliaryPatterns.add(ALL);

    // `supersets` is an array whose elements correspond 1:1 to the elements in the `patterns` array, in the
    // same order. Each element in `supersets` holds a set of numbers; each number `j` in the set at `supersets[i]`
    // is an index into the `patterns` array, and indicates that `patterns[j]` is a superset of `patterns[i]`.
    let supersets = principalPatterns.map(_ => new Set<number>());

    // [PASS 1]: Compute the intersection of every possible pair of principal patterns. This will generate
    // all auxiliary patterns. It will also reveal the ancestry relationships between principal patterns.
    // NB: This is O(N^2) in the number of principal patterns. We imposed a modest upper bound on N above
    // because computing N^2 intersections rapidly becomes expensive with increasing N.
    for (let i = 0; i < principalCount; ++i) {
        let lhs = allPatterns[i];
        for (let j = 0; j < i; ++j) {
            let rhs = allPatterns[j];
            let intersection = intersect(lhs, rhs, unreachable);
            if (intersection === rhs) {
                supersets[j].add(i);
            }
            else if (intersection === lhs) {
                supersets[i].add(j);
            }
            else if (intersection !== NONE) {
                auxiliaryPatterns.add(intersection);
            }
        }
    }

    // Apply another complexity upper bound to the number of auxiliary patterns. Since the following passes
    // are O(N^2) in the number of auxiliary patterns, N must be constrained to a modest value to prevent the
    // next passes from being too computationally expensive. However, the upper bound for auxiliary patterns
    // is higher than that for principal patterns, because the `isSubSetOf` checks done in the following passes
    // are significantly less costly than the `intersect` operations in pass 1.
    principalPatterns.forEach(p => auxiliaryPatterns.delete(p));
    if (auxiliaryPatterns.size > MAX_AUXILIARY_PATTERNS) return fatalError.TOO_COMPLEX();

    // Add the auxiliary patterns to the patterns list, and extend `supersets` to cover the new patterns.
    auxiliaryPatterns.forEach(aux => {
        allPatterns.push(aux);
        supersets.push(new Set());
    });

    // [PASS 2]: Check for subset/superset relationships between every possible pairing of a principal
    // pattern with an auxiliary pattern. This adds essential information to `supersets`. In this pass
    // we also detect auxiliary patterns that have no principal subsets, in order to speed up pass 3.
    let hasPrincipalSubsets = allPatterns.map(_ => false);
    for (let i = principalCount; i < allPatterns.length; ++i) {
        let lhs = allPatterns[i];
        for (let j = 0; j < principalCount; ++j) {
            let rhs = allPatterns[j];
            if (isSubsetOf(lhs, rhs)) {
                supersets[i].add(j);
            }
            else if (isSubsetOf(rhs, lhs)) {
                hasPrincipalSubsets[i] = true;
                supersets[j].add(i);
            }
        }
    }

    // [PASS 3]: Check for subset/superset relationships between every possible pair of auxiliary patterns.
    // We can skip this comparison when neither pattern has any principal subsets, as detected in pass 2.
    // This is because in such cases, each auxiliary pattern represents a better match for some subset of a
    // best-matching principal pattern, and that is all the information needed to determine the cases in which
    // a principal pattern is not an unambiguous best-match for a discriminant. Comparing two such auxiliary
    // patterns adds no useful information in this regard, so can be skipped.
    for (let i = principalCount; i < allPatterns.length; ++i) {
        let lhs = allPatterns[i];
        for (let j = principalCount; j < i; ++j) {
            if (!hasPrincipalSubsets[i] && !hasPrincipalSubsets[j]) continue;
            let rhs = allPatterns[j];
            if (isSubsetOf(lhs, rhs)) {
                supersets[i].add(j);
            }
            else if (isSubsetOf(rhs, lhs)) {
                supersets[j].add(i);
            }
        }
    }

    // All done. Return the principal + auxiliary pattern array, and the superset information that indexes into it.
    return {allPatterns, supersets};
}




/**
 * Helper to generate a minimum equivalent DAG. `allPatterns` represents the nodes in the DAG, and `supersets`
 * represents the edges. We create a minimal DAG by performing a transitive reduction [1] over the edges. For example,
 * if the patterns are `a*`, `a*t`, and `ant`, then `supersets` will contain 3 corresponding edges: `a*<-a*t`,
 * `a*<-ant` and `a*t<-ant`. After transitive reduction, the edge `a*<-ant` is removed, since there is still a path
 * from `a*` to `ant` via the other two edges.
 *
 * After transitive reduction, the DAG has the property that each path from the root to
 * a node represents a list of patterns in strict order from most-general to most-specific.
 *
 * [1] see transitive reduction: https://en.wikipedia.org/wiki/Transitive_reduction
 */
function getMinimumEquivalentDAG(allPatterns: NormalisedPattern[],
                                 principalPatterns: NormalisedPattern[],
                                 supersets: Array<Set<number>>) {

    // Create a node for each principal and auxiliary pattern. Each node has the shape of a Taxon.
    let nodes: Taxon[] = allPatterns.map(pattern => ({
        pattern,
        generalisations: [],
        specialisations: [],
        isPrincipal: principalPatterns.indexOf(pattern) !== -1,
    }));

    // Give every node a state, being either TODO, DOING, or DONE.
    const enum State {TODO, DOING, DONE}
    let state = nodes.map(_ => State.TODO);

    // Iterate until every node's edges have been reduced.
    let doneCount = 0;
    while (doneCount < nodes.length) {

        // 1. Mark next round of nodes to be reduced. These are nodes in the TODO state, whose superset nodes (if any)
        // are all in the DONE state. On the first iteration, this will be just the root `**` node. On the next
        // The next iteration, it will be the direct subsets of '**', and so on. This implies a breadth-first search.
        for (let i = 0; i < nodes.length; ++i) {
            if (state[i] !== State.TODO) continue; // Only consider nodes marked TODO.
            let allSupersetsDone = true;
            supersets[i].forEach(sup => allSupersetsDone = allSupersetsDone && state[sup] === State.DONE);
            if (!allSupersetsDone) continue; // Skip nodes with any supersets that are not marked DONE.
            state[i] = State.DOING;
        }

        // 2. Work out direct subsets of all nodes marked DOING.
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
                    parent.specialisations.push(child);
                    child.generalisations.push(parent);
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
