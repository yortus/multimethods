import Options from '../../options';
import NormalOptions from './normal-options';





// TODO: doc...
export default function normaliseMethods(methods: Options['methods']) {
    methods = methods || {};
    let result = {} as NormalOptions['methods'];
    for (let predicate in methods) {
        if (!methods.hasOwnProperty(predicate)) continue;
        let chain = methods[predicate];
        if (!Array.isArray(chain)) chain = [chain];
        result[predicate] = chain;
    }
    return result;
}
