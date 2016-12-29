import {NormalPredicate} from '../predicates';





// TODO: review all comments...
/** Represents a single node in a Taxonomy graph. */
export default class Set {


    /** Constructs a new TaxonomyNode instance that holds the given normalised predicate. */
    constructor(predicate: NormalPredicate) {
        this.predicate = predicate;
    }


    /** The normalised predicate associated with this node. */
    predicate: NormalPredicate;


    /** Links to this node's direct parents (i.e., more generalised or 'wider' predicates). */
    supersets: Set[] = [];


    /** Links to this node's direct children (i.e., more specialised or 'narrower' predicates). */
    subsets: Set[] = [];
}
