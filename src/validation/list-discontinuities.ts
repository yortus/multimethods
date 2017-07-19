import EulerDiagram from '../math/sets/euler-diagram';
import Options from '../options';
import {toPredicate, toNormalPredicate, ANY} from '../math/predicates';





// TODO: doc... returns a list of human-readable problem descriptions where the methods statically don't cover some predicates
// Detect synthesized patterns in the euler diagram (i.e., ones with no exactly-matching predicates in the methods hash).
// They get there in two ways:
// (i)  the root Predicate.ANY where the raw methods hash doesn't explicitly handle it, and
// (ii) intersections of non-disjoint predicates that aren't explicitly handled in the methods hash
// Their presence implies that there are possibly inputs for which the multimethod provides no defined behaviour.
// This often represents a user error, so it's a useful warning to point these patterns out so their intended
// behaviour can be made explicit by the user.
// TODO: in explanation, c.f. F# which also issues a warning when a match expression doesn't cover all possible cases...
export default function listDiscontinuities(methods: Options['methods']) {
    if (methods === undefined) return [];

    let handledPredicates = Object.keys(methods).map(p => toNormalPredicate(toPredicate(p)));
    let euler = new EulerDiagram(handledPredicates);
    let unhandledPredicates = euler.allSets.map(n => n.predicate).filter(p => handledPredicates.indexOf(p) === -1);
    let problems = [] as string[];

    let hasUnhandledCatchall = unhandledPredicates.indexOf(ANY) !== -1;
    if (hasUnhandledCatchall) {
        problems.push(`No catch-all method. To resolve, add a method for the predicate '...'.`);
    }

    let unhandledIntersections = unhandledPredicates.filter(p => p !== ANY);
    unhandledIntersections.forEach(predicate => {
        problems.push(`Ambiguous dispatch for predicate '${predicate}'. To resolve, add a method for this predicate.`);
    });

    return problems;
}
