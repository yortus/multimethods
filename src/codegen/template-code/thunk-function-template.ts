import * as fatalError from '../../util/fatal-error';
import Thunk from '../thunk';




// TODO: explain - template source can only include constructs that are supported by all target runtimes. So no ES6.
// tslint:disable: no-shadowed-variable
// tslint:disable: no-var-keyword
// tslint:disable: object-literal-shorthand
// tslint:disable: only-arrow-functions




// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export default function __FUNCNAME__(dsc: string, __ARGS__: any[], args: any[] | undefined) {

    if ($.ENDS_PARTITION) {
        var outer = function () {
            return $.ERROR_UNHANDLED(dsc) as any;
        };
    }
    else {
        var outer = function () {
            return $.FALLBACK_THUNK(dsc, __ARGS__, args);
        };
    }

    if ($.IS_META_METHOD) {
        if ($.HAS_DOWNSTREAM) {
            var inner = function (__ARGS__: any[]) {
                var args = arguments.length <= $.ARITY ? undefined : $.COPY_ARRAY(arguments);
                return $.DOWNSTREAM_THUNK(dsc, __ARGS__, args);
            };
        }
        else {
            var inner: typeof inner = function () {
                return $.ERROR_UNHANDLED(dsc);
            };
        }
    }
    else {
        var inner: typeof inner = function () {
            return $.ERROR_UNHANDLED(dsc);
        };
    }

    if ($.HAS_CAPTURES) {
        var ctx = {
            pattern: $.GET_CAPTURES(dsc),
            inner: inner,
            outer: outer,
        };
    }
    else {
        var ctx = {
            pattern: {},
            inner: inner,
            outer: outer,
        };
    }

    // TODO: call method in most efficient way...
    var res = args === undefined ? $.METHOD.call(ctx, __ARGS__) : $.METHOD.apply(ctx, args);
    return res;
}




// TODO: explain...
declare const $: VarsInScope & StaticConds;




// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VarsInScope {
    ERROR_UNHANDLED: typeof fatalError.UNHANDLED;
    EMPTY_CONTEXT: {pattern: {}};

    // TODO: revise comment...
    /*
        refers to the first method in the next more-specific partition (see JSDoc notes at top
        of this file). It is substituted in as the value of `forward` when a meta-method is called.
    */
    DOWNSTREAM_THUNK: Thunk;

    /* used for cascading evaluation, i.e. when the thunk's corresponding method signals it went unhandled. */
    FALLBACK_THUNK: Thunk;

    GET_CAPTURES: (discriminant: string) => {};
    METHOD: (...args: any[]) => any; // Method signature, NB: context is passed last!
    ARITY: number;
    COPY_ARRAY: (els: any) => any[];
}

// TODO: these are statically known conditions that facilitate dead code elimination
// TODO: explain each of these in turn...
export interface StaticConds {
    ENDS_PARTITION: boolean;
    HAS_CAPTURES: boolean;
    IS_META_METHOD: boolean;
    HAS_DOWNSTREAM: boolean;
}
