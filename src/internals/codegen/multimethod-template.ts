import {PatternBindings} from '../../interface/multimethod';
import {MMInfo} from '../mm-info';
import * as substitutions from './substitutions';
import * as utils from './template-utilities';




// TODO: explain why this way - otherwise TSC will emit utils.BEGIN_SECTION instead of just BEGIN_SECTION
// TODO: -or- account for that in the regex
const {BEGIN_SECTION, END_SECTION} = utils;




// TODO: reuse this comment?
// Static sanity check that the names and structures assumed in emitted code match those statically declared in the
// EmitEnvironment var. A mismatch could arise for instance if IDE-based rename/refactor tools are used to change
// property names, etc. Such tools won't pick up the references in emitted code, which would lead to ReferenceError
// exceptions at runtime when the emitted code is evaluated. The following statements don't do anything, but they
// will cause static checking errors if refactorings have occured, and they indicate which names/structures assumed
// in the emitted code will need to be updated to agree with the refactored code.




// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential




// TODO: temp testing...
export interface Env {
    mminfo: MMInfo;
    ℙ: typeof import('../patterns');
    next: never;
    isPromise: typeof import('../util').isPromise;
}




/**
 * Contains multimethod implementation code in template form. This function is not called as-is. Rather it is
 * stringified to its source code, and that source code undergoes substitutions to produce the source code for an actual
 * multimethod. The resulting source code is evaluated to produce a multimethod function that is both fast and readable.
 */
