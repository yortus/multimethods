import * as fatalError from '../../util/fatal-error';
import Thunk from '../thunk';





// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
// tslint:disable:no-var-keyword
export default function __FUNCNAME__(__ARGS__: any) {
    if (arguments.length > $.ARITY) {
        args = new Array(arguments.length);
        for (var len = arguments.length, args: any = new Array(len), i = 0; i < len; ++i) {
            args[i] = arguments[i];
        }
        var discriminant: string = $.TO_DISCRIMINANT.apply(null, args);
    }
    else {
        var discriminant = $.TO_DISCRIMINANT(__ARGS__);
    }

    if (typeof discriminant === 'string') {
        var thunk = $.SELECT_THUNK(discriminant);
        var result = thunk(discriminant, $.CONTINUE, __ARGS__, args);
    }
    else {
        var result: any = (discriminant as Promise<string>).then(ds => {
            var thunk = $.SELECT_THUNK(ds);
            return thunk(discriminant, $.CONTINUE, __ARGS__, args);
        });
    }

    // Result may be sync or async, and we must differentiate at runtime.
    if ($.IS_PROMISE_LIKE(result)) {
        return result.then(rs => rs === $.CONTINUE ? $.ERROR_UNHANDLED(discriminant) : rs);
    }
    else {
        return result === $.CONTINUE ? $.ERROR_UNHANDLED(discriminant) : result;
    }
}





// TODO: explain...
declare const $: VarsInScope;





// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VarsInScope {
    IS_PROMISE_LIKE: (x: any) => x is Promise<any>;
    CONTINUE: any;
    ERROR_UNHANDLED: typeof fatalError.UNHANDLED;
    TO_DISCRIMINANT: (...args: any[]) => string;
    SELECT_THUNK: (discriminant: string) => Thunk;
    ARITY: number;
}
