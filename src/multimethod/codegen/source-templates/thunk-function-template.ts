import Thunk from '../thunk';





// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __VARARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export const template = function __FUNCNAME__(discriminant: string, result: any, __VARARGS__: any[]) {

    // TODO: explain why result is passed in and checked here (hint: unified code for sync/async handling)
    if (result !== $.CONTINUE) {
        return result;
    }

    // TODO: call method in most efficient way...
    if ($.IS_META_RULE) {
        if ($.HAS_DOWNSTREAM) {
            var next: Function = function (__VARARGS__: any[]) {
                return $.DELEGATE_DOWNSTREAM(discriminant, $.CONTINUE, __VARARGS__);
            };
        }
        else {
            var next: Function = function () { return $.CONTINUE; };
        }
        if ($.HAS_CAPTURES) {
            var captures = $.GET_CAPTURES(discriminant);
            result = $.CALL_HANDLER(__VARARGS__, captures, next);
        }
        else {
            result = $.CALL_HANDLER(__VARARGS__, undefined, next);
        }
    }
    else {
        if ($.HAS_CAPTURES) {
            var captures = $.GET_CAPTURES(discriminant);
            result = $.CALL_HANDLER(__VARARGS__, captures);
        }
        else {
            result = $.CALL_HANDLER(__VARARGS__);
        }
    }

    // TODO: cascade result...
    if (!$.ENDS_PARTITION) {
        if ($.IS_PURE_SYNC) {

            // All methods in this MM are synchronous
            result = $.DELEGATE_FALLBACK(discriminant, result, __VARARGS__);
        }
        else {
            if ($.IS_PURE_ASYNC) {

                // All methods in this MM are asynchronous
                result = result.then(function (rs: any) { return $.DELEGATE_FALLBACK(discriminant, rs, __VARARGS__); });
            }
            else {

                // Methods may be sync or async, and we must differentiate at runtime
                if ($.isPromise(result)) {
                    result = result.then(function (rs: any) { return $.DELEGATE_FALLBACK(discriminant, rs, __VARARGS__); });
                }
                else {
                    result = $.DELEGATE_FALLBACK(discriminant, result, __VARARGS__);
                }
            }
        }
    }
    return result;
}





// TODO: explain...
declare const $: VariablesInScope & BooleanConstants;





// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VariablesInScope {
    isPromise: (x: any) => boolean;
    CONTINUE: any;
    DELEGATE_DOWNSTREAM: Thunk;
    DELEGATE_FALLBACK: Thunk;
    GET_CAPTURES: (discriminant: string) => {};
    CALL_HANDLER: (...args: any[]) => any; // Method signature, NB: context is passed last!
}

// TODO: these are statically known conditions that facilitate dead code elimination
// TODO: explain each of these in turn...
export interface BooleanConstants {
    ENDS_PARTITION: boolean;
    HAS_CAPTURES: boolean;
    IS_META_RULE: boolean;
    IS_PURE_SYNC: boolean;
    IS_PURE_ASYNC: boolean;
    HAS_DOWNSTREAM: boolean;
}
