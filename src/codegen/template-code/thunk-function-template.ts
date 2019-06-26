import Thunk from '../thunk';




// tslint:disable: max-line-length
// tslint:disable: no-shadowed-variable
// tslint:disable: no-var-keyword
// tslint:disable: only-arrow-functions




// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export default function __FUNCNAME__(dsc: string, res: any, __ARGS__: any[], args: any[] | undefined) {

    // TODO: explain why result is passed in and checked here (hint: unified code for sync/async handling)
    if (res !== $.NEXT) {
        return res;
    }

    if ($.HAS_CAPTURES) {
        var ctx = {
            pattern: $.GET_CAPTURES(dsc),
        };
    }
    else {
        var ctx = $.EMPTY_CONTEXT;
    }

    // TODO: call method in most efficient way...
    if (!$.IS_META_METHOD) {
        res = args === undefined ? $.METHOD.call(ctx, __ARGS__) : $.METHOD.apply(ctx, args);
    }
    else {
        if ($.HAS_DOWNSTREAM) {
            var fwd = function (__ARGS__: any[]) {
                var args = arguments.length <= $.ARITY ? undefined : $.COPY_ARRAY(arguments);
                return $.DOWNSTREAM_THUNK(dsc, $.NEXT, __ARGS__, args);
            };
        }
        else {
            var fwd: typeof fwd = function () {
                return $.NEXT;
            };
        }

        res = $.METHOD(fwd, args || [__ARGS__], ctx);
    }

    // TODO: cascade result...
    if (!$.ENDS_PARTITION) {
        // Methods may be sync or async, and we must differentiate at runtime
        if ($.IS_PROMISE_LIKE(res)) {
            res = res.then(rs => $.FALLBACK_THUNK(dsc, rs, __ARGS__, args));
        }
        else {
            res = $.FALLBACK_THUNK(dsc, res, __ARGS__, args);
        }
    }
    return res;
}




// TODO: explain...
declare const $: VarsInScope & StaticConds;




// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VarsInScope {
    IS_PROMISE_LIKE: (x: any) => x is Promise<any>;
    NEXT: any;
    EMPTY_CONTEXT: {pattern: {}};

    // TODO: revise comment...
    /*
        refers to the first method in the next more-specific partition (see JSDoc notes at top
        of this file). It is substituted in as the value of `forward` when a meta-method is called.
    */
    DOWNSTREAM_THUNK: Thunk;

    /* used for cascading evaluation, i.e. when the thunk's corresponding method returns NEXT. */
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
