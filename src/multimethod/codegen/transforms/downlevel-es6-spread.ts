




// TODO: ... note limitations:
// - basically a macro expansion for ELLIPSIS as a spreadExpr
// - only works for var named ELLIPSIS_XXX
// - only works inside the arg list of a func call expr, where ELLIPSIS appears exactly once (any arg order is fine)
export default function downlevelES6Spread(source: string): string {
    return source.replace(REGEX, (_substr, preArgs: string, varName: string, postArgs: string) => {
        if (!preArgs && !postArgs) return `.apply(null, ${varName})`;
        if (!preArgs) return `.apply(null, ${varName}.concat([${postArgs}]))`;
        if (!postArgs) return `.apply(null, [${preArgs}].concat(${varName}))`
        return `.apply(null, [${preArgs}].concat(${varName}, [${postArgs}]))`;
    });
}





// TODO: doc...
// Recognises the argument list of a function call containing an ELLIPSIS_XXX arg. Captures three groups:
// (1) args before ELLIPSIS_XXX if any, (2) the XXX part, and (3) args after ELLIPSIS_XXX if any
const REGEX = /\(([^)]*?)(?:,\s*)?ELLIPSIS_([A-Z]+)(?:,\s*)?([^)]*?)\)(?!\s*{)/g;
