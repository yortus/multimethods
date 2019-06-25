import dispatchFunction, {StaticConds as DBooleans, VarsInScope as DStrings} from './dispatch-function-template';
import Template from './template';
import thunkFunction, {StaticConds as TBooleans, VarsInScope as TStrings} from './thunk-function-template';





// TODO: explain that a lot of the extra care around normalisation in here is due to the following factors:
//       a) to avoid depending on full JS parsing, template transformations rely on a simpler regex-based approach
//       b) the templates relied on for codegen *may* have gone through a minifier during the build process.
//       c) the regex-based transforms rely on certain syntax assumptions about the templates they are transforming
//       d) therefore we must 'rehydrate' the possibly-minified templates to make them suitable for transformation
//       e) as a bonus we also prefer the codegen to emit human-readable code, even from minified templates
// TODO: doc... template guarantees...: 4-space indents, no blank lines, '\n' line endings, ...
// TODO: doc... special `__FUNCNAME__` and `__ARGS__` strings in templates





export {Template};





// TODO: doc...
const dispatchFunctionTemplate = getNormalisedFunctionSource(dispatchFunction) as Template;
type DispatchFunctionSubstitutions = {[K in keyof DStrings]: string} & {[K in keyof DBooleans]: boolean};
export {dispatchFunctionTemplate, DispatchFunctionSubstitutions};





// TODO: doc...
const thunkFunctionTemplate = getNormalisedFunctionSource(thunkFunction) as Template;
type ThunkFunctionSubstitutions = {[K in keyof TStrings]: string} & {[K in keyof TBooleans]: boolean};
export {thunkFunctionTemplate, ThunkFunctionSubstitutions};





// TODO: doc normalisation... source transformers may rely on these
// - consistent block indenting with 4 spaces per block
// - comments and blank lines removed
// - strict use of `\n` for newlines (no `\r` chars)
// TODO: doc assumptions made here... template functions must abide by these:
// - no single-line comments after code on same line
// - all stmts must be ';' terminated
// - ';' is assumed to *only* appear as a statement terminator (eg never appears in a string literal)
// - all blocks must be `{` and `}` delimited. i.e. no one-line `if` stmts, etc
// - '{' and '}' are assumed to *only* appear as block or funcbody delimiters (eg never appears in a string literal)
// - no *complex* `if` condition exprs. Max one nested level of `(` and `)` in cond expr, so simple func call is ok.
function getNormalisedFunctionSource(fn: Function): string {

    // TODO: explain... the template may or may not have been minified already. Regardless of that, we want
    // readable codegen, and also the source transform functions assume normalised formatting (see those funcs).
    let source = beautify(minify(fn.toString()));
    return source;
}





// TODO: doc...
function minify(source: string) {

    // Normalise newlines and remove blank lines.
    source = source.replace(/[\r\n]+/g, '\n');

    // Remove comments.
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
            indent += '    ';
            out += '{\n' + indent;
        }
        else if (c === ';') {
            out += ';\n' + indent;
        }
        else if (c === '}') {
            // We may already be on a blank line if the preceding char was ';' or '{' or '}'.
            // If so, remove that last newline so we don't end up with blank lines.
            out = out.replace(/\n\s*$/g, '');

            indent = indent.slice(0, -4);
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
