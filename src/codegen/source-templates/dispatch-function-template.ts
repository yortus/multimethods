import fatalError from '../../util/fatal-error';
import Thunk from '../thunk';





// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __VARARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export const template = function __FUNCNAME__(__VARARGS__: any[]) {
    let discriminant = $.TO_DISCRIMINANT(__VARARGS__);
    let thunk = $.SELECT_THUNK(discriminant);
    let result = thunk(discriminant, $.CONTINUE, __VARARGS__);
    return result === $.CONTINUE ? $.UNHANDLED_ERROR() : result;
};





// TODO: explain...
declare const $: VariablesInScope;





// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VariablesInScope {
    TO_DISCRIMINANT: (...args: any[]) => string;
    SELECT_THUNK: (discriminant: string) => Thunk;
    CONTINUE: any;
    UNHANDLED_ERROR: typeof fatalError.UNHANDLED;
}
