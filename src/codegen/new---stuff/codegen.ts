import {MMInfo, MMNode} from '../../analysis';
import {hasNamedCaptures, toMatchFunction, toNormalPredicate} from '../../math/predicates';
import repeat from '../../util/string-repeat';
import {eliminateDeadCode} from '../eliminate-dead-code';
import {EmitNode} from './emit-node';
import {getMethodSubstitutions, getMultimethodSubstitutions, getNodeSubstitutions, getThunkName, getThunkSubstitutions} from './helpers';
import {replaceAll} from './replace-all';
import {SectionName, template} from './template';




export function emit(mminfoPre: MMInfo<MMNode>) {

    let mminfo = createEmitEnvironment(mminfoPre);
    let source = template.toString();

    source = minify(source);
    source = beautify(source);

    // do mm-wide replacements
    let MM = getMultimethodSubstitutions(mminfo);
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
                let nodeSubs = getNodeSubstitutions(childNode);

                let condition = `${indent}if (${nodeSubs.NAMEOF_IS_MATCH}(discriminant)) `;
                if (childNode.childNodes.length === 0) {
                    // One-liner if-statement
                    return `${condition}return ${getThunkName([childNode.entryPoint], 0)};\n`;
                }
                else {
                    // Compound if-statement with nested block of conditions
                    let nestedBlock = codegenThunkSelectorBlock(childNode, nestDepth + 1); // NB: recursive
                    return `${condition}{\n${nestedBlock}${indent}}\n`;
                }
            }).join('');

            // Add a line to select the base predicate if none of the more specialised predicates matched the discriminant.
            result += `${indent}return ${getThunkName([node.entryPoint], 0)};\n`;
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

                let nodeSubs = getNodeSubstitutions(seq[index].fromNode);
                let result = content;
                result = replaceAll(result, 'NODE', nodeSubs);
                result = replaceAll(result, 'MATCH', getThunkSubstitutions(seq, index));
                return result;
            }).join('');
        }).join('');
    });

    // environment - codegen foreach method
    //emitBanner(emit, 'ENVIRONMENT');

    source = replaceSection(source, 'FOREACH_NODE', content => {
        return mminfo.allNodes.map((node, nodeIndex) => {
            // result += `// -------------------- ${node.exactPredicate} --------------------\n`;
            return replaceAll(content, 'NODE', getNodeSubstitutions(node, nodeIndex));
        }).join('');
    });

    source = replaceSection(source, 'FOREACH_METHOD', content => {
        return mminfo.allNodes.map((node, nodeIndex) => {
            // result += `// -------------------- ${node.exactPredicate} --------------------\n`;
            let nodeSubs = getNodeSubstitutions(node, nodeIndex);
            return node.exactMethods.map((_, methodIndex) => {
                let result = content;
                result = replaceAll(result, 'NODE', nodeSubs);
                result = replaceAll(result, 'METHOD', getMethodSubstitutions(node, methodIndex));
                return result;
            }).join('');
        }).join('');
    });

    // TODO: ...
    source = replaceSection(source, 'TO_REMOVE', () => '');

    source = eliminateDeadCode(source);
    return source;
}




function replaceSection(source: string, sectionName: SectionName, replace: (str: string) => string) {
    let opening = `[ \\t]*BEGIN_SECTION\\('${sectionName}'\\);[^\\n]*\\n`;
    let content = `([\\s\\S]*?)`;
    let closing = `[ \\t]*END_SECTION\\('${sectionName}'\\)[^\\n]*\\n`;
    let re = new RegExp(opening + content + closing);

    let result = source.replace(re, (_, $1) => {
        return replace($1);
    });
    return result;
}




// TODO: doc...
function createEmitEnvironment(mminfo: MMInfo<MMNode>): MMInfo<EmitNode> {
    return mminfo.addProps((node) => {
        let isMatch = toMatchFunction(toNormalPredicate(node.exactPredicate));
        let hasPatternBindings = hasNamedCaptures(node.exactPredicate);
        let getPatternBindings = toMatchFunction(node.exactPredicate) as EmitNode['getPatternBindings'];
        return {isMatch, hasPatternBindings, getPatternBindings};
    });
}




// TODO: doc...
function minify(source: string) {

    // Normalise newlines and remove blank lines.
    source = source.replace(/[\r\n]+/g, '\n');

    // Remove comments. But preserve special 'tag' comments like // <THING>;
    source = source.replace(/\/\*((?!\*\/)[\s\S])*\*\//g, '');
    source = source.replace(/^\s*\/\/((?!\n|$).)*\n?/gm, '');

    // Remove leading whitespace on every line.
    source = source.replace(/^\s+/gm, '');

    // Normalise if/else blocks. Ensure consequent/alternative stmts always have curlies.
    const SINGLE_LINE_IF_OR_ELSE = /^((?:if\s*\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)\s*)|else\s*)(?!\s*\{)([^;]*;)/;
    while (SINGLE_LINE_IF_OR_ELSE.test(source)) {
        // Do these one at a time, since they may be nested.
        source = source.replace(SINGLE_LINE_IF_OR_ELSE, (_, cond, stmt) => `${cond}{${stmt}}`);
    }
    source = source.replace(/^\}\s*else\s*\{$/gm, '}\nelse {');

    // Remove newlines.
    source = source.replace(/\n/g, '');

    // All done.
    return source;
}




// TODO: doc...
function beautify(minifiedSource: string) {
    let indent = '';
    let out = '';
    for (let i = 0; i < minifiedSource.length; ++i) {
        let c = minifiedSource.charAt(i);
        if (c === '{') {
            indent += '\t';
            out += '{\n' + indent;
        }
        else if (c === ';') {
            out += ';\n' + indent;
        }
        else if (c === '}') {
            // We may already be on a blank line if the preceding char was ';' or '{' or '}'.
            // If so, remove that last newline so we don't end up with blank lines.
            out = out.replace(/\n\s*$/g, '');

            indent = indent.slice(0, -1);
            out += '\n' + indent + '}';

            // The '}' may *not* be a block terminator, it may be the end of a function expression.
            // If that's the case, we don't start a new line after it.
            let nextChar = i < minifiedSource.length ? minifiedSource.charAt(i + 1) : 'EOS';
            let isBlockTerminator = ';)]'.indexOf(nextChar) === -1;
            out += isBlockTerminator ? ('\n' + indent) : '';
        }
        else {
            out += c;
        }
    }

    return out;
}
