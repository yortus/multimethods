




// TODO: doc or remove these restrictions:
// - only works for unary/binary/ternary functions, detected using fn.length
// - only works for functions whose parameters are all primitive types (i.e. string, number, ...)
function memoise<T0 extends primitive, T1 extends primitive, TR>(fn: ($0: T0, $1: T1) => TR): ($0: T0, $1: T1) => TR;
function memoise<T0 extends primitive, T1 extends primitive, T2 extends primitive, TR>(fn: ($0: T0, $1: T1, $2: T2) => TR): ($0: T0, $1: T1, $2: T2) => TR;
function memoise(fn: Function) {

    // This internal util only supports functions with arities of 1-3 at the moment. Sanity check the input accordingly.
    // If the sanity check fails that's an internal error, so we simply throw rather that using `fatalError`.
    switch (fn.length) {
        case 1: return makeUnaryMemoiser(fn as any);
        case 2: return makeBinaryMemoiser(fn as any);
        case 3: return makeTernaryMemoiser(fn as any);
        default: throw new Error(`Internal error: memoise: unsupported arity ${fn.length}`);
    }
}
export default memoise;





// TODO: doc...
export type primitive = string|number;





// TODO: doc...
function makeUnaryMemoiser<T0 extends primitive, TR>(fn: ($0: T0) => TR) {
    const map0 = new Map<T0, TR>();
    return ($0: T0): TR => {

        // Return the previously memoised result, if any.
        let value: TR|undefined;
        if (map0.has($0)) return map0.get($0)!;

        // Compute, memoise, and return the result.
        value = fn($0);
        map0.set($0, value);
        return value;
    };
}





// TODO: doc...
function makeBinaryMemoiser<T0 extends primitive, T1 extends primitive, TR>(fn: ($0: T0, $1: T1) => TR) {
    const map0 = new Map<T0, Map<T1, TR>>();
    return ($0: T0, $1: T1): TR => {

        // Return the previously memoised result, if any.
        let value: TR|undefined;
        let map1 = map0.get($0);
        if (!map1) map0.set($0, map1 = new Map());
        if (map1.has($1)) return map1.get($1)!;

        // Compute, memoise, and return the result.
        value = fn($0, $1);
        map1.set($1, value);
        return value;
    };
}





// TODO: doc...
function makeTernaryMemoiser<T0 extends primitive, T1 extends primitive, T2 extends primitive, TR>(fn: ($0: T0, $1: T1, $2: T2) => TR) {
    const map0 = new Map<T0, Map<T1, Map<T2, TR>>>();
    return ($0: T0, $1: T1, $2: T2): TR => {

        // Return the previously memoised result, if any.
        let value: TR|undefined;
        let map1 = map0.get($0);
        if (!map1) map0.set($0, map1 = new Map());
        let map2 = map1.get($1);
        if (!map2) map1.set($1, map2 = new Map());
        if (map2.has($2)) return map2.get($2)!;

        // Compute, memoise, and return the result.
        value = fn($0, $1, $2);
        map2.set($2, value);
        return value;
    };
}
