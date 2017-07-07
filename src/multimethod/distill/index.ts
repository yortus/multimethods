import distillStuff from './distill-stuff';
import MMInfo from '../shared/mm-info';
import Options from '../api/options';





export default function distill(options: Options): MMInfo {

    // TODO: implement...
    // 1. from options get:
    //    - arity: number | null
    //    - async: isAlwaysAsync, isNeverAsync
    //    - strict: boolean
    //    - toDiscriminant: given or default
    //    - methods: normalised hash of chains, possibly instrumented



    let result = distillStuff(options);
    return result;
}
