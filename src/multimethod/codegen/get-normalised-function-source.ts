




// TODO: ... doc: 4-space indents, no blank lines, '\n' line endings
export default function getNormalisedFunctionSource(fn: Function): string {
    // TODO: verify/fix 4-space indents. Otherwise hard-to find bugs may creep in if devs alter the template function
    // TODO: -or- don't assume 4-space indents anymore?
    let source = fn.toString();
    let lines = source.split(/[\r\n]+/); // NB: this removes blank lines too
    lines = lines.filter(line => !/^\s*\/\//.test(line)); // Remove comment lines
    let dedentCount = lines[1].match(/^[ ]+/)[0].length - 4;
    lines = [].concat(lines.shift(), ...lines.map(line => line.slice(dedentCount)));
    source = lines.join('\n');
    return source;
}
