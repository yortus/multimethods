import Rule from './rule';
import MultimethodOptions from './multimethod-options';





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
                result.push(rule);
            }
        }
        else {
            result.push(new Rule(predicate, handler));
        }
    }
    return result;
}
