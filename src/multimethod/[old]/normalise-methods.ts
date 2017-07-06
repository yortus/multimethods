import {CONTINUE} from './sentinels';
import debug, {DISPATCH} from '../../util/debug';
import fatalError from '../../util/fatal-error';
import isPromiseLike from '../../util/is-promise-like';
import isMetaMethod from './is-meta-method';
import MultimethodOptions from './multimethod-options';
import repeatString from '../../util/repeat-string';
import {toPredicate, toNormalPredicate} from '../../set-theory/predicates';





// TODO: move method validation into here...? like with normaliseOptions...





export type CheckedMethods = {[predicate: string]: Function[]};





// TODO: ...
export default function normaliseMethods(methods: MultimethodOptions['methods']) {

    // TODO: doc these new invariants:
    // - all predicates in `methods` are valid
    // - no two predicates in `methods` have the same normalised predicate (use chains for this scenario)
    let deduped = {} as {[s: string]: string[]};
    Object.keys(methods).forEach(predicateSource => {
        let p = toPredicate(predicateSource);
        let np = toNormalPredicate(p);
        deduped[np] = deduped[np] || [];
        deduped[np].push(p);
    });
    for (let np in deduped) {
        if (deduped[np].length <= 1) continue;
        fatalError('DUPLICATE_PREDICATE', np, `'${deduped[np].join(`', '`)}'`);
    }

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
        debug(`${DISPATCH} Enter   %s${captures ? '   captures=%o' : ''}`, methodInfo, captures);
        let result = isMetaMethod(method) ? method(...args, captures, next) : method(...args, captures);
        let isAsync = isPromiseLike(result);
        return andThen(result, result => {
            let resultInfo = result === CONTINUE ? '   result=CONTINUE' : ''
            debug(`${DISPATCH} Leave   %s%s%s`, methodInfo, isAsync ? '   ASYNC' : '', resultInfo);
            return result;
        });
    };

    if (isMetaMethod(method)) isMetaMethod(wrapped, true);
    return wrapped;
}





// TODO: copypasta - move to util
function andThen(val: any, cb: (val: any) => any) {
    return isPromiseLike(val) ? val.then(cb) : cb(val);
}
