




// TODO: doc
// replaces rest/spread forms `...XXX` with something like `$0, $1`
// use when there is a known fixed arity
export default function strengthReduceES6RestSpread(source: string, oldName: string, newPrefix: string, arity: number): string {
    let regex = new RegExp('\\.\\.\\.' + oldName.replace(/\$/g, '\\$'), 'g');
    let paramNames = [];
    for (let i = 0; i < arity; ++i) paramNames.push(newPrefix + i);
    return source.replace(regex, paramNames.join(', '));
}
