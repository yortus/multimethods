import Thunk from '../thunk';




// TODO: explain - template source can only include constructs that are supported by all target runtimes. So no ES6.
// tslint:disable: no-shadowed-variable
// tslint:disable: no-var-keyword
// tslint:disable: object-literal-shorthand
// tslint:disable: only-arrow-functions




// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export default function __FUNCNAME__(disc: string, __ARGS__: any[], args: any[] | false) {

    if ($.NO_THIS_REFERENCE_IN_METHOD) {
        return args ? $.METHOD.apply(undefined, args) : $.METHOD(__ARGS__);
    }
    else {
        if ($.HAS_OUTER_METHOD) {
            var outer = function () { return $.OUTER_THUNK(disc, __ARGS__, args); };
        }
        else {
            var outer = function () { return $.UNHANDLED(disc) as any; };
        }

        if ($.HAS_INNER_METHOD) {
            var inner = function (__ARGS__: any[]) {
                return $.INNER_THUNK(disc, __ARGS__, arguments.length > $.ARITY && $.COPY_ARRAY(arguments));
            };
        }
        else {
            var inner: typeof inner = function () { return $.UNHANDLED(disc); };
        }

        if ($.HAS_PATTERN_BINDINGS) {
            var pattern = $.GET_PATTERN_BINDINGS(disc);
        }
        else {
            var pattern = $.EMPTY_OBJECT;

        }

        var context = { pattern: pattern, inner: inner, outer: outer };
        return args ? $.METHOD.apply(context, args) : $.METHOD.call(context, __ARGS__);
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
