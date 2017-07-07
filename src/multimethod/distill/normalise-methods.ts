import andThen from '../shared/and-then';
import CONTINUE from '../shared/continue';
import debug, {DISPATCH} from '../../util/debug';
import isMetaMethod from '../shared/is-meta-method';
import repeatString from '../../util/repeat-string';
import Options from '../api/options';





type CheckedMethods = {[predicate: string]: Function[]};





// TODO: ...
export default function normaliseMethods(methods: Options['methods']) {
    methods = methods || {};

    // TODO: doc...
    let result = {} as CheckedMethods;
    for (let predicate in methods) {
        let chain = methods[predicate];
        if (!Array.isArray(chain)) chain = [chain];

        if (debug.enabled) {
            chain = chain.map((method, i) => instrument(predicate, method, i));
        }
        result[predicate] = chain;
    }
    return result;
}





// TODO: doc...
function instrument(predicate: string, method: Function, chainIndex: number) {
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
