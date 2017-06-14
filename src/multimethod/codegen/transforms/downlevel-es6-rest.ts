




// TODO: ... note limitations:
// - basically a macro expansion for ELLIPSIS as a restDecl
// - only works for var named ELLIPSIS_XXX
// - only works for funcExpr with a rest param, with '{' on same line, followed by body on next line
export default function downlevelES6Rest(source: string): string {
    // TODO: ensure no other kinds of rest left behind afterward...

    // Matches (non-arrow) function headers with a rest argument
    const REGEX = /function([^(]*)\((.*?)(?:,\s*)?ELLIPSIS_([A-Z]+)\s*\)\s*{\n(\s*)/g;

    return source.replace(REGEX, (_substr, funcName: string, firstArgs: string, varName: string, indent: string) => {
        let firstArgCount = firstArgs ? firstArgs.split(',').length : 0;

        // ES5 equivalent for initialising the rest argument MM_ARGS
        let rest = `for (var ${varName} = [], len = arguments.length, i = ${firstArgCount}; i < len; ++i) ${varName}.push(arguments[i]);`;
        return `function ${funcName}(${firstArgs}) {\n${indent}${rest}\n${indent}`;
    });
}
