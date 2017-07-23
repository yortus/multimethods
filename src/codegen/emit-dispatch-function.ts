import Emitter, {EnvNames} from './emitter';
import {DispatchFunctionSubstitutions, dispatchFunctionTemplate} from './templates';
import {transformFunctionSource} from './template-transforms';





// TODO: doc...
function emitDispatchFunction(emit: Emitter, name: string, arity: number|undefined, names: typeof EnvNames) {
    let env: DispatchFunctionSubstitutions = names;
    let source = transformFunctionSource(dispatchFunctionTemplate, name, arity, env);
    emit(source);
}
export default emitDispatchFunction;
