import * as fatalError from '../../util/fatal-error';
import Thunk from '../thunk';





// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
// tslint:disable:no-var-keyword
export default function __FUNCNAME__(__ARGS__: any) {
    var args: any[] | undefined;
    if (arguments.length > $.ARITY) {
        args = [];
        for (var len = arguments.length, i = 0; i < len; ++i) args.push(arguments[i]);
        var discriminant: string = $.TO_DISCRIMINANT.apply(null, args);
    }
    else {
        var discriminant = $.TO_DISCRIMINANT(__ARGS__);
    }

    if ($.IS_PROMISE_LIKE(discriminant)) {
        var result: any = discriminant.then(ds => {
            var thunk = $.SELECT_THUNK(ds);
            return thunk(discriminant, $.CONTINUE, __ARGS__, args);
        });
    }
    else {
        var thunk = $.SELECT_THUNK(discriminant);
        if ($.IS_ASYNC_RESULT_REQUIRED) {
            try {
                var result = thunk(discriminant, $.CONTINUE, __ARGS__, args);
                if (!$.IS_PROMISE_LIKE(result)) {
                    result = Promise.resolve().then(() => {
                        $.ERROR_INVALID_RESULT('$.METHOD', 'a promise', 'a synchronous result');
                    });
                }
            }
            catch (error) {
                result = Promise.resolve().then(() => {
                    $.ERROR_INVALID_RESULT('$.METHOD', 'a promise', 'an exception');
                });
            }
        }
        else {
            // TODO: check for async result in strict mode, like above but inverted...
            var result = thunk(discriminant, $.CONTINUE, __ARGS__, args);
        }
    }

    if ($.IS_NEVER_ASYNC) {
        // Result is never async.
        return result === $.CONTINUE ? $.ERROR_UNHANDLED(discriminant) : result;
    }
    else {
        // Result may be sync or async, and we must differentiate at runtime.
        if ($.IS_PROMISE_LIKE(result)) {
            return result.then(rs => rs === $.CONTINUE ? $.ERROR_UNHANDLED(discriminant) : rs);
        }
        else {
            return result === $.CONTINUE ? $.ERROR_UNHANDLED(discriminant) : result;
        }
    }
}





// TODO: explain...
declare const $: VarsInScope & StaticConds;





// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VarsInScope {
    IS_PROMISE_LIKE: (x: any) => x is Promise<any>;
    CONTINUE: any;
    ERROR_UNHANDLED: typeof fatalError.UNHANDLED;
    ERROR_INVALID_RESULT: typeof fatalError.INVALID_METHOD_RESULT;
    TO_DISCRIMINANT: (...args: any[]) => string;
    SELECT_THUNK: (discriminant: string) => Thunk;
    ARITY: number;
}





// TODO: these are statically known conditions that facilitate dead code elimination
// TODO: explain each of these in turn...
export interface StaticConds {
    IS_NEVER_ASYNC: boolean;
    IS_ASYNC_RESULT_REQUIRED: boolean;
}
