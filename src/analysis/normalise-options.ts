import Options from '../options';





// TODO: ...
export interface NormalOptions {
    name: string;
    arity: number | undefined;
    async: boolean | undefined;
    strict: boolean;
    toDiscriminant: Function;
    methods: {[predicate: string]: Function[]};
}





// TODO: ...
export default function normaliseOptions(options: Options) {
    let name = options.name || `MM${++multimethodCounter}`;
    let arity = options.arity;
    let async = options.async;
    let strict = options.strict || false;
    let toDiscriminant = options.toDiscriminant || (() => { throw new Error('Implement default discriminant!') }); // TODO: implement...
    let methods = normaliseMethods(options.methods);

    return {name, arity, async, strict, toDiscriminant, methods} as NormalOptions;
}





// TODO: ...
function normaliseMethods(methods: Options['methods']) {
    methods = methods || {};

    // TODO: doc...
    let result = {} as NormalOptions['methods'];
    for (let predicate in methods) {
        let chain = methods[predicate];
        if (!Array.isArray(chain)) chain = [chain];
        result[predicate] = chain;
    }
    return result;
}





// TODO: doc...
let multimethodCounter = 0;