export function multimethodTemplate(env: Env) {

    // TODO: temp testing...
    let mminfo = env.mminfo;
    let ℙ = env.ℙ;
    let next = env.next;
    let isPromise = env.isPromise;

    /** The multimethod's discriminator function. */
    let discriminator = mminfo.options.discriminator;

    /** The multimethod's error-handling function. */
    let unhandled = mminfo.options.unhandled;

    /** A frozen empty object. All empty pattern binding objects alias it in order to avoid unnecessary allocations. */
    let emptyObject = Object.freeze({});

    /** Returns a copy of a pseudo-array. Used to copy `arguments` into real local arrays as necessary. */
    let copy = (els: any) => Array.prototype.slice.call(els);

    /* -------------------------------------------------------------------------------- */
    BEGIN_SECTION('ENTRY POINT');
    function MM$NAME(MM$PARAMS: any) {
        let args = arguments.length <= MM.ARITY ? false as const : copy(arguments);
        let discriminant: string | Promise<string>;
        discriminant = args ? discriminator.apply(undefined, args) : discriminator(MM$PARAMS);

        let thunk: (discriminant: string, MM$PARAMS: any, args: any[]) => any;
        if (typeof discriminant === 'string') {
            thunk = MM$NAMEOF_SELECT_THUNK(discriminant);
            return thunk(discriminant, MM$PARAMS, args);
        }
        else {
            return discriminant.then(disc => {
                thunk = MM$NAMEOF_SELECT_THUNK(disc);
                return thunk(disc, MM$PARAMS, args);
            });
        }
    }
    END_SECTION('ENTRY POINT');

    /* -------------------------------------------------------------------------------- */
    BEGIN_SECTION('THUNK SELECTOR');
    /*
     * TODO: rewrite doc...
     * Generates a function that, given a discriminant, returns the best-matching route executor from the given list of
     * candidates. The returned selector function is generated for maximum readability and efficiency, using conditional
     * constructs that follow the branches of the given `taxonomy`.
     */
    function MM$NAMEOF_SELECT_THUNK(discriminant: string): any {
        // This is a dummy body that will be substituted for real code. The regex to replace this body
        // simply looks for the opening and closing brace, so don't put *any* braces in this dummy body.
        if (discriminant) return;
    }
    END_SECTION('THUNK SELECTOR');

    /* -------------------------------------------------------------------------------- */
    BEGIN_SECTION('PATTERN MATCHING');
    let NODE$NAMEOF_IS_MATCH = ℙ.toMatchFunction(ℙ.NormalisedPattern(mminfo.allNodes[NODE.INDEX].exactPattern));
    if (NODE.HAS_PATTERN_BINDINGS) {
        // tslint:disable-next-line: no-var-keyword
        var NODE$NAMEOF_GET_PATTERN_BINDINGS: any = ℙ.toMatchFunction(mminfo.allNodes[NODE.INDEX].exactPattern);
    }
    END_SECTION('PATTERN MATCHING');

    /* -------------------------------------------------------------------------------- */
    BEGIN_SECTION('THUNKS');
    /**
     * TODO: rewrite comments. Esp signature of route executor matches signature of multimethod (as per provided Options)
     * Generates the virtual method, called a 'thunk', for the given node.
     * In the absence of decoratots, the logic for the virtual method is straightforward: execute each matching method
     * in turn, from the most- to the least-specific, until one produces a result. With decorators, the logic becomes
     * more complex, because a decorator must run *before* more-specific regular methods, with those more specific
     * methods being wrapped into a callback function and passed to the decorator. To account for this, we perform
     * an order-preserving partitioning of all matching methods for the node, with each decorator starting a new
     * partition. Within each partition, we use the straightforward cascading logic outlined above.
     * However, each partition as a whole is executed in reverse-order (least to most specific), with the next
     * (more-specific) partition being passed as the `next` parameter to the decorator starting the previous
     * (less-specific) partition.
     */
    function MATCH$NAMEOF_THUNK(discriminant: string, MM$PARAMS: unknown[], varargs: unknown[] | false) {
        let outer: () => unknown;
        let patternBindings: PatternBindings;
        if (MATCH.HAS_OUTER_MATCH) {
            outer = () => MATCH.NAMEOF_OUTER_THUNK(discriminant, MM$PARAMS, varargs);
        }
        else {
            if (varargs) {
                outer = () => unhandled.apply(undefined, varargs);
            }
            else {
                outer = () => unhandled(MM$PARAMS);
            }
        }

        if (NODE.HAS_PATTERN_BINDINGS) {
            patternBindings = NODE.NAMEOF_GET_PATTERN_BINDINGS(discriminant);
        }
        else {
            patternBindings = emptyObject;
        }

        let result: unknown;
        if (MATCH.IS_DECORATOR) {
            let inner: (...args: unknown[]) => unknown;
            if (MATCH.HAS_INNER_MATCH) {
                // tslint:disable-next-line: only-arrow-functions no-shadowed-variable
                inner = function (MM$PARAMS: unknown[]) {
                    // TODO: move `copy` fn - recent V8 can leak arguments without loss of speed
                    let varargsᐟ = arguments.length > MM.ARITY && copy(arguments);
                    return MATCH.NAMEOF_INNER_THUNK(discriminant, MM$PARAMS, varargsᐟ);
                };
            }
            else {
                if (varargs) {
                    inner = () => unhandled.apply(undefined, varargs);
                }
                else {
                    inner = () => unhandled(MM$PARAMS);
                }
            }

            if (varargs) {
                result = MATCH.NAMEOF_METHOD(patternBindings, inner, varargs);
            }
            else {
                result = MATCH.NAMEOF_METHOD(patternBindings, inner, [MM$PARAMS]);
            }
        }
        else {
            if (varargs) {
                result = MATCH.NAMEOF_METHOD.apply(undefined, ([patternBindings] as unknown[]).concat(varargs));
            }
            else {
                result = MATCH.NAMEOF_METHOD(patternBindings, MM$PARAMS);
            }
        }


        // TODO: temp testing...
        if (result === next) {
            // TODO: temp testing...
            result = outer();
        }

        else if (isPromise(result)) {
            result = result.then(res => {
                return res === next ? outer() : res;
            });
        }

        return result;
    }
    END_SECTION('THUNKS');

    /* -------------------------------------------------------------------------------- */
    BEGIN_SECTION('METHODS');
    let METHOD$NAME = mminfo.allNodes[NODE.INDEX].exactMethods[METHOD.INDEX];
    END_SECTION('METHODS');

    if (MM.DUMMY_CODE) {
        [] = [
            MATCH$NAMEOF_THUNK,
            NODE$NAMEOF_IS_MATCH,
            NODE$NAMEOF_GET_PATTERN_BINDINGS,
            METHOD$NAME,
        ];
    }

    return MM$NAME;
}




declare const MM: Record<keyof ReturnType<typeof substitutions.forMultimethod>, any>;
declare const NODE: Record<keyof ReturnType<typeof substitutions.forNode>, any>;
declare const METHOD: Record<keyof ReturnType<typeof substitutions.forMethod>, any>;
declare const MATCH: Record<keyof ReturnType<typeof substitutions.forMatch>, any>;
