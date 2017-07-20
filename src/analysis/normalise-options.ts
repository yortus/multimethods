import andThen from '../util/and-then';
import {CONTINUE} from '../sentinels';
import debug, {DISPATCH} from '../util/debug';
import isMetaMethod from '../util/is-meta-method';
import repeatString from '../util/string-repeat';
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

        if (debug.enabled) {
            chain = chain.map((method, i) => instrumentMethod(predicate, method, i));
        }
        result[predicate] = chain;
    }
    return result;
}





// TODO: doc...
function instrumentMethod(predicate: string, method: Function, chainIndex: number) {
    let methodInfo = `method=${predicate}${repeatString('ᐟ', chainIndex)}   type=${isMetaMethod(method) ? 'meta' : 'regular'}`;
    let wrapped = function(...args: any[]) {
        let next = isMetaMethod(method) ? args.pop() : null;
        let captures = args.pop();
        debug(`${DISPATCH} |-->| %s${captures ? '   captures=%o' : ''}`, methodInfo, captures);
        let getResult = () => isMetaMethod(method) ? method(...args, captures, next) : method(...args, captures);
        return andThen(getResult, (result, error, isAsync) => {
            let resultInfo = error ? 'result=ERROR' : result === CONTINUE ? 'result=CONTINUE' : '';
            debug(`${DISPATCH} |<--| %s   %s   %s`, methodInfo, isAsync ? 'async' : 'sync', resultInfo);
            if (error) throw error; else return result;
        });
    };

    if (isMetaMethod(method)) isMetaMethod(wrapped, true);
    return wrapped;
}





// TODO: doc...
let multimethodCounter = 0;
