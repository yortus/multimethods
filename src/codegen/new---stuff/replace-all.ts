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
