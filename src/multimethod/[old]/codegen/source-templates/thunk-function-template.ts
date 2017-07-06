import Thunk from '../thunk';





// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __VARARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export const template = function __FUNCNAME__(discriminant: string, result: {}|Promise<{}>, __VARARGS__: any[]) {

    // TODO: explain why result is passed in and checked here (hint: unified code for sync/async handling)
    if (result !== $.CONTINUE) {
        return result;
    }

    if ($.HAS_CAPTURES) {
        var captures = $.GET_CAPTURES(discriminant);
    }
    else {
        var captures = $.EMPTY_OBJECT;
    }

    // TODO: call method in most efficient way...
    if (!$.IS_META_METHOD) {
        result = $.CALL_HANDLER(__VARARGS__, captures);
    }
    else {
        if ($.HAS_DOWNSTREAM) {
            var forward = function (__VARARGS__: any[]) {
                return $.DELEGATE_DOWNSTREAM(discriminant, $.CONTINUE, __VARARGS__);
            };
        }
        else {
            var forward: typeof forward = function () { return $.CONTINUE; };
        }
        result = $.CALL_HANDLER(__VARARGS__, captures, forward);
    }

    // TODO: cascade result...
    if (!$.ENDS_PARTITION) {
        if ($.IS_NEVER_ASYNC) {

            // All methods in this MM are synchronous
            result = $.DELEGATE_FALLBACK(discriminant, result, __VARARGS__);
        }
        else {
            if ($.IS_ALWAYS_ASYNC) {

                // All methods in this MM are asynchronous
                result = Promise.resolve(result).then(rs => $.DELEGATE_FALLBACK(discriminant, rs, __VARARGS__));
            }
            else {

                // Methods may be sync or async, and we must differentiate at runtime
                if ($.IS_PROMISE(result)) {
                    result = result.then(rs => $.DELEGATE_FALLBACK(discriminant, rs, __VARARGS__));
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
    IS_PROMISE: (x: any) => x is Promise<any>;
    CONTINUE: any;
    EMPTY_OBJECT: {};

    // TODO: revise comment...
    /*
        refers to the first method in the next more-specific partition (see JSDoc notes at top
        of this file). It is substituted in as the value of `forward` when a meta-method is called.
    */
    DELEGATE_DOWNSTREAM: Thunk;

    /* used for cascading evaluation, i.e. when the thunk's immediate handler returns CONTINUE. */
    DELEGATE_FALLBACK: Thunk;

    GET_CAPTURES: (discriminant: string) => {};
    CALL_HANDLER: (...args: any[]) => any; // Method signature, NB: context is passed last!
}

// TODO: these are statically known conditions that facilitate dead code elimination
// TODO: explain each of these in turn...
export interface BooleanConstants {
    ENDS_PARTITION: boolean;
    HAS_CAPTURES: boolean;
    IS_META_METHOD: boolean;
    IS_ALWAYS_ASYNC: boolean;
    IS_NEVER_ASYNC: boolean;
    HAS_DOWNSTREAM: boolean;
}
