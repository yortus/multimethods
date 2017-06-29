import downlevelES6RestSpread from './source-transforms/downlevel-es6-rest-spread';
import eliminateDeadCode from './source-transforms/eliminate-dead-code';
import getNormalisedFunctionSource from './get-normalised-function-source';
import replaceAll from './source-transforms/replace-all';
import * as dispatchFunction from './source-templates/dispatch-function-template';
import * as thunkFunction from './source-templates/thunk-function-template';





// TODO: doc...
export function emitDispatchFunction(name: string, arity: number|undefined, env: Env<dispatchFunction.VariablesInScope>) {
    return emitFromTemplate(dispatchFunction.template, name, arity, env);
}





// TODO: doc...
export function emitThunkFunction(name: string, arity: number|undefined, env: ThunkFunctionEnv) {
    return emitFromTemplate(thunkFunction.template, name, arity, env);
}





// TODO: doc...
export type DispatchFunctionEnv = Env<dispatchFunction.VariablesInScope>;





// TODO: doc...
export type ThunkFunctionEnv = Env<thunkFunction.VariablesInScope, thunkFunction.BooleanConstants>





// TODO: doc helper...
export type Env<Vars = {}, Bools = {}> = {[K in keyof Vars]: string} & {[K in keyof Bools]: boolean};





// TODO: doc helper...
function emitFromTemplate<TEnv>(templateFunction: Function, name: string, arity: number|undefined, env: TEnv) {

    // Prepare textual substitutions
    let replacements = {} as {[x: string]: string};
    Object.keys(env).forEach((k: keyof TEnv) => replacements['$.' + k] = env[k].toString());
    replacements.__VARARGS__ = '...__VARARGS__'; // TODO: explain: by convention; prevents tsc build from downleveling `...` to equiv ES5 in templates (since we do that better below)
    replacements.__FUNCNAME__ = name;

    // Generate source code
    let source = getNormalisedFunctionSource(templateFunction);
    source = replaceAll(source, replacements);
    source = eliminateDeadCode(source);
    source = downlevelES6RestSpread(source, arity);
    return source;
}
