import Emitter, {EnvNames} from './emitter';
import {DispatchFunctionSubstitutions, dispatchFunctionTemplate} from './template-code';
import {transformTemplate} from './template-transforms';





// TODO: doc...
function emitDispatchFunction(emit: Emitter, name: string, arity: number|undefined, names: typeof EnvNames) {
    let env: DispatchFunctionSubstitutions = names;
    let source = transformTemplate(dispatchFunctionTemplate, name, arity, env);
    emit(source);
}
export default emitDispatchFunction;
