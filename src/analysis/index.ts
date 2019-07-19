export {analyse} from './analyse';




// TODO: reuse/revise old comments below, all from computePredicateLineages()...
    // tslint:disable:max-line-length
// (1):
    // Every route begins with the universal pattern. It matches all discriminants,
    // and its method simply returns the `NEXT` sentinel value.

// (2):
    // Every taxon in the taxonomy represents the best-matching pattern for some set of discriminants. Therefore, the set
    // of all possible discriminants may be thought of as being partitioned by a taxonomy into one partition per taxon,
    // where for each partition, that partition's taxon holds the most-specific pattern that matches that partition's
    // discriminants. For every such partition, we can concatenate the 'equal best' methods for all the taxons along the
    // routes from the universal taxon to the most-specific taxon in the partition, thus getting a method
    // list for each partition, ordered from least- to most-specific, of all the methods that match all the partition's
    // discriminants. One complication here is that there may be multiple routes from the universal taxon to some other taxon in the
    // taxonomy, since it is a DAG and may therefore contain 'diamonds'. Since we tolerate no ambiguity, these multiple
    // routes must be effectively collapsed down to a single unambiguous route. The details of this are in the
    // disambiguateRoutes() function.

// (3):
    // Returns a mapping of every possible route through the given taxonomy, keyed by pattern. There is one route for each
    // taxon in the taxonomy. A route is simply a list of methods, ordered from least- to most-specific, that all match the set
    // of discriminants matched by the corresponding taxon's pattern. Routes are an important internal concept,
    // because each route represents the ordered list of matching methods for any given discriminant.

// (4):
    // Get all the methods in the methods hash whose normalized pattern exactly matches that of the given taxon's pattern.
    // Some sets may have no matching methods, because the taxonomy may include patterns that are not in the
    // original methods hash for the following cases:
    // (i) the always-present root pattern '**', which may be in the methods hash.
    // (ii) patterns synthesized at the intersection of overlapping (i.e. non-disjoint) patterns in the methods hash.

// (5):
    // We now have an array of methods whose patterns are all equivalent. To sort these methods from least- to most-
    // specific, we use a comparator that orders any two given 'equivalent' methods according to the following laws:
    // (i) A decorator is always less specific than a regular method
    // (ii) For two regular methods in the same chain, the leftmost method is more specific
    // (iii) For two decorators in the same chain, the leftmost decorator is less specific
    // (iv) Anything else is ambiguous and results in an error
