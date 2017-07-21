import {dispatchFunctionTemplate, DispatchFunctionSubstitutions} from './source-templates';
import Emitter, {EnvNames} from './emitter';
import {transformFunctionSource} from './source-transforms';





// TODO: doc...
export default function emitDispatchFunction(emit: Emitter, name: string, arity: number|undefined, names: typeof EnvNames) {
    let env: DispatchFunctionSubstitutions = names;
    let source = transformFunctionSource(dispatchFunctionTemplate, name, arity, env);
    emit(source);
}
