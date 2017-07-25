import * as fatalError from '../../util/fatal-error';
import Thunk from '../thunk';





// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __VARARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
// TODO: implement non-promise-like result assertion for when options.async === false
export default function __FUNCNAME__(__VARARGS__: any[]) {
    let discriminant = $.TO_DISCRIMINANT(__VARARGS__);
    let thunk = $.SELECT_THUNK(discriminant);

    if ($.IS_ASYNC_RESULT_REQUIRED) {
        try {
            var result = thunk(discriminant, $.CONTINUE, __VARARGS__);
        }
        catch(error) {
            result = Promise.resolve().then(() => {
                $.ERROR_INVALID_RESULT('$.METHOD', 'a promise', 'an exception');
            });
        }
    }
    else {
        var result = thunk(discriminant, $.CONTINUE, __VARARGS__);
    }


    return result === $.CONTINUE ? $.ERROR_UNHANDLED() : result;
}





// TODO: explain...
declare const $: VarsInScope & StaticConds;





// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VarsInScope {
    CONTINUE: any;
    ERROR_UNHANDLED: typeof fatalError.UNHANDLED;
    ERROR_INVALID_RESULT: typeof fatalError.INVALID_METHOD_RESULT;
    TO_DISCRIMINANT: (...args: any[]) => string;
    SELECT_THUNK: (discriminant: string) => Thunk;
}





// TODO: these are statically known conditions that facilitate dead code elimination
// TODO: explain each of these in turn...
export interface StaticConds {
    IS_ASYNC_RESULT_REQUIRED: boolean;
}
