




// TODO: explain... basically removes if/then branches that are 100% dead code according to the constants provided.
// TODO: explain limited circumstances where this works:
// - if (CONST) {\n<...>} else {\n<...>}
// TODO: assumes consistent 4-space block indents, simple conditions... relax any of these?
export default function eliminateDeadCode(normalisedFunctionSource: string, consts: {[name: string]: boolean}): string {
    const MATCH_IF = /^(\s*)if \((\!?)([a-zA-Z$_][a-zA-Z0-9$_]*)\) {$/;
    const MATCH_ELSE = /^(\s*)else {$/;
    let inLines = normalisedFunctionSource.split('\n');
    let outLines: string[] = [];
    while (inLines.length > 0) {
        let inLine = inLines.shift()!;

        let matches = MATCH_IF.exec(inLine);
        if (!matches || !consts.hasOwnProperty(matches[3])) {
            outLines.push(inLine);
            continue;
        }

        let indent = matches[1];
        let isNegated = matches[2] === '!';
        let constName = matches[3];
        let isElided = consts[constName] === isNegated;
        let blockLines: string[] = [];
        let blockClose = indent + '}';

        while ((inLine = inLines.shift()!) !== blockClose) {
            blockLines.push(inLine.slice(4));
        }

        if (!isElided) {
            outLines = outLines.concat(eliminateDeadCode(blockLines.join('\n'), consts));
        }

        // TODO: handle 'else' blocks...
        if (inLines.length > 0 && MATCH_ELSE.test(inLines[0])) {
            inLines[0] = `${indent}if (${isNegated ? '' : '!'}${constName}) {`;
        }
    }

    return outLines.join('\n');
}
