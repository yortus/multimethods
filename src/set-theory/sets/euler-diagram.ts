import insertAsDescendent from './[todo-was-insert-as-descendent]';
import {Predicate, toPredicate, toNormalPredicate, NormalPredicate, ANY} from '../predicates';
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
export default class EulerDiagram<T = {}> {


    /**
     * Constructs a new euler diagram comprising the sets defined by the given predicates.
     */
    constructor(predicates: Predicate[]) {
        initEulerDiagram(this, predicates);
    }


    /** Holds the root set of the euler diagram. */
    universe: AugmentedSet<T>;


    /** Holds a snapshot of all the sets in the euler diagram at the time of construction. */
    sets: AugmentedSet<T>[];


    // TODO: temp testing... doc... looks up the set for the given predicate. returns undefined if not found.
    // algo: exact match using canonical form of given Predicate/string
    get(predicate: string): AugmentedSet<T> {
        let p = toNormalPredicate(toPredicate(predicate));
        let result = this.sets.filter(set => set.predicate === p)[0];
        return result;
    }


    // TODO: temp testing... doc... returns a NEW augmented euler set, leaving original one unchanged
    // TODO: better name? It maps the props AND assigns props back to sets (like a mixin)
    // - augment? addProps?
    augment<U>(callback: (set: AugmentedSet<T>) => U): EulerDiagram<T & U> {
        return augmentEulerDiagram(this, callback);
    }
}





// TODO: doc helper type
export type AugmentedSet<T> = EulerSet & T & {supersets: AugmentedSet<T>[]; subsets: AugmentedSet<T>[];}





/** Internal helper function used by the EulerDiagram constructor. */
function initEulerDiagram<T>(eulerDiagram: EulerDiagram<T>, predicates: Predicate[]) {

    // Create the setFor() function to return the set corresponding to a given pattern,
    // creating it on demand if it doesn't already exist. This function ensures that every
    // request for the same pattern gets the same singleton set.
    let setLookup = new Map<NormalPredicate, AugmentedSet<T>>();
    let setFor = (predicate: NormalPredicate) => {
        if (!setLookup.has(predicate)) setLookup.set(predicate, new EulerSet(predicate) as AugmentedSet<T>);
        return setLookup.get(predicate)!;
    }

    // Retrieve the universal set for this euler diagram, which always corresponds to the '…' predicate.
    let universe = eulerDiagram.universe = setFor(ANY);

    // Insert each of the given predicates, except '…', into a DAG rooted at '…'.
    // The insertion logic assumes only normalized patterns, which we obtain first.
    predicates
        .map(predicate => toNormalPredicate(predicate)) // TODO: what if normalized patterns contain duplicates?
        .filter(predicate => predicate !== ANY) // TODO: why need this??
        .forEach(predicate => insertAsDescendent(setFor(predicate), universe, setFor));

    // Finally, compute the `sets` property.
    let sets: Array<EulerSet & T> = eulerDiagram.sets = [];
    setLookup.forEach(value => sets.push(value));
}





/** Internal helper function used to implement EulerDiagram#map. */
function augmentEulerDiagram<T, U>(eulerDiagram: EulerDiagram<T>, callback: (set: AugmentedSet<T>) => U): EulerDiagram<T & U> {

    // Clone the bare euler diagram.
    let oldSets = eulerDiagram.sets;
    let newSets = oldSets.map(old => new EulerSet(old.predicate)) as Array<AugmentedSet<T & U>>;
    let oldToNew = oldSets.reduce((map, old, i) => map.set(old, newSets[i]), new Map());
    newSets.forEach((set, i) => {
        set.supersets = oldSets[i].supersets.map(gen => oldToNew.get(gen));
        set.subsets = oldSets[i].subsets.map(spc => oldToNew.get(spc));
    });

    // Map and assign the additional properties.
    newSets.forEach((set: any, i) => {
        let oldProps: any = oldSets[i];
        let newProps: any = callback(oldProps) || {};
        Object.keys(newProps).forEach(key => { if (!(key in set)) set[key] = newProps[key]; });
        Object.keys(oldProps).forEach(key => { if (!(key in set)) set[key] = oldProps[key]; });
    });

    // Return the new euler diagram.
    let newEulerDiagram = new EulerDiagram<T & U>([]);
    newEulerDiagram.universe = oldToNew.get(eulerDiagram.universe);
    newEulerDiagram.sets = newSets;
    return newEulerDiagram;
}
