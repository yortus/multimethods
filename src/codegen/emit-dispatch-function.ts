import getNormalisedFunctionSource from './get-normalised-function-source';
import {template, VariablesInScope} from './source-templates/dispatch-function-template';
import {transformFunctionSource} from './source-transforms';





// TODO: doc...
export default function emitDispatchFunction(name: string, arity: number|undefined, env: Env) {
    let source = getNormalisedFunctionSource(template);
    return transformFunctionSource(source, name, arity, env);
}





// TODO: doc...
export type Env = {[K in keyof VariablesInScope]: string}
