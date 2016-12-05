import computePredicateLineages from './compute-predicate-lineages';
import generateDispatchFunction from './codegen/generate-dispatch-function';
import MultimethodOptions from './multimethod-options';
import normaliseRules from './normalise-rules';
import Predicate from '../predicate';
import Taxonomy from '../taxonomy';
import {warn} from '../util';





// TODO: review all comments here - eg refs to 'RuleSet' should be updated to Multimethod, etc
/** Internal function used to generate the RuleSet#execute method. */
export default function createDispatchFunction(normalisedOptions: MultimethodOptions) {

    // Generate a taxonomic arrangement of all the predicate patterns that occur in the rule set.
    let taxonomy = new Taxonomy<never>(Object.keys(normalisedOptions.rules).map(pattern => new Predicate(pattern)));

    // TODO: explain...
    // TODO: use a flag in options to enable/disable this warning/error
    validateTaxonomy(taxonomy, normalisedOptions);

    // TODO: ...
    let normalisedRules = normaliseRules(normalisedOptions.rules);

    // Find every possible functionally-distinct route that any discriminant can take through the rule set.
    let taxonomyWithLineages = computePredicateLineages(taxonomy, normalisedRules, normalisedOptions.unhandled);

    // TODO: ...
    let dispatchFunction = generateDispatchFunction(taxonomyWithLineages, normalisedOptions);
    return dispatchFunction;
}





// TODO: ...
function validateTaxonomy(taxonomy: Taxonomy<never>, options: MultimethodOptions) {

    // Detect synthesized patterns in the taxonomy (i.e., ones with no exactly-matching predicates in the rule set).
    // They get there in two ways:
    // (i)  the root Predicate.ANY where the raw rule set doesn't explicitly handle it, and
    // (ii) intersections of non-disjoint rules that aren't explicitly handled
    // Their presence implies that there are possibly inputs for which the multimethod provides no defined behaviour.
    // This often represents a user error, so it's a useful warning to point these patterns out so their intended
    // behaviour can be made explicit by the user.
    // TODO: in explanation, c.f. F# which also issues a warning when a match expression doesn't cover all possible cases...
    let normalizedPredicates = Object.keys(options.rules).map(p => new Predicate(p).normalized);
    let unhandledPredicates = taxonomy.allNodes.map(n => n.predicate).filter(p => normalizedPredicates.indexOf(p) === -1);
    if (unhandledPredicates.length > 0) {
        // TODO: improve error message...
        warn(`Multimethod contains conflicts: ${unhandledPredicates.map(p => p.toString()).join(', ')}`);
    }
}
