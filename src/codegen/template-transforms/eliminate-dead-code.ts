import {Template} from '../template-code';





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
export default function eliminateDeadCode(template: Template) {
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
            outLines = outLines.concat(eliminateDeadCode(blockLines.join('\n') as Template));
        }

        // TODO: handle 'else' blocks...
        if (inLines.length > 0 && MATCH_ELSE.test(inLines[0])) {
            inLines[0] = `${indent}if (${isTrueCond ? 'false' : 'true'}) {`;
        }
    }

    return outLines.join('\n') as Template;
}
