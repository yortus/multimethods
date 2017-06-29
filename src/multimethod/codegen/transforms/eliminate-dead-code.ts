




// TODO: explain... basically removes if/then branches that are statically dead code.
// TODO: explain limited circumstances where this works:
// - if (true) {\n[...]} [else {\n[...]}]
// - if (false) {\n[...]} [else {\n[...]}]
// - if (!true) {\n[...]} [else {\n[...]}]
// - if (!false) {\n[...]} [else {\n[...]}]
// TODO: assumes consistent 4-space block indents, simple conditions... relax any of these?
export default function eliminateDeadCode(source: string): string {
    const MATCH_IF = /^(\s*)if \((\!?)((?:true)|(?:false))\) {$/;
    const MATCH_ELSE = /^(\s*)else {$/;
    let inLines = source.split('\n');
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

        while ((inLine = inLines.shift()!) !== blockClose) {
            blockLines.push(inLine.slice(4));
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
