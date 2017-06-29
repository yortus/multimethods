




// TODO: ... explain idpaths eg 'obj', 'obj.x', 'obj.x.y', etc
export default function replaceAll(source: string, replacements: {[idPath: string]: string}): string {
    let idPaths = Object.keys(replacements);
    let regexs = idPaths.map(id => new RegExp(id.replace(/([$.])/g, '\\$1'), 'g')); // NB: any '$' or '.' chars in IdPaths must be escaped in RexExps
    for (let i = 0; i < idPaths.length; ++i) {
        let id = idPaths[i];
        let regex = regexs[i];
        let replacement = replacements[id];
        source = source.replace(regex, replacement);
    }
    return source;
}
