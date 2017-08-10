




// TODO: doc or remove these restrictions:
// - only works for binary functions
// - only works for functions whose parameters are all primitive types (i.e. string, number, ...)
// - only work for functions that *never* return undefined
function memoise<T0 extends primitive, T1 extends primitive, TR>(fn: ($0: T0, $1: T1) => TR): ($0: T0, $1: T1) => TR;
function memoise(fn: Function) {

    // This internal util only supports binary functions at the moment. Sanity check the input accordingly.
    // If the sanity check fails that's an internal error, so we simply throw rather that using `fatalError`.
    if (fn.length !== 2) throw new Error('Internal error: memoise only supports binary functions');

    // Delegate to arity-specific implementation.
    return makeBinaryMemoiser(fn as any);
}
export default memoise;





// TODO: doc...
export type primitive = string|number;





// TODO: doc...
function makeBinaryMemoiser<T0 extends primitive, T1 extends primitive, TR>(fn: ($0: T0, $1: T1) => TR) {
    const map = new Map<T0, Map<T1, TR>>();
    return ($0: T0, $1: T1): TR => {

        // Return the previously memoised result, if any.
        let value: TR|undefined;
        let map2 = map.get($0);
        if (map2) value = map2.get($1);
        if (value !== undefined) return value;

        // Compute, memoise, and return the result.
        value = fn($0, $1);
        if (!map2) map.set($0, map2 = new Map());
        map2.set($1, value);
        return value;
    };
}
