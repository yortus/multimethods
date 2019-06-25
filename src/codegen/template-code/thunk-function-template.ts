import {INVALID_METHOD_RESULT} from '../../util/fatal-error';
import Thunk from '../thunk';





// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
// tslint:disable:no-var-keyword
export default function __FUNCNAME__(discriminant: string, result: any, __ARGS__: any[], args: any[] | undefined) {

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
        if (args === undefined) {
            result = $.METHOD.call({pattern: captures}, __ARGS__);
        }
        else {
            result = $.METHOD.apply({pattern: captures}, args);
        }
    }
    else {
        if ($.HAS_DOWNSTREAM) {
            // tslint:disable-next-line:no-shadowed-variable
            var forward = function (__ARGS__: any[]) {
                var args: any[] | undefined;
                if (arguments.length > $.ARITY) {
                    args = [];
                    for (var len = arguments.length, i = 0; i < len; ++i) args.push(arguments[i]);
                }
                return $.DOWNSTREAM_THUNK(discriminant, $.CONTINUE, __ARGS__, args);
            };
        }
        else {
            var forward: typeof forward = () => {
                return $.CONTINUE;
            };
        }

        if (args === undefined) {
            result = $.METHOD(__ARGS__, captures, forward);
        }
        else {
            // TODO: temp testing... BROKEN... needs updating to new calling convention
            result = $.METHOD(args[0], captures, forward);
        }
    }

    // TODO: do extra checks on method result in strict mode
    if ($.IS_STRICT_MODE) {
        if ($.IS_NEVER_ASYNC) {
            if ($.IS_PROMISE_LIKE(result)) {
                $.ERROR_INVALID_RESULT('$.METHOD', 'an immediate value', 'a promise');
            }
        }
        if ($.IS_ALWAYS_ASYNC) {
            if (!$.IS_PROMISE_LIKE(result)) {
                result = Promise.resolve().then(() => {
                    $.ERROR_INVALID_RESULT('$.METHOD', 'a promise', 'an immediate value');
                });
            }
        }
    }

    // TODO: cascade result...
    if (!$.ENDS_PARTITION) {
        if ($.IS_NEVER_ASYNC) {

            // All methods in this MM are synchronous
            result = $.FALLBACK_THUNK(discriminant, result, __ARGS__, args);
        }
        else {
            if ($.IS_ALWAYS_ASYNC) {

                // All methods in this MM are asynchronous
                result = (result as Promise<any>).then(rs => $.FALLBACK_THUNK(discriminant, rs, __ARGS__, args));
            }
            else {

                // Methods may be sync or async, and we must differentiate at runtime
                if ($.IS_PROMISE_LIKE(result)) {
                    result = result.then(rs => $.FALLBACK_THUNK(discriminant, rs, __ARGS__, args));
                }
                else {
                    result = $.FALLBACK_THUNK(discriminant, result, __ARGS__, args);
                }
            }
        }
    }
    return result;
}





// TODO: explain...
declare const $: VarsInScope & StaticConds;





// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VarsInScope {
    IS_PROMISE_LIKE: (x: any) => x is Promise<any>;
    CONTINUE: any;
    EMPTY_OBJECT: {};
    ERROR_INVALID_RESULT: typeof INVALID_METHOD_RESULT;

    // TODO: revise comment...
    /*
        refers to the first method in the next more-specific partition (see JSDoc notes at top
        of this file). It is substituted in as the value of `forward` when a meta-method is called.
    */
    DOWNSTREAM_THUNK: Thunk;

    /* used for cascading evaluation, i.e. when the thunk's corresponding method returns CONTINUE. */
    FALLBACK_THUNK: Thunk;

    GET_CAPTURES: (discriminant: string) => {};
    METHOD: (...args: any[]) => any; // Method signature, NB: context is passed last!
    ARITY: number;
}

// TODO: these are statically known conditions that facilitate dead code elimination
// TODO: explain each of these in turn...
export interface StaticConds {
    IS_STRICT_MODE: boolean;
    ENDS_PARTITION: boolean;
    HAS_CAPTURES: boolean;
    IS_META_METHOD: boolean;
    IS_ALWAYS_ASYNC: boolean;
    IS_NEVER_ASYNC: boolean;
    HAS_DOWNSTREAM: boolean;
}
