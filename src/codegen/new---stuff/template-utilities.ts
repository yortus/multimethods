import repeat from '../../util/string-repeat';




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




export function substituteHeadings(sourceCode: string) {
    return sourceCode;
    // // H1 headings
    // let re = new RegExp(`(\\t*)${H1.name}\\('(.*?)'\\);[^\\n]*\\n`, 'g');
    // return sourceCode.replace(re, (_, indent, title) => {
    //     return [
    //         `\n`,
    //         `${indent}/*====================${repeat('=', title.length)}====================*\n`,
    //         `${indent} *                    ${title}                    *\n`,
    //         `${indent} *====================${repeat('=', title.length)}====================*/\n`,
    //     ].join('');
    // });

    // TODO: H2 headings

}




export function H1(title: string) { return title; }




// TODO: doc... assumes tabs
export function getIndentDepth(sourceCodeFragment: string) {
    return /^\t*/.exec(sourceCodeFragment)![0].length;
}
