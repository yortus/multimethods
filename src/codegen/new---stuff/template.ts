import {MMInfo} from '../../analysis';
import {EmitNode} from './emit-node';
import {getMultimethodSubstitutions, getNodeSubstitutions, getThunkSubstitutions, getMethodSubstitutions} from './helpers';




// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export function template(mminfo: MMInfo<EmitNode>) {

    // TODO: explain - template source can only include constructs that are supported by all target runtimes. So no ES6.
    // tslint:disable: no-var-keyword
    // tslint:disable: object-literal-shorthand
    // tslint:disable: only-arrow-functions

    // TODO: explain why we allow these in here... these ones are not ES6-related
    // tslint:disable: no-shadowed-variable




    /*==============================================================*
     *                    MULTIMETHOD DISPATCHER                    *
     *==============================================================*/
    function MM$NAME(MM$PARAMS: any) {
        var args = arguments.length <= MM.ARITY ? false as const : copyArray(arguments);
        var disc: string | Promise<string> = args ? discriminator.apply(undefined, args) : discriminator(MM$PARAMS);

        if (typeof disc === 'string') {
            var thunk = MM$NAMEOF_SELECT_THUNK(disc);
            var res = thunk(disc, MM$PARAMS, args);
        }
        else {
            var res: any = disc.then(function (disc) {
                var thunk = MM$NAMEOF_SELECT_THUNK(disc);
                return thunk(disc, MM$PARAMS, args);
            });
        }
        return res;
    }




    /*======================================================*
     *                    THUNK SELECTOR                    *
     *======================================================*/
    function MM$NAMEOF_SELECT_THUNK(discriminant: string): (disc: string, MM$PARAMS: any, args: any[]) => any {
        BEGIN_SECTION('SELECT_THUNK');
        // NB: the following placeholder content will be discarded
        [] = [discriminant]; // prevent TS6133
        return null!; // prevent TS2355
        // @ts-ignore - prevent TS7027
        END_SECTION('SELECT_THUNK');
    }




    /*==============================================*
     *                    THUNKS                    *
     *==============================================*/
    BEGIN_SECTION('FOREACH_MATCH');
    function MATCH$NAMEOF_THUNK(disc: string, MM$PARAMS: any[], args: any[] | false) {
        // tslint:disable: no-shadowed-variable
        if (MATCH.HAS_NO_THIS_REFERENCE_IN_METHOD) {
            return args ? MATCH.NAMEOF_METHOD.apply(undefined, args) : MATCH.NAMEOF_METHOD(MM$PARAMS);
        }
        else {
            if (MATCH.HAS_OUTER_MATCH) {
                var outer = function () { return MATCH.NAMEOF_OUTER_THUNK(disc, MM$PARAMS, args); };
            }
            else {
                var outer = function () { return unhandled(disc) as any; };
            }

            if (MATCH.HAS_INNER_MATCH) {
                var inner = function (MM$PARAMS: any[]) {
                    return MATCH.NAMEOF_INNER_THUNK(disc, MM$PARAMS, arguments.length > MM.ARITY && copyArray(arguments));
                };
            }
            else {
                var inner: typeof inner = function () { return unhandled(disc); };
            }

            if (NODE.HAS_PATTERN_BINDINGS) {
                var pattern = NODE.NAMEOF_GET_PATTERN_BINDINGS(disc);
            }
            else {
                var pattern = emptyObject as any;

            }

            var context = { pattern: pattern, inner: inner, outer: outer };
            return args ? MATCH.NAMEOF_METHOD.apply(context, args) : MATCH.NAMEOF_METHOD.call(context, MM$PARAMS);
        }
    }
    END_SECTION('FOREACH_MATCH');




    /*===================================================*
     *                    ENVIRONMENT                    *
     *===================================================*/
    // TODO: these must be in the lexical environment when the template is eval'd:
    // TODO: explain each of these in turn...
    var discriminator = mminfo.config.discriminator;
    var unhandled = mminfo.config.unhandled;
    var emptyObject = Object.freeze({});
    var copyArray = function (els: any) { return Array.prototype.slice.call(els); };

    BEGIN_SECTION('FOREACH_NODE');
    var NODE$NAMEOF_IS_MATCH = mminfo.allNodes[NODE.INDEX].isMatch;
    if (NODE.HAS_PATTERN_BINDINGS) {
        var NODE$NAMEOF_GET_PATTERN_BINDINGS: any = mminfo.allNodes[NODE.INDEX].getPatternBindings;
    }
    END_SECTION('FOREACH_NODE');

    BEGIN_SECTION('FOREACH_METHOD');
    var METHOD$NAME = mminfo.allNodes[NODE.INDEX].exactMethods[METHOD.INDEX];
    END_SECTION('FOREACH_METHOD');

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




declare function BEGIN_SECTION(sectionName: SectionName): void;
declare function END_SECTION(sectionName: SectionName): void;
export type SectionName = 'SELECT_THUNK' | 'FOREACH_MATCH' | 'FOREACH_NODE' | 'FOREACH_METHOD' | 'TO_REMOVE';




declare const MM: Record<keyof ReturnType<typeof getMultimethodSubstitutions>, any>;
declare const NODE: Record<keyof ReturnType<typeof getNodeSubstitutions>, any>;
declare const METHOD: Record<keyof ReturnType<typeof getMethodSubstitutions>, any>;
declare const MATCH: Record<keyof ReturnType<typeof getThunkSubstitutions>, any>;
