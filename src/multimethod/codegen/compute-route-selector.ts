import Pattern from '../../pattern';
import RouteExecutor from './route-executor';
import Taxonomy, {TaxonomyNode} from '../../taxonomy';
import {WithExecutors} from './compute-all-executors';





// TODO: rewrite doc...
/**
 * Generates a function that, given a discriminant, returns the best-matching route executor from the given list of
 * candidates. The returned selector function is generated for maximum readability and efficiency, using conditional
 * constructs that follow the branches of the given `taxonomy`.
 * @param {Taxonomy} taxonomy - The arrangement of patterns on which to base the returned selector function.
 * @param {Map<Pattern, Function>} candidates - The route executors for each pattern in the given `taxonomy`.
 * @returns {(address: string) => Function} The generated route selector function.
 */
export default function computeRouteSelector(taxonomy: Taxonomy<WithExecutors>) {

    // Get all the patterns in the taxomony as a list, and their corresponding executors in a parallel list.
    // TODO: extra doc - explain opt here that match functions never have captures due to using normalised forms...
    //let patternNames = taxonomy.allNodes.map(node => node.pattern.identifier);
    let executors = taxonomy.allNodes.map(node => node.entryPoint);

// TODO: temp testing... HACKY BUGGY brittle B/C assumes taxonomy.allNodes has identical pattern order as `candidates` object keys...    
// TODO: how otherwise to link candidates back to patterns, since they just preserve rule names that were derived from pattern identifiers, but are no longer necessarily the same
// TODO: maybe use a Map again... but that won't work on ES5?? (but can shim)
let patterns = taxonomy.allNodes.map(node => node.pattern);

    // // Generate a unique pretty name for each pattern, suitable for use in the generated source code.
    // let patternNames = patterns.map(p => p.identifier);

    // Generate the combined source code for selecting the best route handler. This includes local variable declarations
    // for all the match functions and all the candidate route handler functions, as well as the dispatcher function
    // housing all the conditional logic for selecting the best route handler based on address matching.
    let lines = [
        '// ========== SELECTOR FUNCTION ==========',
        'function _selectExecutor(discriminant) {',
        ...generateSelectorSourceCode(taxonomy.rootNode, 1),
        '};',
        ...patterns.map((p, i) => `var matches${p.identifier} = taxonomy.get('${p}').pattern.match;`),
    ];

    // FOR DEBUGGING: uncomment the following line to see the generated code for each route selector at runtime.
    // console.log(`\n\n\n================ ROUTE SELECTOR ================\n${lines.join('\n')}`);

    // Evaluate the source code, and return its result, which is the route selector function. The use of eval here is
    // safe. There are no untrusted inputs substituted into the source. More importantly, the use of eval here allows
    // for route selection code that is both more readable and more efficient, since it is tailored specifically to the
    // give taxonomy of patterns, rather than having to be generalized for all possible cases.
    // let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
    // return fn;

    let source = lines.join('\n') + '\n';
    return source;
}





/** A RouteSelector function takes a discriminant string and returns the best-matching route executor for it. */
export type RouteSelector = (discriminant: string) => RouteExecutor;





/** Helper function to generate source code for part of the dispatcher function used for route selection. */
function generateSelectorSourceCode(from: TaxonomyNode & WithExecutors, nestDepth: number) {
    let specializations = from.specializations;

    // Make the indenting string corresponding to the given `nestDepth`.
    let indent = '    '.repeat(nestDepth);

    // Recursively generate the conditional logic block to select among the given patterns.
    let lines: string[] = [];
    specializations.forEach((node: TaxonomyNode & WithExecutors, i) => {
        let patternName = node.pattern.identifier;
        let condition = `${indent}${i > 0 ? 'else ' : ''}if (matches${patternName}(discriminant)) `;
        if (node.specializations.length === 0) return lines.push(`${condition}return ${node.entryPoint};`);
        lines = [
            ...lines,
            `${condition}{`,
            ...generateSelectorSourceCode(node, nestDepth + 1),
            `${indent}}`
        ];
    });

    // Add a line to select the fallback pattern if none of the more specialised patterns matched the discriminant.
    lines.push(`${indent}return ${from.entryPoint};`);
    return lines;
}
