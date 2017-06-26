import {CONTINUE} from './sentinels';
import debug, {DISPATCH} from '../util/debug';
import isPromiseLike from '../util/is-promise-like';
import metaHandlers from './meta-handlers';
import MultimethodOptions from './multimethod-options';
import Rule from './rule';





// TODO: move rule validation into here...? like with normaliseOptions...





// TODO: ...
export default function normaliseRules(rules: MultimethodOptions['rules']) {
    let result: Rule[] = [];
    for (let predicate in rules) {
        let handler = rules[predicate];
        if (Array.isArray(handler)) {
            let chain = handler;
            for (handler of chain) {
                let rule = new Rule(predicate, handler);
                rule.chain = chain;
                if (debug.enabled) instrument(rule);
                result.push(rule);
            }
        }
        else {
            let rule = new Rule(predicate, handler);
            if (debug.enabled) instrument(rule);
            result.push(rule);
        }
    }
    return result;
}





// TODO: doc...
function instrument(rule: Rule) {
    let handler = rule.handler;
    let chainIndex = rule.chain ? rule.chain.indexOf(handler) : -1;
    let ruleInfo = `rule=${rule.predicate}${rule.chain ? ` [${chainIndex}]` : ''}   type=${rule.isMetaRule ? 'meta' : 'regular'}`;
    let wrapped = function(...args: any[]) {
        let next = rule.isMetaRule ? args.pop() : null;
        let captures = args.pop();
        debug(`${DISPATCH} Enter   %s${captures ? '   captures=%o' : ''}`, ruleInfo, captures);
        let result = rule.isMetaRule ? handler(...args, captures, next) : handler(...args, captures);
        let isAsync = isPromiseLike(result);
        return andThen(result, result => {
            let resultInfo = result === CONTINUE ? '   result=CONTINUE' : ''
            debug(`${DISPATCH} Leave   %s%s%s`, ruleInfo, isAsync ? '   ASYNC' : '', resultInfo);
            return result;
        });
    };

    rule.handler = wrapped;
    if (rule.chain) rule.chain[chainIndex] = wrapped;
    if (rule.isMetaRule) metaHandlers.set(wrapped, true);
}





// TODO: copypasta - move to util
function andThen(val: any, cb: (val: any) => any) {
    return isPromiseLike(val) ? val.then(cb) : cb(val);
}
