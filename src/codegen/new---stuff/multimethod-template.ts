import {MMInfo, MMNode} from '../../analysis';
import * as substitutions from './substitutions';
import * as utils from './template-utilities';




// TODO: explain why this way - otherwise TSC will emit utils.BEGIN_SECTION instead of just BEGIN_SECTION
// TODO: -or- account for that in the regex
const {BEGIN_SECTION, END_SECTION, H1} = utils;




// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export function multimethodTemplate(mminfo: MMInfo<MMNode>, ℙ: typeof import('../../math/predicates')) {

    /** The multimethod's discriminator function. */
    let discriminator = mminfo.config.discriminator;

    /** The multimethod's error-handling function. */
    let unhandled = mminfo.config.unhandled;

    /** A frozen empty object. All empty pattern binding objects alias it in order to avoid unnecessary allocations. */
    let emptyObject = Object.freeze({});

    /** Returns a copy of a pseudo-array. Used to copy `arguments` into real local arrays as necessary. */
    let copy = (els: any) => Array.prototype.slice.call(els);

    /* -------------------------------------------------------------------------------- */
    H1('ENTRY POINT');
    BEGIN_SECTION('ENTRY POINT');
    function MM$NAME(MM$PARAMS: any) {
        let args = arguments.length <= MM.ARITY ? false as const : copy(arguments);
        let discriminant: string | Promise<string>;
        discriminant = args ? discriminator.apply(undefined, args) : discriminator(MM$PARAMS);

        if (typeof discriminant === 'string') {
            let thunk = MM$NAMEOF_SELECT_THUNK(discriminant);
            return thunk(discriminant, MM$PARAMS, args);
        }
        else {
            return discriminant.then(disc => {
                let thunk = MM$NAMEOF_SELECT_THUNK(disc);
                return thunk(disc, MM$PARAMS, args);
            });
        }
    }
    END_SECTION('ENTRY POINT');

    /* -------------------------------------------------------------------------------- */
    H1('THUNK SELECTOR');
    function MM$NAMEOF_SELECT_THUNK(discriminant: string): (disc: string, MM$PARAMS: any, args: any[]) => any {
        BEGIN_SECTION('SELECT_THUNK');
        // NB: the following placeholder content will be discarded
        [] = [discriminant]; // prevent TS6133
        return null!; // prevent TS2355
        // @ts-ignore - prevent TS7027
        END_SECTION('SELECT_THUNK');
    }

    /* -------------------------------------------------------------------------------- */
    H1('PATTERN MATCHING');
    BEGIN_SECTION('FOREACH_NODE');
    let NODE$NAMEOF_IS_MATCH = ℙ.toMatchFunction(ℙ.toNormalPredicate(mminfo.allNodes[NODE.INDEX].exactPredicate));
    if (NODE.HAS_PATTERN_BINDINGS) {
        // tslint:disable-next-line: no-var-keyword
        var NODE$NAMEOF_GET_PATTERN_BINDINGS: any = ℙ.toMatchFunction(mminfo.allNodes[NODE.INDEX].exactPredicate);
    }
    END_SECTION('FOREACH_NODE');

    /* -------------------------------------------------------------------------------- */
    H1('THUNKS');
    BEGIN_SECTION('FOREACH_MATCH');
    function MATCH$NAMEOF_THUNK(discriminant: string, MM$PARAMS: any[], args: any[] | false) {
        if (MATCH.HAS_NO_THIS_REFERENCE_IN_METHOD) {
            return args ? MATCH.NAMEOF_METHOD.apply(undefined, args) : MATCH.NAMEOF_METHOD(MM$PARAMS);
        }
        else {
            let outer: () => any;
            let inner: (...args: any[]) => any;
            let pattern: any;
            if (MATCH.HAS_OUTER_MATCH) {
                outer = () => MATCH.NAMEOF_OUTER_THUNK(discriminant, MM$PARAMS, args);
            }
            else {
                outer = () => unhandled(discriminant) as any;
            }

            if (MATCH.HAS_INNER_MATCH) {
                // tslint:disable-next-line: only-arrow-functions no-shadowed-variable
                inner = function (MM$PARAMS: any[]) {
                    let varargs = arguments.length > MM.ARITY && copy(arguments);
                    return MATCH.NAMEOF_INNER_THUNK(discriminant, MM$PARAMS, varargs);
                };
            }
            else {
                inner = () => unhandled(discriminant);
            }

            if (NODE.HAS_PATTERN_BINDINGS) {
                pattern = NODE.NAMEOF_GET_PATTERN_BINDINGS(discriminant);
            }
            else {
                pattern = emptyObject as any;

            }

            let context = {pattern, inner, outer};
            return args ? MATCH.NAMEOF_METHOD.apply(context, args) : MATCH.NAMEOF_METHOD.call(context, MM$PARAMS);
        }
    }
    END_SECTION('FOREACH_MATCH');

    /* -------------------------------------------------------------------------------- */
    H1('METHODS');
    BEGIN_SECTION('FOREACH_METHOD');
    let METHOD$NAME = mminfo.allNodes[NODE.INDEX].exactMethods[METHOD.INDEX];
    END_SECTION('FOREACH_METHOD');

    /* -------------------------------------------------------------------------------- */
    BEGIN_SECTION('TO_REMOVE');
    [] = [
        MM$NAMEOF_SELECT_THUNK,
        MATCH$NAMEOF_THUNK,
        NODE$NAMEOF_IS_MATCH,
        NODE$NAMEOF_GET_PATTERN_BINDINGS,
        METHOD$NAME,
    ];
    END_SECTION('TO_REMOVE');

    return MM$NAME;
}




declare const MM: Record<keyof ReturnType<typeof substitutions.forMultimethod>, any>;
declare const NODE: Record<keyof ReturnType<typeof substitutions.forNode>, any>;
declare const METHOD: Record<keyof ReturnType<typeof substitutions.forMethod>, any>;
declare const MATCH: Record<keyof ReturnType<typeof substitutions.forMatch>, any>;
