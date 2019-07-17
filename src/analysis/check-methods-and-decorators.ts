import {ALL, toNormalPredicate} from '../math/predicates';
import {EulerDiagram} from '../math/sets';
import {debug, Dict, fatalError} from '../util';




// TODO: doc and cleanup...
export function checkMethodsAndDecorators(methods: Dict<Function | Function[]>, decorators: Dict<Function | Function[]>) {

    // TODO: new cross-checks needed for decorator and method patterns...

    check(methods);
    check(decorators);
}




function check(methods: Dict<Function | Function[]>) {

    // TODO: was... remove? clients can no longer violate this since meths and decs are kept separate
    // // For method chains, ensure first regular method in chain (if any) comes after last decorator in chain (if any).
    // Object.keys(methods).forEach((predicate): void => {
    //     let method = methods[predicate];
    //     if (!Array.isArray(method)) return;
    //     let chain = method;
    //     if (chain.some((fn, i) => i < chain.length - 1 && !isDecorator(fn) && isDecorator(chain[i + 1]))) {
    //         return fatalError.MIXED_CHAIN(predicate);
    //     }
    // });

    // TODO: still need this?
    // Perform strict validation. If any problems are found:
    // - issue a fatal error if options.strict is true.
    // - otherwise issue debug messages if debug.enabled is true
    let problems = listDiscontinuities(methods);
    if (debug.enabled) {
        problems.forEach(problem => debug(`${debug.VALIDATE} %s`, problem));
    }


    // TODO: doc these new invariants:
    // - all predicates in `methods` are valid
    // - no two predicates in `methods` have the same normalised predicate (use chains for this scenario)
    let deduped = {} as {[s: string]: string[]};
    Object.keys(methods).forEach(predicate => {
        let np = toNormalPredicate(predicate);
        deduped[np] = deduped[np] || [];
        deduped[np].push(predicate);
    });
    for (let np in deduped) {
        if (deduped[np].length <= 1) continue;
        fatalError.DUPLICATE_PREDICATE(np, `'${deduped[np].join(`', '`)}'`);
    }

}




// TODO: doc...
//      - returns a list of human-readable problem descriptions where the methods statically don't cover some predicates

// Detect synthesized patterns in the euler diagram, i.e., ones with no exactly-matching predicates in the method table.
// They get there in two ways:
// (i)  the root Predicate.ALL where the raw methods hash doesn't explicitly handle it, and
// (ii) intersections of non-disjoint predicates that aren't explicitly handled in the methods hash
// Their presence implies that there are possibly inputs for which the multimethod provides no defined behaviour.
// This often represents a user error, so it's a useful warning to point these patterns out so their intended
// behaviour can be made explicit by the user.
// TODO: in explanation, c.f. F# which also issues a warning when a match expression doesn't cover all possible cases...
function listDiscontinuities(methods: Dict<Function | Function[]>) {
    if (methods === undefined) return [];

    let handledPredicates = Object.keys(methods).map(p => toNormalPredicate(p));
    let euler = new EulerDiagram(handledPredicates);
    let unhandledPredicates = euler.allSets.map(n => n.predicate).filter(p => handledPredicates.indexOf(p) === -1);
    let problems = [] as string[];

    let hasUnhandledCatchall = unhandledPredicates.indexOf(ALL) !== -1;
    if (hasUnhandledCatchall) {
        problems.push(`No catch-all method. To resolve, add a method for the predicate '**'.`);
    }

    let unhandledIntersections = unhandledPredicates.filter(p => p !== ALL);
    unhandledIntersections.forEach(predicate => {
        problems.push(`Ambiguous dispatch for predicate '${predicate}'. To resolve, add a method for this predicate.`);
    });

    return problems;
}
