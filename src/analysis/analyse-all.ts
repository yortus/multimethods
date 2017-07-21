import analyseAmbiguities from './analyse-ambiguities';
import analyseChildNodes from './analyse-child-nodes';
import analyseMethodSequences from './analyse-method-sequences';
import analyseMethodTable from './analyse-method-table';
import analyseParentNodes from './analyse-parent-nodes';
import MMInfo from './mm-info';
import MMNode from './mm-node';
import {normaliseOptions} from './normalisation';
import Options from '../options';





// TODO: doc...
export default function analyseAll(options: Options) {
    let normalisedOptions = normaliseOptions(options);
    let mminfo1 = MMInfo.fromOptions(normalisedOptions);
    let mminfo2 = analyseMethodTable(mminfo1);
    let mminfo3 = analyseAmbiguities(mminfo2);
    let mminfo4 = analyseChildNodes(mminfo3);
    let mminfo5 = analyseParentNodes(mminfo4);
    let mminfo6 = analyseMethodSequences(mminfo5);
    return mminfo6 as MMInfo<MMNode>;
}





// TODO: reuse/revise old comments below, all from computePredicateLineages()...
// (1):
    // Every route begins with the universal predicate. It matches all discriminants,
    // and its method simply returns the `CONTINUE` sentinel value.

// (2):
    // Every set in the euler diagram represents the best-matching pattern for some set of discriminants. Therefore, the set
    // of all possible discriminants may be thought of as being partitioned by an euler diagram into one partition per set,
    // where for each partition, that partition's set holds the most-specific predicate that matches that partition's
    // discriminants. For every such partition, we can concatenate the 'equal best' methods for all the sets along the
    // routes from the universal set to the most-specific set in the partition, thus getting a method
    // list for each partition, ordered from least- to most-specific, of all the methods that match all the partition's
    // discriminants. One complication here is that there may be multiple routes from the universal set to some other set in the
    // euler diagram, since it is a DAG and may therefore contain 'diamonds'. Since we tolerate no ambiguity, these multiple
    // routes must be effectively collapsed down to a single unambiguous route. The details of this are in the
    // disambiguateRoutes() function.

// (3):
    // Returns a mapping of every possible route through the given euler diagram, keyed by predicate. There is one route for each
    // set in the euler diagram. A route is simply a list of methods, ordered from least- to most-specific, that all match the set
    // of discriminants matched by the corresponding euler diagram set's predicate. Routes are an important internal concept,
    // because each route represents the ordered list of matching methods for any given discriminant.

// (4):
    // Get all the methods in the methods hash whose normalized predicate exactly matches that of the given set's predicate.
    // Some sets may have no matching methods, because the euler diagram may include predicates that are not in the
    // original methods hash for the following cases:
    // (i) the always-present root predicate '…', which may be in the methods hash.
    // (ii) predicates synthesized at the intersection of overlapping (i.e. non-disjoint) predicates in the methods hash.

// (5):
    // We now have an array of methods whose predicates are all equivalent. To sort these methods from least- to most-
    // specific, we use a comparator that orders any two given 'equivalent' methods according to the following laws:
    // (i) A meta-method is always less specific than a regular method
    // (ii) For two regular methods in the same chain, the leftmost method is more specific
    // (iii) For two meta-methods in the same chain, the leftmost method is less specific
    // (iv) Anything else is ambiguous and results in an error
