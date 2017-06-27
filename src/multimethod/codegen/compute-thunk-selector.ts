import {EulerDiagram, EulerSet} from '../../set-theory/sets';
import repeatString from '../../util/repeat-string';
import {toIdentifierParts} from '../../set-theory/predicates';
import {WithThunks} from './compute-all-thunks';





// TODO: rewrite doc...
/**
 * Generates a function that, given a discriminant, returns the best-matching route executor from the given list of
 * candidates. The returned selector function is generated for maximum readability and efficiency, using conditional
 * constructs that follow the branches of the given `eulerDiagram`.
 * @param {EulerDiagram} eulerDiagram - The arrangement of patterns on which to base the returned selector function.
 * @returns {(address: string) => Function} The generated route selector function.
 */
export default function computeThunkSelector(eulerDiagram: EulerDiagram<WithThunks>) {

    // Generate the combined source code for selecting the best thunk. This includes local variable declarations
    // for all the match functions and all the candidate route handler functions, as well as the dispatcher function
    // housing all the conditional logic for selecting the best route handler based on address matching.
    let lines = [
        'function selectThunk(discriminant) {',
        ...generateSelectorSourceCode(eulerDiagram.universe, 1),
        '};',
    ];
    let source = lines.join('\n') + '\n';
    return source;
}





/** Helper function to generate source code for the thunk selector function. */
function generateSelectorSourceCode(from: EulerSet & WithThunks, nestDepth: number) {
    let subsets = from.subsets;

    // Make the indenting string corresponding to the given `nestDepth`.
    let indent = repeatString('    ', nestDepth);

    // Recursively generate the conditional logic block to select among the given patterns.
    let lines: string[] = [];
    subsets.forEach((set: EulerSet & WithThunks, i) => {
        let condition = `${indent}${i > 0 ? 'else ' : ''}if (isMatchː${toIdentifierParts(set.predicate)}(discriminant)) `;

        if (set.subsets.length === 0) {
            lines.push(`${condition}return ${set.thunkName};`);
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
    lines.push(`${indent}return ${from.thunkName};`);
    return lines;
}
