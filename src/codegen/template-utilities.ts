import repeat from '../util/string-repeat';




// TODO: jsdoc...
export function replaceAll(sourceCode: string, objName: string, replacements: {[propName: string]: unknown}) {
    let propNames = Object.keys(replacements);
    for (let propName of propNames) {
        let regex = new RegExp(`${objName}[.$]${propName}(?!\\w)`, 'g');
        let replacement = replacements[propName];
        sourceCode = sourceCode.replace(regex, String(replacement));
    }
    // TODO: sanity checks?
    return sourceCode;
}




export function BEGIN_SECTION(sectionName: SectionName) { return sectionName; }
export function END_SECTION(sectionName: SectionName) { return sectionName; }
export type SectionName = 'ENTRY POINT' | 'THUNK SELECTOR' | 'PATTERN MATCHING' | 'THUNKS' | 'METHODS';




export function replaceSection(sourceCode: string, sectionName: SectionName, replacer: (s: string) => string) {
    let opening = `[ \\t]*${BEGIN_SECTION.name}\\('${sectionName}'\\);[^\\n]*\\n`;
    let content = `([\\s\\S]*?)`;
    let closing = `[ \\t]*${END_SECTION.name}\\('${sectionName}'\\)[^\\n]*\\n`;
    let re = new RegExp(opening + content + closing);

    let replacedCount = 0;
    let result = sourceCode.replace(re, (_, $1) => {
        ++replacedCount;

        let indent = repeat('\t', getIndentDepth($1));
        return [
            `\n`,
            `${indent}/*====================${repeat('=', sectionName.length)}====================*\n`,
            `${indent} *                    ${sectionName}                    *\n`,
            `${indent} *====================${repeat('=', sectionName.length)}====================*/\n`,
            replacer($1),
        ].join('');
    });

    if (replacedCount !== 1) throw new Error(`codegen internal error`); // TODO: doc this sanity check

    return result;
}




// TODO: explain that a lot of the extra care around normalisation in here is due to the following factors:
//       a) to avoid depending on full JS parsing, template transformations rely on a simpler regex-based approach
//       b) the templates relied on for codegen *may* have gone through a minifier during the build process.
//       c) the regex-based transforms rely on certain syntax assumptions about the templates they are transforming
//       d) therefore we must 'rehydrate' the possibly-minified templates to make them suitable for transformation
//       e) as a bonus we also prefer the codegen to emit human-readable code, even from minified templates
// TODO: doc... template guarantees...: 4-space indents, no blank lines, '\n' line endings, ...
// TODO: doc... special `__FUNCNAME__` and `__ARGS__` strings in templates




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




// TODO: doc...
export function minify(sourceCode: string) {

    // Normalise newlines and remove blank lines.
    sourceCode = sourceCode.replace(/[\r\n]+/g, '\n');

    // Remove comments.
    sourceCode = sourceCode.replace(/\/\*((?!\*\/)[\s\S])*\*\//g, '');
    sourceCode = sourceCode.replace(/^\s*\/\/((?!\n|$).)*\n?/gm, '');

    // Remove leading whitespace on every line.
    sourceCode = sourceCode.replace(/^\s+/gm, '');

    // Normalise if/else blocks. Ensure consequent/alternative stmts always have curlies.
    const SINGLE_LINE_IF_OR_ELSE = /^((?:if\s*\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)\s*)|else\s*)(?!\s*\{)([^;]*;)/;
    while (SINGLE_LINE_IF_OR_ELSE.test(sourceCode)) {
        // Since these blocks may be nested, do one content-wide replacement at a time until no matches remain.
        sourceCode = sourceCode.replace(SINGLE_LINE_IF_OR_ELSE, (_, cond, stmt) => `${cond}{${stmt}}`);
    }
    sourceCode = sourceCode.replace(/^\}\s*else\s*\{$/gm, '}\nelse {');

    // Remove newlines.
    sourceCode = sourceCode.replace(/\n/g, '');

    // All done.
    return sourceCode;
}




// TODO: doc...
export function beautify(minifiedSource: string) {
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




// TODO: doc... assumes tabs
export function getIndentDepth(sourceCodeFragment: string) {
    return /^\t*/.exec(sourceCodeFragment)![0].length;
}




// TODO: explain... removes dead code by simplistic transforms of if/else blocks
// TODO: explain limited circumstances where this works:
// - if (true) {\n[...]} [else {\n[...]}]
// - if (false) {\n[...]} [else {\n[...]}]
// - if (!true) {\n[...]} [else {\n[...]}]
// - if (!false) {\n[...]} [else {\n[...]}]
// TODO: doc (or relax) assumptions ie normalisation of code:
// - consistent 4-space block indents
// - simple static conditions with compound consequent/alternative:
//   - `if (true) {\n`
//   - `if (!true) {\n`
//   - `if (false) {\n`
//   - `if (!false) {\n`
//   - `else {\n`
// - if/else keyword must be first thing on its line
export function eliminateDeadCode(template: string) {
    const MATCH_IF = /^(\s*)if\s*\((\!?)((?:true)|(?:false))\)\s*{$/;
    const MATCH_ELSE = /^(\s*)else\s*{$/;
    let inLines = template.split('\n');
    let outLines: string[] = [];
    while (inLines.length > 0) {
        let inLine = inLines.shift()!;

        let matches = MATCH_IF.exec(inLine);
        if (!matches) {
            outLines.push(inLine);
            continue;
        }

        let indent = matches[1];
        let isNegated = matches[2] === '!';
        let isTrueLiteral = matches[3] === 'true';
        let isTrueCond = (!isNegated && isTrueLiteral) || (isNegated && !isTrueLiteral);
        let blockLines: string[] = [];
        let blockClose = indent + '}';

        while (true) {
            inLine = inLines.shift()!;
            if (inLine === blockClose) break;
            blockLines.push(inLine.slice(1)); // remove an indent
        }

        if (isTrueCond) {
            outLines = outLines.concat(eliminateDeadCode(blockLines.join('\n')));
        }

        // TODO: handle 'else' blocks...
        if (inLines.length > 0 && MATCH_ELSE.test(inLines[0])) {
            inLines[0] = `${indent}if (${isTrueCond ? 'false' : 'true'}) {`;
        }
    }

    return outLines.join('\n');
}
