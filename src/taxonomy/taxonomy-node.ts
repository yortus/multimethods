import Predicate from '../predicate';





/** Represents a single node in a Taxonomy graph. */
export default class TaxonomyNode {


    /** Constructs a new TaxonomyNode instance that holds the given predicate. */
    constructor(predicate: Predicate) {
        this.predicate = predicate;
    }


    /** The predicate associated with this node. */
    predicate: Predicate;


    /** Links to this node's direct parents (i.e., more generalised or 'wider' predicates). */
    generalizations: TaxonomyNode[] = [];


    /** Links to this node's direct children (i.e., more specialised or 'narrower' predicates). */
    specializations: TaxonomyNode[] = [];
}
