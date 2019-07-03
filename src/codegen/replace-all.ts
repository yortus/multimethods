import * as placeholders from './eval-placeholders';




// TODO: ... explain idpaths eg 'obj', 'obj.x', 'obj.x.y', etc
export function replaceAll(template: string, replacements: Replacements) {
    let idPaths = Object.keys(replacements) as Array<keyof Replacements>;

    // NB: any '$' or '.' chars in IdPaths must be escaped in the RexExp.
    let regexs = idPaths.map(id => new RegExp(id.replace(/([$.])/g, '\\$1'), 'g'));

    for (let i = 0; i < idPaths.length; ++i) {
        let id = idPaths[i];
        let regex = regexs[i];
        let replacement = replacements[id];
        template = template.replace(regex, String(replacement));
    }
    return template;
}




export type Replacements = Partial<Record<keyof typeof placeholders, string | boolean>>;
