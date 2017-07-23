import {Template} from '../templates';





// TODO: ... explain idpaths eg 'obj', 'obj.x', 'obj.x.y', etc
export default function replaceAll(template: Template, replacements: {[idPath: string]: string}) {
    let idPaths = Object.keys(replacements);

    // NB: any '$' or '.' chars in IdPaths must be escaped in the RexExp.
    let regexs = idPaths.map(id => new RegExp(id.replace(/([$.])/g, '\\$1'), 'g'));

    for (let i = 0; i < idPaths.length; ++i) {
        let id = idPaths[i];
        let regex = regexs[i];
        let replacement = replacements[id];
        template = template.replace(regex, replacement) as Template;
    }
    return template;
}
