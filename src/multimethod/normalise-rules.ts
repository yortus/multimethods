import {CONTINUE} from './sentinels';
import debug, {DISPATCH} from '../util/debug';
import fatalError from '../util/fatal-error';
import isPromiseLike from '../util/is-promise-like';
import isMetaHandler from './is-meta-handler';
import MultimethodOptions from './multimethod-options';
import repeatString from '../util/repeat-string';
import {toPredicate, toNormalPredicate} from '../set-theory/predicates';





// TODO: move rule validation into here...? like with normaliseOptions...





export type CheckedMethods = {[predicate: string]: Function[]};





// TODO: ...
export default function normaliseRules(rules: MultimethodOptions['rules']) {

    // TODO: doc these new invariants:
    // - all rules have valid predicates
    // - no two rules have the same normalised predicate (use chains for this scenario)
    let deduped = {} as {[s: string]: string[]};
    Object.keys(rules).forEach(predicateSource => {
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
    for (let predicate in rules) {
        let chain = rules[predicate];
        if (!Array.isArray(chain)) chain = [chain];

        if (debug.enabled) {
            chain = chain.map((handler, i) => instrument(predicate, handler, i));
        }
        result[predicate] = chain;
    }
    return result;
}





// TODO: doc...
function instrument(predicate: string, handler: Function, chainIndex: number) {
    let ruleInfo = `rule=${predicate}${repeatString('ᐟ', chainIndex)}   type=${isMetaHandler(handler) ? 'meta' : 'regular'}`;
    let wrapped = function(...args: any[]) {
        let next = isMetaHandler(handler) ? args.pop() : null;
        let captures = args.pop();
        debug(`${DISPATCH} Enter   %s${captures ? '   captures=%o' : ''}`, ruleInfo, captures);
        let result = isMetaHandler(handler) ? handler(...args, captures, next) : handler(...args, captures);
        let isAsync = isPromiseLike(result);
        return andThen(result, result => {
            let resultInfo = result === CONTINUE ? '   result=CONTINUE' : ''
            debug(`${DISPATCH} Leave   %s%s%s`, ruleInfo, isAsync ? '   ASYNC' : '', resultInfo);
            return result;
        });
    };

    if (isMetaHandler(handler)) isMetaHandler(wrapped, true);
    return wrapped;
}





// TODO: copypasta - move to util
function andThen(val: any, cb: (val: any) => any) {
    return isPromiseLike(val) ? val.then(cb) : cb(val);
}
