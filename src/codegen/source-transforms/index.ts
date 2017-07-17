import downlevelES6RestSpread from './downlevel-es6-rest-spread';
import eliminateDeadCode from './eliminate-dead-code';
import replaceAll from './replace-all';





// TODO: doc helper...
export function transformFunctionSource<TEnv>(normalisedSource: string, name: string, arity: number|undefined, env: TEnv) {

    // Prepare textual substitutions
    let replacements = {} as {[x: string]: string};
    Object.keys(env).forEach((k: keyof TEnv) => replacements['$.' + k] = env[k].toString());
    replacements.__VARARGS__ = '...__VARARGS__'; // TODO: explain/doc __VARARGS__ convention: prevents tsc build from downleveling `...` to equiv ES5 in templates (since we do that better in here)
    replacements.__FUNCNAME__ = name; // TODO: explain/doc __FUNCNAME__ convention

    // Generate source code
    normalisedSource = replaceAll(normalisedSource, replacements);
    normalisedSource = eliminateDeadCode(normalisedSource);
    normalisedSource = downlevelES6RestSpread(normalisedSource, arity);
    return normalisedSource;
}
