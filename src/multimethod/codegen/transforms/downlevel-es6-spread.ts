




// TODO: ...
export default function downlevelES6Spread(source: string): string {
    // TODO: ensure no other kinds of spreads left behind afterward...

    // Matches argument list of function calls where the final argument is a spread expression
    let REGEX = /\(([^(]*?),\s*\.\.\.([^)]+)\)/gi;

    return source.replace(REGEX, (substr, firstArgs: string, finalSpreadArg: string) => {
        return `.apply(null, [${firstArgs}].concat(${finalSpreadArg}))`;
    });
}
