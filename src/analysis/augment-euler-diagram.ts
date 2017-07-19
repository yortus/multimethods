import {EulerSet} from '../math/sets';





/** Internal helper function used to implement EulerDiagram#map. */
export default function augmentEulerDiagram<T, U>(eulerDiagram: AugmentedEulerDiagram<T>, callback: (set: AugmentedSet<T>) => U): AugmentedEulerDiagram<T & U> {

    // Clone the bare euler diagram.
    let oldSets = eulerDiagram.allSets;
    let newSets = oldSets.map(() => ({})) as Array<AugmentedSet<T & U>>;
    let oldToNew = oldSets.reduce((map, old, i) => map.set(old, newSets[i]), new Map());
    newSets.forEach((set, i) => {
        set.predicate = oldSets[i].predicate;
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
    let newEulerDiagram = {} as AugmentedEulerDiagram<T & U>;
    newEulerDiagram.universalSet = oldToNew.get(eulerDiagram.universalSet);
    newEulerDiagram.allSets = newSets;
    newEulerDiagram.findSet = eulerDiagram.findSet as any; // TODO: hacky...
    return newEulerDiagram;
}





// TODO: doc...
export interface AugmentedEulerDiagram<T> {
    universalSet: AugmentedSet<T>;
    allSets: AugmentedSet<T>[];
    findSet(predicate: string): AugmentedSet<T> | undefined;
}





// TODO: doc helper type
export type AugmentedSet<T> = EulerSet & T & {supersets: AugmentedSet<T>[]; subsets: AugmentedSet<T>[];}
