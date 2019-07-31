




// TODO: automatically clear stored results on a future tick
// TODO: doc or remove these restrictions:
// - only works for arities 1-4, detected using fn.length. Generalise?
export function memoise<T0, TR>(fn: ($0: T0) => TR): ($0: T0) => TR;
export function memoise<T0, T1, TR>(fn: ($0: T0, $1: T1) => TR): ($0: T0, $1: T1) => TR;
export function memoise<T0, T1, T2, TR>(fn: ($0: T0, $1: T1, $2: T2) => TR): ($0: T0, $1: T1, $2: T2) => TR;
export function memoise<T0, T1, T2, T3, TR>(fn: ($0: T0, $1: T1, $2: T2, $3: T3) => TR): ($0: T0, $1: T1, $2: T2, $3: T3) => TR;
export function memoise(fn: Function) {

    // This internal util only supports functions with arities of 1-3 at the moment. Sanity check the input accordingly.
    // If the sanity check fails that's an internal error, so we simply throw rather that using `fatalError`.
    switch (fn.length) {
        case 1: return makeUnaryMemoiser(fn as any);
        case 2: return makeBinaryMemoiser(fn as any);
        case 3: return makeTernaryMemoiser(fn as any);
        case 4: return makeQuaternaryMemoiser(fn as any);
        default: throw new Error(`Internal error: memoise: unsupported arity ${fn.length}`);
    }
}





// TODO: doc...
function makeUnaryMemoiser<T0, TR>(fn: ($0: T0) => TR) {
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
function makeBinaryMemoiser<T0, T1, TR>(fn: ($0: T0, $1: T1) => TR) {
    const mapA = new Map<T1, Map<T0, TR>>();
    return ($0: T0, $1: T1): TR => {

        // Return the previously memoised result, if any.
        let value: TR|undefined;
        let mapB = mapA.get($1);
        if (!mapB) mapA.set($1, mapB = new Map());
        if (mapB.has($0)) return mapB.get($0)!;

        // Compute, memoise, and return the result.
        value = fn($0, $1);
        mapB.set($0, value);
        return value;
    };
}





// TODO: doc...
function makeTernaryMemoiser<T0, T1, T2, TR>(fn: ($0: T0, $1: T1, $2: T2) => TR) {
    const mapA = new Map<T2, Map<T1, Map<T0, TR>>>();
    return ($0: T0, $1: T1, $2: T2): TR => {

        // Return the previously memoised result, if any.
        let value: TR|undefined;
        let mapB = mapA.get($2);
        if (!mapB) mapA.set($2, mapB = new Map());
        let mapC = mapB.get($1);
        if (!mapC) mapB.set($1, mapC = new Map());
        if (mapC.has($0)) return mapC.get($0)!;

        // Compute, memoise, and return the result.
        value = fn($0, $1, $2);
        mapC.set($0, value);
        return value;
    };
}





// TODO: doc...
function makeQuaternaryMemoiser<T0, T1, T2, T3, TR>(fn: ($0: T0, $1: T1, $2: T2, $3: T3) => TR) {
    const mapA = new Map<T3, Map<T2, Map<T1, Map<T0, TR>>>>();
    return ($0: T0, $1: T1, $2: T2, $3: T3): TR => {

        // Return the previously memoised result, if any.
        let value: TR|undefined;
        let mapB = mapA.get($3);
        if (!mapB) mapA.set($3, mapB = new Map());
        let mapC = mapB.get($2);
        if (!mapC) mapB.set($2, mapC = new Map());
        let mapD = mapC.get($1);
        if (!mapD) mapC.set($1, mapD = new Map());
        if (mapD.has($0)) return mapD.get($0)!;

        // Compute, memoise, and return the result.
        value = fn($0, $1, $2, $3);
        mapD.set($0, value);
        return value;
    };
}
