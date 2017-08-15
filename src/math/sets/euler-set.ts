import {NormalPredicate} from '../predicates';





/** Represents a single set contained in an euler diagram. */
export default interface EulerSet {


    /** The normalised predicate associated with this set. */
    predicate: NormalPredicate;


    /** Links to this set's direct parents (i.e., more generalised or 'wider' predicates). */
    supersets: EulerSet[];


    /** Links to this set's direct children (i.e., more specialised or 'narrower' predicates). */
    subsets: EulerSet[];


    /**
     * True iff this set's predicate is the normal form of a predicate supplied explicitly to the ED constructor.
     * Otherwise, this is an auxiliary set. Auxiliary sets are created to represent the intersection of other sets
     * in the ED. The root set '**' is also auxiliary iff it was not supplied explicitly to the ED constructor.
     */
    isPrincipal: boolean;
}
