import {toIdentifier} from '../../set-theory/predicates';
import RouteExecutor from './route-executor';
import {EulerDiagram, Set} from '../../set-theory/sets';
import {WithExecutors} from './compute-all-executors';





// TODO: rewrite doc...
/**
 * Generates a function that, given a discriminant, returns the best-matching route executor from the given list of
 * candidates. The returned selector function is generated for maximum readability and efficiency, using conditional
 * constructs that follow the branches of the given `eulerDiagram`.
 * @param {EulerDiagram} eulerDiagram - The arrangement of patterns on which to base the returned selector function.
 * @returns {(address: string) => Function} The generated route selector function.
 */
export default function computeRouteSelector(eulerDiagram: EulerDiagram<WithExecutors>) {

// TODO: revise comments...
    // Get all the patterns in the taxomony as a list, and their corresponding executors in a parallel list.
    // TODO: extra doc - explain opt here that match functions never have captures due to using normalised forms...
    //let patternNames = eulerDiagram.sets.map(set => set.pattern.identifier);

// TODO: temp testing... HACKY BUGGY brittle B/C assumes eulerDiagram.sets has identical pattern order as `candidates` object keys...    
// TODO: how otherwise to link candidates back to patterns, since they just preserve rule names that were derived from pattern identifiers, but are no longer necessarily the same
// TODO: maybe use a Map again... but that won't work on ES5?? (but can shim)
let predicates = eulerDiagram.sets.map(set => set.predicate);

    // // Generate a unique pretty name for each pattern, suitable for use in the generated source code.
    // let patternNames = patterns.map(p => p.identifier);

    // Generate the combined source code for selecting the best route handler. This includes local variable declarations
    // for all the match functions and all the candidate route handler functions, as well as the dispatcher function
    // housing all the conditional logic for selecting the best route handler based on address matching.
    let lines = [
        '// ========== SELECTOR FUNCTION ==========',
        'function _selectExecutor(discriminant) {',
        ...generateSelectorSourceCode(eulerDiagram.universe, 1),
        '};',
        ...predicates.map(p => `var matches${toIdentifier(p)} = toMatchFunction(eulerDiagram.get('${p}').predicate.toString());`),
    ];

    // FOR DEBUGGING: uncomment the following line to see the generated code for each route selector at runtime.
    // console.log(`\n\n\n================ ROUTE SELECTOR ================\n${lines.join('\n')}`);

    // Evaluate the source code, and return its result, which is the route selector function. The use of eval here is
    // safe. There are no untrusted inputs substituted into the source. More importantly, the use of eval here allows
    // for route selection code that is both more readable and more efficient, since it is tailored specifically to the
    // given euler diagram, rather than having to be generalized for all possible cases.
    // let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
    // return fn;

    let source = lines.join('\n') + '\n';
    return source;
}





/** A RouteSelector function takes a discriminant string and returns the best-matching route executor for it. */
export type RouteSelector = (discriminant: string) => RouteExecutor;





/** Helper function to generate source code for part of the dispatcher function used for route selection. */
function generateSelectorSourceCode(from: Set & WithExecutors, nestDepth: number) {
    let subsets = from.subsets;

    // Make the indenting string corresponding to the given `nestDepth`.
    let indent = '    '.repeat(nestDepth);

    // Recursively generate the conditional logic block to select among the given patterns.
    let lines: string[] = [];
    subsets.forEach((set: Set & WithExecutors, i) => {
        let predicateIdentifier = toIdentifier(set.predicate);
        let condition = `${indent}${i > 0 ? 'else ' : ''}if (matches${predicateIdentifier}(discriminant)) `;

        if (set.subsets.length === 0) {
            lines.push(`${condition}return ${set.entryPoint};`);
            return;
        }

        lines = [
            ...lines,
            `${condition}{`,
            ...generateSelectorSourceCode(set, nestDepth + 1),
            `${indent}}`
        ];
    });

    // Add a line to select the fallback predicate if none of the more specialised predicates matched the discriminant.
    lines.push(`${indent}return ${from.entryPoint};`);
    return lines;
}
