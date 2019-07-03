// TODO: doc
// replaces rest/spread forms `...XXX` with something like `$0, $1`
// use when there is a known fixed arity
export function makeParameterList(arity: number, prefix = '$') {
    let paramNames = [] as string[];
    for (let i = 0; i < arity; ++i) paramNames.push(prefix + i);
    return paramNames.join(', ');
}
