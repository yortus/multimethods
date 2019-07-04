



// TODO: jsdoc...
export function replaceAll(template: string, objName: string, replacements: {[propName: string]: unknown}) {
    let propNames = Object.keys(replacements);
    for (let propName of propNames) {
        let regex = new RegExp(`${objName}[.$]${propName}(?!\\w)`, 'g');
        let replacement = replacements[propName];
        template = template.replace(regex, String(replacement));
    }
    return template;
}




export function BEGIN_SECTION(sectionName: SectionName) { return sectionName; }
export function END_SECTION(sectionName: SectionName) { return sectionName; }
export type SectionName = 'SELECT_THUNK' | 'FOREACH_MATCH' | 'FOREACH_NODE' | 'FOREACH_METHOD' | 'TO_REMOVE';




export function replaceSection(source: string, sectionName: SectionName, replace: (str: string) => string) {
    let opening = `[ \\t]*${BEGIN_SECTION.name}\\('${sectionName}'\\);[^\\n]*\\n`;
    let content = `([\\s\\S]*?)`;
    let closing = `[ \\t]*${END_SECTION.name}\\('${sectionName}'\\)[^\\n]*\\n`;
    let re = new RegExp(opening + content + closing);

    let result = source.replace(re, (_, $1) => {
        return replace($1);
    });
    return result;
}




// TODO: doc...
export function minify(source: string) {

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
