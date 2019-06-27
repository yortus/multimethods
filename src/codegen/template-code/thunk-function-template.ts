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

    if ($.NO_THIS_REFERENCE_IN_METHOD) {
        return args === undefined ? $.METHOD(__ARGS__) : $.METHOD.apply(undefined, args);
    }
    else {
        if ($.HAS_OUTER_METHOD) {
            var outer = function () {
                return $.OUTER_THUNK(dsc, __ARGS__, args);
            };
        }
        else {
            var outer = function () {
                return $.UNHANDLED(dsc) as any;
            };
        }

        if ($.HAS_INNER_METHOD) {
            var inner = function (__ARGS__: any[]) {
                var args = arguments.length <= $.ARITY ? undefined : $.COPY_ARRAY(arguments);
                return $.INNER_THUNK(dsc, __ARGS__, args);
            };
        }
        else {
            var inner: typeof inner = function () {
                return $.UNHANDLED(dsc);
            };
        }

        if ($.HAS_PATTERN_BINDINGS) {
            var ctx = {
                pattern: $.GET_PATTERN_BINDINGS(dsc),
                inner: inner,
                outer: outer,
            };
        }
        else {
            var ctx = {
                pattern: $.EMPTY_OBJECT,
                inner: inner,
                outer: outer,
            };
        }

        return args === undefined ? $.METHOD.call(ctx, __ARGS__) : $.METHOD.apply(ctx, args);
    }
}




// TODO: explain...
declare const $: VarsInScope & StaticConds;




// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VarsInScope {
    UNHANDLED: (discriminant: string) => unknown;
    EMPTY_OBJECT: {};

    // TODO: revise comment...
    /*
        refers to the first method in the next more-specific partition (see JSDoc notes at top
        of this file). It is substituted in as the value of `forward` when a meta-method is called.
    */
    INNER_THUNK: Thunk;

    // TODO: revise comment...
    /* used for cascading evaluation, i.e. when the thunk's corresponding method signals it went unhandled. */
    OUTER_THUNK: Thunk;

    GET_PATTERN_BINDINGS: (discriminant: string) => {};
    METHOD: (...args: any[]) => any; // Method signature, NB: context is passed last!
    ARITY: number;
    COPY_ARRAY: (els: any) => any[];
}

// TODO: these are statically known conditions that facilitate dead code elimination
// TODO: explain each of these in turn...
export interface StaticConds {
    HAS_PATTERN_BINDINGS: boolean;
    HAS_INNER_METHOD: boolean;
    HAS_OUTER_METHOD: boolean;
    NO_THIS_REFERENCE_IN_METHOD: boolean;
}
