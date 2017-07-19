import {NormalPredicate} from '../predicates';





// TODO: review all comments...
/** Represents a single set contained in an euler diagram. */
export default interface EulerSet {


    /** The normalised predicate associated with this set. */
    predicate: NormalPredicate;


    /** Links to this set's direct parents (i.e., more generalised or 'wider' predicates). */
    supersets: EulerSet[];


    /** Links to this set's direct children (i.e., more specialised or 'narrower' predicates). */
    subsets: EulerSet[];
}
