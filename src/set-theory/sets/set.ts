import {NormalPredicate} from '../predicates';





// TODO: review all comments...
/** Represents a single set contained in an euler diagram. */
export default class Set {


    /** Constructs a new Set instance that holds the given normalised predicate. */
    constructor(predicate: NormalPredicate) {
        this.predicate = predicate;
    }


    /** The normalised predicate associated with this set. */
    predicate: NormalPredicate;


    /** Links to this set's direct parents (i.e., more generalised or 'wider' predicates). */
    supersets: Set[] = [];


    /** Links to this set's direct children (i.e., more specialised or 'narrower' predicates). */
    subsets: Set[] = [];
}
