import createDispatchFunction from './create-dispatch-function';
import Options from '../api/options';





export default function distill(options: Options) {

    // TODO: implement...
    // 1. from options get:
    //    - arity: number | null
    //    - async: isAlwaysAsync, isNeverAsync
    //    - strict: boolean
    //    - toDiscriminant: given or default
    //    - methods: normalised hash of chains, possibly instrumented



    let result = createDispatchFunction(options);
    return result;
}
