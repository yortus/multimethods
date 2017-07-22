import dispatchFunction, {VariablesInScope as DispatchVars} from './dispatch-function-template';
import Template from './template';
import thunkFunction, {BooleanConstants as ThunkBools, VariablesInScope as ThunkVars} from './thunk-function-template';




// TODO: doc... special `__FUNCNAME__` and `__VARARGS__` strings in templates
// TODO: doc... template guarantees...: 4-space indents, no blank lines, '\n' line endings, ...





export {Template};





// TODO: doc...
const dispatchFunctionTemplate = getNormalisedFunctionSource(dispatchFunction) as Template;
type DispatchFunctionSubstitutions = {[K in keyof DispatchVars]: string};
export {dispatchFunctionTemplate, DispatchFunctionSubstitutions};





// TODO: doc...
const thunkFunctionTemplate = getNormalisedFunctionSource(thunkFunction) as Template;
type ThunkFunctionSubstitutions = {[K in keyof ThunkVars]: string} & {[K in keyof ThunkBools]: boolean};
export {thunkFunctionTemplate, ThunkFunctionSubstitutions};





// TODO: doc...
function getNormalisedFunctionSource(fn: Function): string {
    // TODO: verify/fix 4-space indents. Otherwise hard-to find bugs may creep in if devs alter the template function
    // TODO: -or- don't assume 4-space indents anymore?
    let source = fn.toString();
    let lines = source.split(/[\r\n]+/); // NB: this removes blank lines too
    lines = lines.filter(line => !/^\s*\/\//.test(line)); // Remove comment lines
    let dedentCount = lines[1].match(/^[ ]+/)![0].length - 4;
    lines = [lines.shift()!].concat(...lines.map(line => line.slice(dedentCount)));
    source = lines.join('\n');
    return source;
}
