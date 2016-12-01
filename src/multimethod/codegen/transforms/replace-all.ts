




// TODO: ...
export default function replaceAll(source: string, replacements: {[identifier: string]: string}): string {
    let identifiers = Object.keys(replacements);
    let regexs = identifiers.map(id => new RegExp(id.replace(/\$/g, '\\$'), 'g'));
    for (let i = 0; i < identifiers.length; ++i) {
        let id = identifiers[i];
        let regex = regexs[i];
        let replacement = replacements[id];
        source = source.replace(regex, replacement);
    }
    return source;
}
