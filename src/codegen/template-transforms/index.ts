import {Template} from '../template-code';
import downlevelES6RestSpread from './downlevel-es6-rest-spread';
import eliminateDeadCode from './eliminate-dead-code';
import replaceAll from './replace-all';





// TODO: doc helper...
// TODO: explain/doc __FUNCNAME__ convention: allows emitted code to name the function
// TODO: explain/doc __VARARGS__ convention: prevents tsc build from downleveling `...` to equiv ES5 in templates
//       - (since we do that better in here)
export function transformTemplate<TEnv>(template: Template, name: string, arity: number|undefined, env: TEnv) {

    // Prepare textual substitutions
    let replacements = {} as {[x: string]: string};
    Object.keys(env).forEach((k: Extract<keyof TEnv, string>) => replacements['$.' + k] = env[k].toString());
    replacements.__VARARGS__ = '...__VARARGS__';
    replacements.__FUNCNAME__ = name;

    // Generate source code
    template = replaceAll(template, replacements);
    template = eliminateDeadCode(template);
    template = downlevelES6RestSpread(template, arity);
    return template;
}
