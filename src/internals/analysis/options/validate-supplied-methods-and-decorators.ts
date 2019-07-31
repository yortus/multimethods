import {Decorators, Methods} from '../../../interface/multimethod';
import {ALL, NormalisedPattern} from '../../patterns';
import {Taxonomy} from '../../taxonomies';
import {debug, panic} from '../../util';




// TODO: doc and cleanup...
export function validateSuppliedMethodsAndDecorators(methods: Methods, decorators: Decorators) {

    // TODO: new cross-checks needed for decorator and method patterns...

    validate(methods);
    validate(decorators);
}




function validate(methods: Methods | Decorators): void {

    // TODO: still need this?
    // Perform strict validation. If any problems are found:
    // - issue a fatal error if options.strict is true.
    // - otherwise issue debug messages if debug.enabled is true
    let problems = listDiscontinuities(methods);
    if (debug.enabled) {
        problems.forEach(problem => debug(`${debug.VALIDATE} %s`, problem));
    }


    // TODO: doc these new invariants:
    // - all patterns in `methods` are valid
    // - no two patterns in `methods` have the same normalised pattern (use chains for this scenario)
    let deduped = {} as {[s: string]: string[]};
    Object.keys(methods).forEach(pattern => {
        let np = NormalisedPattern(pattern);
        deduped[np] = deduped[np] || [];
        deduped[np].push(pattern);
    });
    for (let np in deduped) {
        if (deduped[np].length <= 1) continue;
        return panic(
            `The pattern '${np}' is duplicated across multiple methods: ${deduped[np].join(`', '`)}.` +
            ` To resolve this, use a method chain.`
        );
    }

}




// TODO: doc...
//      - returns a list of human-readable problem descriptions where the methods statically don't cover some patterns

// Detect synthesized patterns in the taxonomy, i.e., ones with no exactly-matching patterns in the method table.
// They get there in two ways:
// (i)  the root Pattern.ALL where the raw methods hash doesn't explicitly handle it, and
// (ii) intersections of non-disjoint patterns that aren't explicitly handled in the methods hash
// Their presence implies that there are possibly inputs for which the multimethod provides no defined behaviour.
// This often represents a user error, so it's a useful warning to point these patterns out so their intended
// behaviour can be made explicit by the user.
// TODO: in explanation, c.f. F# which also issues a warning when a match expression doesn't cover all possible cases...
function listDiscontinuities(methods: Methods | Decorators) {
    if (methods === undefined) return [];

    let handledPatterns = Object.keys(methods).map(p => NormalisedPattern(p));
    let taxonomy = new Taxonomy(handledPatterns);
    let unhandledPatterns = taxonomy.taxa.map(t => t.pattern).filter(p => handledPatterns.indexOf(p) === -1);
    let problems = [] as string[];

    let hasUnhandledCatchall = unhandledPatterns.indexOf(ALL) !== -1;
    if (hasUnhandledCatchall) {
        problems.push(`No catch-all method. To resolve, add a method for the pattern '**'.`);
    }

    let unhandledIntersections = unhandledPatterns.filter(p => p !== ALL);
    unhandledIntersections.forEach(pattern => {
        problems.push(`Ambiguous dispatch for pattern '${pattern}'. To resolve, add a method for this pattern.`);
    });

    return problems;
}
