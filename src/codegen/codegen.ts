import {MMInfo, MMNode} from '../analysis';
import * as predicates from '../math/predicates';
import repeat from '../util/string-repeat';
import {multimethodTemplate} from './multimethod-template';
import * as substitutions from './substitutions';
import {beautify, eliminateDeadCode, getIndentDepth, minify, replaceAll, replaceSection} from './template-utilities';




export function codegen(mminfo: MMInfo<MMNode>) {
    let multimethodSourceCode = generateMultimethodSourceCode(mminfo);

    // Evaluate the multimethod's entire source code to obtain the multimethod function. The use of eval here is safe.
    // There are no untrusted inputs substituted into the source. The client-provided methods can do anything (so may
    // be considered untrusted), but that has nothing to do with the use of 'eval' here, since they would need to be
    // called by the dispatcher whether or not eval was used. More importantly, the use of eval here allows for
    // multimethod dispatch code that is both more readable and more efficient, since it is tailored specifically
    // to the configuration of this multimethod, rather than having to be generalized for all possible cases.
    // tslint:disable-next-line:no-eval
    let multimethod = eval(`(${multimethodSourceCode})`)(mminfo, predicates);
    multimethod.toString = () => multimethodSourceCode;
    return multimethod;
}




function generateMultimethodSourceCode(mminfo: MMInfo<MMNode>) {
    let source = multimethodTemplate.toString();
    source = minify(source);
    source = beautify(source);

    // TODO: dispatch function...
    source = replaceSection(source, 'ENTRY POINT', placeholderContent => {
        return replaceAll(placeholderContent, 'MM', substitutions.forMultimethod(mminfo));
    });

    // thunk selector - generate the code for it
    source = replaceSection(source, 'THUNK SELECTOR', placeholderContent => {
        let bodyIndent = repeat('\t', getIndentDepth(placeholderContent) + 1);
        let bodyRegex = /{\n[\s\S]*?(?=\t*})/; // matches the substring between the opening and closing braces
        return placeholderContent.replace(bodyRegex, () => `{\n${block(mminfo.rootNode, bodyIndent)}`);

        // Recursively generate the conditional logic block to select among the given predicates.
        function block(node: MMNode, indent: string): string {
            let result = node.childNodes.map(childNode => {
                let nodeSubs = substitutions.forNode(childNode);
                let condition = `${indent}if (${nodeSubs.NAMEOF_IS_MATCH}(discriminant)) `;
                if (childNode.childNodes.length === 0) {
                    // One-liner if-statement
                    return `${condition}return ${nodeSubs.NAMEOF_ENTRYPOINT_THUNK};\n`;
                }
                else {
                    // Compound if-statement with nested block of conditions
                    let nestedBlock = block(childNode, indent + '\t'); // NB: recursive
                    return `${condition}{\n${nestedBlock}${indent}}\n`;
                }
            }).join('');

            // Select the base predicate if none of the more specialised predicates matched the discriminant.
            result += `${indent}return ${substitutions.forNode(node).NAMEOF_ENTRYPOINT_THUNK};\n`;
            return result;
        }
    });

    source = replaceSection(source, 'PATTERN MATCHING', placeholderContent => {
        return mminfo.allNodes.map((node, nodeIndex) => {
            // result += `// -------------------- ${node.exactPredicate} --------------------\n`;
            return replaceAll(placeholderContent, 'NODE', substitutions.forNode(node, nodeIndex));
        }).join('');
    });

    // thunk functions - codegen foreach thunk
    source = replaceSection(source, 'THUNKS', placeholderContent => {
        return mminfo.allNodes.map(node => {
            // result += `// -------------------- ${node.exactPredicate} --------------------\n`;
            return node.methodSequence.map((_, index, seq) => {

                // To avoid unnecessary duplication, skip emit for regular methods that are less
                // specific that the set's predicate, since these will be handled in their own set.
                if (!seq[index].isMeta && seq[index].fromNode !== seq[0].fromNode) return '';

                let nodeSubs = substitutions.forNode(seq[index].fromNode);
                let result = placeholderContent;
                result = replaceAll(result, 'NODE', nodeSubs);
                result = replaceAll(result, 'MATCH', substitutions.forMatch(seq, index));
                return result;
            }).join('');
        }).join('');
    });

    source = replaceSection(source, 'METHODS', placeholderContent => {
        return mminfo.allNodes.map((node, nodeIndex) => {
            // result += `// -------------------- ${node.exactPredicate} --------------------\n`;
            let nodeSubs = substitutions.forNode(node, nodeIndex);
            return node.exactMethods.map((_, methodIndex) => {
                let result = placeholderContent;
                result = replaceAll(result, 'NODE', nodeSubs);
                result = replaceAll(result, 'METHOD', substitutions.forMethod(node, methodIndex));
                return result;
            }).join('');
        }).join('');
    });

    // do mm-wide replacements & stuff
    let mmSubs = substitutions.forMultimethod(mminfo);
    source = replaceAll(source, 'MM', mmSubs);
    source = eliminateDeadCode(source);
    return source;
}
