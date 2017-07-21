import Emitter, {EnvNames} from './emitter';
import getNormalisedFunctionSource from './get-normalised-function-source';
import {template, VariablesInScope} from './source-templates/dispatch-function-template';
import {transformFunctionSource} from './source-transforms';





// TODO: doc...
export default function emitDispatchFunction(emit: Emitter, name: string, arity: number|undefined, names: typeof EnvNames) {
    let env: {[K in keyof VariablesInScope]: string} = names;
    let source = getNormalisedFunctionSource(template);
    source = transformFunctionSource(source, name, arity, env);
    emit(source);
}
