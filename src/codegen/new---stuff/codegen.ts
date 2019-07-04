import {MMInfo, MMNode} from '../../analysis';
import repeat from '../../util/string-repeat';
import {eliminateDeadCode} from '../eliminate-dead-code';
import {multimethodTemplate} from './multimethod-template';
import * as substitutions from './substitutions';
import {beautify, minify, replaceAll, replaceSection} from './template-utilities';




export function emit(mminfo: MMInfo<MMNode>) {
    let source = multimethodTemplate.toString();
    source = minify(source);
    source = beautify(source);

    // do mm-wide replacements
    let MM = substitutions.forMultimethod(mminfo);
    source = replaceAll(source, 'MM', MM);

    // dispatch function: substitute __MM_NAME__, __MM_PARAMS__ and __MM_ARITY__
    //emitBanner(emit, 'MULTIMETHOD DISPATCHER');

    // thunk selector - generate the code for it
    //emitBanner(emit, 'THUNK SELECTOR');
    source = replaceSection(source, 'SELECT_THUNK', () => {
        return codegenThunkSelectorBlock(mminfo.rootNode, 1);

        function codegenThunkSelectorBlock(node: MMNode, nestDepth: number) {
            let result = '';

            // Make the indenting string corresponding to the given `nestDepth`.
            let indent = repeat('\t', nestDepth);

            // Recursively generate the conditional logic block to select among the given predicates.
            result += node.childNodes.map(childNode => {
                let nodeSubs = substitutions.forNode(childNode);

                let condition = `${indent}if (${nodeSubs.NAMEOF_IS_MATCH}(discriminant)) `;
                if (childNode.childNodes.length === 0) {
                    // One-liner if-statement
                    return `${condition}return ${nodeSubs.NAMEOF_ENTRYPOINT_THUNK};\n`;
                }
                else {
                    // Compound if-statement with nested block of conditions
                    let nestedBlock = codegenThunkSelectorBlock(childNode, nestDepth + 1); // NB: recursive
                    return `${condition}{\n${nestedBlock}${indent}}\n`;
                }
            }).join('');

            // Add a line to select the base predicate if none of the more specialised predicates matched the discriminant.
            result += `${indent}return ${substitutions.forNode(node).NAMEOF_ENTRYPOINT_THUNK};\n`;
            return result;
        }

    });

    // thunk functions - codegen foreach thunk
    //emitBanner(emit, 'THUNKS');
    source = replaceSection(source, 'FOREACH_MATCH', content => {
        return mminfo.allNodes.map(node => {
            // result += `// -------------------- ${node.exactPredicate} --------------------\n`;
            return node.methodSequence.map((_, index, seq) => {

                // To avoid unnecessary duplication, skip emit for regular methods that are less
                // specific that the set's predicate, since these will be handled in their own set.
                if (!seq[index].isMeta && seq[index].fromNode !== seq[0].fromNode) return '';

                let nodeSubs = substitutions.forNode(seq[index].fromNode);
                let result = content;
                result = replaceAll(result, 'NODE', nodeSubs);
                result = replaceAll(result, 'MATCH', substitutions.forMatch(seq, index));
                return result;
            }).join('');
        }).join('');
    });

    // environment - codegen foreach method
    //emitBanner(emit, 'ENVIRONMENT');

    source = replaceSection(source, 'FOREACH_NODE', content => {
        return mminfo.allNodes.map((node, nodeIndex) => {
            // result += `// -------------------- ${node.exactPredicate} --------------------\n`;
            return replaceAll(content, 'NODE', substitutions.forNode(node, nodeIndex));
        }).join('');
    });

    source = replaceSection(source, 'FOREACH_METHOD', content => {
        return mminfo.allNodes.map((node, nodeIndex) => {
            // result += `// -------------------- ${node.exactPredicate} --------------------\n`;
            let nodeSubs = substitutions.forNode(node, nodeIndex);
            return node.exactMethods.map((_, methodIndex) => {
                let result = content;
                result = replaceAll(result, 'NODE', nodeSubs);
                result = replaceAll(result, 'METHOD', substitutions.forMethod(node, methodIndex));
                return result;
            }).join('');
        }).join('');
    });

    // TODO: ...
    source = replaceSection(source, 'TO_REMOVE', () => '');

    source = eliminateDeadCode(source);
    return source;
}
