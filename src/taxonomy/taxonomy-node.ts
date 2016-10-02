import Pattern from '../pattern';





/** Represents a single node in a Taxonomy graph. */
export default class TaxonomyNode {


    /** Constructs a new TaxonomyNode instance that holds the given pattern. */
    constructor(pattern: Pattern) {
        this.pattern = pattern;
    }


    /** The pattern associated with this node. */
    pattern: Pattern;


    /** Links to this node's direct parents (i.e., incoming edges). */
    generalizations: TaxonomyNode[] = [];


    /** Links to this node's direct children (i.e., outgoing edges). */
    specializations: TaxonomyNode[] = [];
}
