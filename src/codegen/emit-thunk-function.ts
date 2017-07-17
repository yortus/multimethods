import getNormalisedFunctionSource from './get-normalised-function-source';
import {template, VariablesInScope, BooleanConstants} from './source-templates/thunk-function-template';
import {transformFunctionSource} from './source-transforms';





// TODO: doc...
export default function emitThunkFunction(name: string, arity: number|undefined, env: Env) {
    let source = getNormalisedFunctionSource(template);
    return transformFunctionSource(source, name, arity, env);
}





// TODO: doc...
export type Env = {[K in keyof VariablesInScope]: string} & {[K in keyof BooleanConstants]: boolean};
