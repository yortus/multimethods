




// TODO: ... note limitations:
// basically a simple macro expansion for restDecls and spreadExprs with certain limitations:
// - for rest: only works for funcExpr (with `function`, not an arrow func) with a rest param, with '{' on same line, followed by body on next line
// - for spread: only works inside the arg list of a func call expr, where `...XXX` appears exactly once (any arg order is fine), where XXX is a simple identifier
export default function downlevelES6RestSpread(source: string): string {
    source = downlevelES6Rest(source);
    source = downlevelES6Spread(source);
    return source;
}





function downlevelES6Rest(source: string): string {
    return source.replace(REGEX_REST, (_substr, funcName: string, firstArgs: string, varName: string, indent: string) => {
        let firstArgCount = firstArgs ? firstArgs.split(',').length : 0;

        // ES5 equivalent for initialising the rest argument MM_ARGS
        let rest = `for (var ${varName} = [], len = arguments.length, i = ${firstArgCount}; i < len; ++i) ${varName}.push(arguments[i]);`;
        return `function ${funcName}(${firstArgs}) {\n${indent}${rest}\n${indent}`;
    });
}





function downlevelES6Spread(source: string): string {
    return source.replace(REGEX_SPREAD, (_substr, preArgs: string, varName: string, postArgs: string) => {
        if (!preArgs && !postArgs) return `.apply(null, ${varName})`;
        if (!preArgs) return `.apply(null, ${varName}.concat([${postArgs}]))`;
        if (!postArgs) return `.apply(null, [${preArgs}].concat(${varName}))`
        return `.apply(null, [${preArgs}].concat(${varName}, [${postArgs}]))`;
    });
}





// Matches (non-arrow) function headers with a rest argument
const REGEX_REST = /function([^(]*)\((.*?)(?:,\s*)?\.\.\.([A-Z]+)\s*\)\s*{\n(\s*)/g;





// Recognises the argument list of a function call containing an ...XXX arg. Captures three groups:
// (1) args before ...XXX if any, (2) the XXX part, and (3) args after ...XXX if any
const REGEX_SPREAD = /\(([^)]*?)(?:,\s*)?\.\.\.([A-Z]+)(?:,\s*)?([^)]*?)\)(?!\s*{)/g;
