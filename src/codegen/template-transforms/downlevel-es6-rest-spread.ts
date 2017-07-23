import {Template} from '../template-code';





// TODO: ... note limitations:
// basically a simple macro expansion for restDecls and spreadExprs with certain limitations:
// - for a restDecl, it only works given *all* of the following:
//   - inside header of a funcExpr (with `function`, not an arrow func)
//   - with a `__VARARGS__` rest param
//   - with '{' on same line as `function` and param list
//   - with function body starting on the *next* line
// - for spreadExpr, it only works given *all* of the following:
//   - inside the arg list of a func call expr
//   - where `__VARARGS__` appears exactly once as a whole argument (but any argument order is fine)
export default function downlevelES6RestSpread(template: Template, arity?: number) {
    if (typeof arity === 'number') {
        // NB: factor out magic string '__VARARGS__' to one place project-wide
        template = strengthReduceES6RestSpread(template, '__VARARGS__', '_', arity);
    }
    else {
        template = convertES6RestToES5(template);
        template = convertES6SpreadToES5(template);
    }
    return template;
}





// TODO: doc
// replaces rest/spread forms `...XXX` with something like `$0, $1`
// use when there is a known fixed arity
function strengthReduceES6RestSpread(template: Template, oldName: string, newPrefix: string, arity: number) {
    let regex = new RegExp('\\.\\.\\.' + oldName.replace(/\$/g, '\\$'), 'g');
    let paramNames = [];
    for (let i = 0; i < arity; ++i) paramNames.push(newPrefix + i);
    return template.replace(regex, paramNames.join(', ')) as Template;
}





function convertES6RestToES5(template: Template) {
    return template.replace(REGEX_REST, (_, funcName: string, firstArgs: string, varName: string, indent: string) => {
        let firstArgCount = firstArgs ? firstArgs.split(',').length : 0;

        // ES5 equivalent for initialising the rest argument __VARARGS__
        let rest = `for (var ${varName} = [], len = arguments.length, i = ${firstArgCount}; i < len; ++i)`
                 + ` ${varName}.push(arguments[i]);`;
        return `function ${funcName}(${firstArgs}) {\n${indent}${rest}\n${indent}`;
    }) as Template;
}





function convertES6SpreadToES5(template: Template) {
    return template.replace(REGEX_SPREAD, (_, preArgs: string, varName: string, postArgs: string) => {
        if (!preArgs && !postArgs) return `.apply(null, ${varName})`;
        if (!preArgs) return `.apply(null, ${varName}.concat([${postArgs}]))`;
        if (!postArgs) return `.apply(null, [${preArgs}].concat(${varName}))`;
        return `.apply(null, [${preArgs}].concat(${varName}, [${postArgs}]))`;
    }) as Template;
}





// Matches (non-arrow) function headers with a rest argument
const REGEX_REST = /function([^(]*)\((.*?)(?:,\s*)?\.\.\.([A-Z]+)\s*\)\s*{\n(\s*)/g;





// Recognises the argument list of a function call containing an ...XXX arg. Captures three groups:
// (1) args before ...XXX if any, (2) the XXX part, and (3) args after ...XXX if any
const REGEX_SPREAD = /\(([^)]*?)(?:,\s*)?\.\.\.([A-Z]+)(?:,\s*)?([^)]*?)\)(?!\s*{)/g;
