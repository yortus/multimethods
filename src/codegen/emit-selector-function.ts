import Emitter from './emitter';
import {MMInfo, MMNode} from '../analysis';
import repeat from '../util/string-repeat';





// TODO: rewrite doc...
/**
 * Generates a function that, given a discriminant, returns the best-matching route executor from the given list of
 * candidates. The returned selector function is generated for maximum readability and efficiency, using conditional
 * constructs that follow the branches of the given `eulerDiagram`.
 * @param {EulerDiagram} eulerDiagram - The arrangement of patterns on which to base the returned selector function.
 * @returns {(address: string) => Function} The generated route selector function.
 */
export default function emitSelectorFunction(emit: Emitter, mminfo: MMInfo<MMNode>, env: Env) {

    // Generate the combined source code for selecting the best thunk based on predicate-matching of the discriminant.
    emit(`function ${env.THUNK_SELECTOR_NAME}(discriminant) {`);
    emitThunkSelectorBlock(emit, mminfo.rootNode, 1, env);
    emit('}');
}





// TODO: doc...
export type Env = {
    THUNK_SELECTOR_NAME: string;
    IS_MATCH_PREFIX: string;
    THUNK_PREFIX: string;
}





/** Helper function to generate source code for the thunk selector function. */
function emitThunkSelectorBlock(emit: Emitter, node: MMNode, nestDepth: number, env: Env) {

    // Make the indenting string corresponding to the given `nestDepth`.
    let indent = repeat('    ', nestDepth);

    // Recursively generate the conditional logic block to select among the given predicates.
    node.childNodes.forEach(node => {
        let condition = `${indent}if (${env.IS_MATCH_PREFIX}${node.identifier}(discriminant)) `;
        if (node.childNodes.length === 0) {
            // One-liner if-statement
            emit(`${condition}return ${env.THUNK_PREFIX}${node.entryPoint.identifier};`);
        }
        else {
            // Compound if-statement with nested block of conditions
            emit(`${condition}{`),
            emitThunkSelectorBlock(emit, node, nestDepth + 1, env),
            emit(`${indent}}`);
        }
    });

    // Add a line to select the base predicate if none of the more specialised predicates matched the discriminant.
    emit(`${indent}return ${env.THUNK_PREFIX}${node.entryPoint.identifier};`);
}
