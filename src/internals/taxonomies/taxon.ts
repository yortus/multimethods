import {NormalisedPattern} from '../patterns';




/** Represents a single node in a taxonomy. */
export interface Taxon {


    /** The normalised pattern associated with this taxon. */
    pattern: NormalisedPattern;


    /** Links to this taxon's direct parents (i.e., more generalised or 'wider' patterns). */
    generalisations: Taxon[];


    /** Links to this taxon's direct children (i.e., more specialised or 'narrower' patterns). */
    specialisations: Taxon[];


    /**
     * True iff this taxon's pattern is the normal form of a pattern supplied explicitly to the Taxonomy constructor.
     * Otherwise, this is an auxiliary taxon. Auxiliary taxons are created to represent the intersection of other
     * patterns in the taxonomy. The root taxon '**' is also auxiliary iff it was not supplied explicitly to the
     * Taxonomy constructor.
     */
    isPrincipal: boolean;
}
