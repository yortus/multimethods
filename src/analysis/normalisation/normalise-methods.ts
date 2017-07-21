import NormalOptions from './normal-options';
import Options from '../../options';





// TODO: ...
export default function normaliseMethods(methods: Options['methods']) {
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
