




// TODO: doc...
export default interface Options {

    // TODO: doc... check correct number of args passed on every call if not undefined.
    // TODO: validate integer >= 1 and less than something?
    // TODO: doc perf and signature differences of variadic vs fixed arity...
    arity?: number;

    // TODO: doc... Check result if not undefined. For 'never', the result must NOT be a promise. For 'always', the result is wrapped using the global `Promise.resolve`
    // TODO: doc tristate:
    // - true: always returns a promise. Doc use of global Promise.resolve
    // - false: always returns a value synchronously. Additional strict mode checks.
    // - undefined: may return either a Promise or a value, and methods may return promises or values
    async?: boolean;

    // TODO: doc... If not undefined, fails on early detection of discriminants for which there is no best handler.
    // TODO: alt names: unambiguous explicit exact definite precise complete whole exhaustive strict
    // TODO: code up additional strict mode checks in thunks for what handlers return when async='always|never'
    strict?: boolean;

    toDiscriminant?: Function;

    methods?: { [predicate: string]: Function|Function[]; }
}
