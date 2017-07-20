import Emitter from './emitter';
import getNormalisedFunctionSource from './get-normalised-function-source';
import {template, VariablesInScope} from './source-templates/dispatch-function-template';
import {transformFunctionSource} from './source-transforms';





// TODO: doc...
export default function emitDispatchFunction(emit: Emitter, name: string, arity: number|undefined, env: Env) {
    let source = getNormalisedFunctionSource(template);
    source = transformFunctionSource(source, name, arity, env);
    emit(source);
}





// TODO: doc...
export type Env = {[K in keyof VariablesInScope]: string}
