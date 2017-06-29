import Thunk from '../thunk';
import eliminateDeadCode from '../transforms/eliminate-dead-code';
import getNormalisedFunctionSource from '../get-normalised-function-source';
import replaceAll from '../transforms/replace-all';





// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VariablesInScope {
    isPromise: (x: any) => boolean;
    CONTINUE: any;
}

// TODO: these are statically known conditions that facilitate dead code elimination
// TODO: explain each of these in turn...
export interface BooleanReferences {
    ENDS_PARTITION: boolean;
    HAS_CAPTURES: boolean;
    IS_META_RULE: boolean;
    IS_PURE_SYNC: boolean;
    IS_PURE_ASYNC: boolean;
    HAS_DOWNSTREAM: boolean;
}

// TODO: these are replacement placeholders.
// TODO: explain each of these in turn...
export interface FunctionReferences {
    DELEGATE_DOWNSTREAM: Thunk;
    DELEGATE_NEXT: Thunk;
    GET_CAPTURES: (discriminant: string) => {};
    CALL_HANDLER: (...args: any[]) => any; // Method signature, NB: context is passed last!
}

export type Environment
    = {[K in keyof VariablesInScope]: K}
    & {[K in keyof BooleanReferences]: boolean}
    & {[K in keyof FunctionReferences]: string}





export default function emitThunkFunction(name: string, env: Environment) {

    // TODO: explain dummy var for type-checking template...
    const $ = {} as VariablesInScope & BooleanReferences & FunctionReferences

    // Prepare textual substitutions
    let replacements = {} as {[x: string]: string};
    Object.keys(env).forEach((k: keyof Environment) => replacements['$.' + k] = env[k].toString());
    replacements.ELLIPSIS_ = '...'; // TODO: explain: by convention; prevents tsc build from downleveling `...` to equiv ES5 in templates (since we do that better below)
    replacements.TEMPLATE_NAME = name;

    // Generate source code
    let source = getNormalisedFunctionSource(TEMPLATE_NAME);
    source = replaceAll(source, replacements);
    source = eliminateDeadCode(source);
    return source;

    // TODO: explain important norms in the template function...
    // TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
    function TEMPLATE_NAME(discriminant: string, result: any, ELLIPSIS_MMARGS: any[]) {

        // TODO: explain why result is passed in and checked here (hint: unified code for sync/async handling)
        if (result !== $.CONTINUE) {
            return result;
        }

        // TODO: call method in most efficient way...
        if ($.IS_META_RULE) {
            if ($.HAS_DOWNSTREAM) {
                var next: Function = function (ELLIPSIS_MMARGS: any[]) {
                    return $.DELEGATE_DOWNSTREAM(discriminant, $.CONTINUE, ELLIPSIS_MMARGS);
                };
            }
            else {
                var next: Function = function () { return $.CONTINUE; };
            }
            if ($.HAS_CAPTURES) {
                var captures = $.GET_CAPTURES(discriminant);
                result = $.CALL_HANDLER(ELLIPSIS_MMARGS, captures, next);
            }
            else {
                result = $.CALL_HANDLER(ELLIPSIS_MMARGS, undefined, next);
            }
        }
        else {
            if ($.HAS_CAPTURES) {
                var captures = $.GET_CAPTURES(discriminant);
                result = $.CALL_HANDLER(ELLIPSIS_MMARGS, captures);
            }
            else {
                result = $.CALL_HANDLER(ELLIPSIS_MMARGS);
            }
        }

        // TODO: cascade result...
        if (!$.ENDS_PARTITION) {
            if ($.IS_PURE_SYNC) {

                // All methods in this MM are synchronous
                result = $.DELEGATE_NEXT(discriminant, result, ELLIPSIS_MMARGS);
            }
            else {
                if ($.IS_PURE_ASYNC) {

                    // All methods in this MM are asynchronous
                    result = result.then(function (rs: any) { return $.DELEGATE_NEXT(discriminant, rs, ELLIPSIS_MMARGS); });
                }
                else {

                    // Methods may be sync or async, and we must differentiate at runtime
                    if ($.isPromise(result)) {
                        result = result.then(function (rs: any) { return $.DELEGATE_NEXT(discriminant, rs, ELLIPSIS_MMARGS); });
                    }
                    else {
                        result = $.DELEGATE_NEXT(discriminant, result, ELLIPSIS_MMARGS);
                    }
                }
            }
        }
        return result;
    }
}
