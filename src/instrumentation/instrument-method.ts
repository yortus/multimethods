import andThen from '../util/and-then';
import {CONTINUE} from '../sentinels';
import debug, {DISPATCH} from '../util/debug';
import isMetaMethod from '../util/is-meta-method';
import repeatString from '../util/string-repeat';





// TODO: doc...
export default function instrumentMethod(predicate: string, method: Function, chainIndex: number) {
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
