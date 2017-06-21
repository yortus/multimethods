import {ANY, toPredicate, toNormalPredicate} from '../set-theory/predicates';
import {EulerDiagram} from '../set-theory/sets';
import fatalError from '../util/fatal-error';
import MultimethodOptions from './multimethod-options';





// TODO: ...
export default function validate(multimethod: { _options: MultimethodOptions }) {
    let eulerDiagram = new EulerDiagram<never>(Object.keys(multimethod._options.rules).map(pattern => toPredicate(pattern)));
    let problems = validateEulerDiagram(eulerDiagram, multimethod._options);
    if (problems.length === 0) return;
    fatalError('VALIDATION', '\n' + problems.map((p, i) => `${i + 1}. ${p}`).join('\n'));
}





// TODO: ...
export function validateEulerDiagram(eulerDiagram: EulerDiagram<never>, options: MultimethodOptions): ProblemList {
    let problems: ProblemList = [];

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
        problems.push(`No catch-all handler. To resolve, add a handler for the predicate '...'.`);
    }
    let unhandledIntersections = unhandledPredicates.filter(p => p !== ANY);
    unhandledIntersections.forEach(predicate => {
        problems.push(`Ambiguous dispatch for discriminants matching '${predicate}'. To resolve, add a handler for this predicate.`);
    });
    return problems;
}





export type ProblemList = string[];
