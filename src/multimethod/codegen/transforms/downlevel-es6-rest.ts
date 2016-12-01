




// TODO: ...
export default function downlevelES6Rest(source: string): string {
    // TODO: ensure no other kinds of rest left behind afterward...

    // Matches (non-arrow) function headers with a rest argument
    const REGEX = /function([^(]*)\((.*?),\s*\.\.\.[^)]+\)\s*{\n(\s*)/gi;

    // ES5 equivalent for initialising the rest argument MM_ARGS
    const REST = `for (var MM_ARGS = [], len = arguments.length, i = 2; i < len; ++i) MM_ARGS.push(arguments[i]);`;

    return source.replace(REGEX, (substr, funcName: string, firstArgs: string, indent: string) => {
        return `function ${funcName}(${firstArgs}) {\n${indent}${REST}\n${indent}`;
    });
}
