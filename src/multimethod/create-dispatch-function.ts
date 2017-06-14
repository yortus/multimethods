import computePredicateLineages from './compute-predicate-lineages';
import generateDispatchFunction from './codegen/generate-dispatch-function';
import MultimethodOptions from './multimethod-options';
import normaliseRules from './normalise-rules';
import {ANY, toPredicate, toNormalPredicate} from '../set-theory/predicates';
import {EulerDiagram} from '../set-theory/sets';
import {fatalError} from '../util';





// TODO: review all comments here - eg refs to 'RuleSet' should be updated to Multimethod, etc
/** Internal function used to generate the RuleSet#execute method. */
export default function createDispatchFunction(normalisedOptions: MultimethodOptions) {

    // Generate a taxonomic arrangement of all the predicate patterns that occur in the rule set.
    let eulerDiagram = new EulerDiagram<never>(Object.keys(normalisedOptions.rules).map(pattern => toPredicate(pattern)));

    // TODO: explain...
    if (normalisedOptions.strictChecks) {
        validateEulerDiagram(eulerDiagram, normalisedOptions);
    }

    // TODO: ...
    let normalisedRules = normaliseRules(normalisedOptions.rules);

    // Find every possible functionally-distinct route that any discriminant can take through the rule set.
    let eulerDiagramWithLineages = computePredicateLineages(eulerDiagram, normalisedRules, normalisedOptions);

    // TODO: ...
    let dispatchFunction = generateDispatchFunction(eulerDiagramWithLineages, normalisedOptions);
    return dispatchFunction;
}





// TODO: ...
function validateEulerDiagram(eulerDiagram: EulerDiagram<never>, options: MultimethodOptions) {

    // Detect synthesized patterns in the euler diagram (i.e., ones with no exactly-matching predicates in the rule set).
    // They get there in two ways:
    // (i)  the root Predicate.ANY where the raw rule set doesn't explicitly handle it, and
    // (ii) intersections of non-disjoint rules that aren't explicitly handled
    // Their presence implies that there are possibly inputs for which the multimethod provides no defined behaviour.
    // This often represents a user error, so it's a useful warning to point these patterns out so their intended
    // behaviour can be made explicit by the user.
    // TODO: in explanation, c.f. F# which also issues a warning when a match expression doesn't cover all possible cases...
    let normalizedPredicates = Object.keys(options.rules).map(p => toNormalPredicate(toPredicate(p)));
    let unhandledPredicates = eulerDiagram.sets.map(n => n.predicate.toString()).filter(p => normalizedPredicates.indexOf(<any> p) === -1);

    let hasUnhandledCatchall = unhandledPredicates.indexOf(ANY) !== -1;
    if (hasUnhandledCatchall) {
        return fatalError('MISSING_CATCHALL');
    }

    let unhandledIntersections = unhandledPredicates.filter(p => p !== ANY);
    if (unhandledIntersections.length > 0) {
        return fatalError('MISSING_INTERSECTIONS', `'${unhandledIntersections.join(`', '`)}'`);
    }
}
