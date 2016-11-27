import RouteExecutor from './route-executor';





// TODO: how to ensure this is defined? Just doc?
let isPromise: (x: any) => boolean;





// TODO: explain each of these in turn...
let UNHANDLED: any;
let STARTS_PARTITION: boolean;
let ENDS_PARTITION: boolean;
let HAS_CAPTURES: boolean;
let IS_META_RULE: boolean;
let IS_PURE_SYNC: boolean;
let IS_PURE_ASYNC: boolean;
let DELEGATE_DOWNSTREAM: RouteExecutor;
let DELEGATE_NEXT: RouteExecutor;
let GET_CAPTURES: (discriminant: string) => {};
let CALL_METHOD: (...args: any[]) => any; // Method signature, NB: context is passed last!
let FROZEN_EMPTY_OBJECT: {};


// TODO: note ES6 in source here - spread and rest (...MM_ARGS)
// TODO: explain important norms in the template function...
// TODO: don't need to dedent any more!
// TODO: put more explanatory comments inside, and strip them out to maximise inlining potential
export default function METHOD_NAME(discriminant: string, result: any, ...MM_ARGS: any[]) {

    // TODO: explain why result is passed in and checked here (hint: unified code for sync/async handling)
    if (!STARTS_PARTITION) {
        if (result !== UNHANDLED) {
            return result;
        }
    }

    // TODO: set up context...
    if (HAS_CAPTURES) {
        var context = GET_CAPTURES(discriminant);
    }
    else {
        if (IS_META_RULE) {
            var context = {};
        }
        else {
            var context = FROZEN_EMPTY_OBJECT;
        }
    }

    // TODO: meta rules...
    if (IS_META_RULE) {
        context['next'] = function (...MM_ARGS) {
            return DELEGATE_DOWNSTREAM(discriminant, UNHANDLED, ...MM_ARGS);
        };
    }

    // TODO: call method...
    result = CALL_METHOD(...MM_ARGS, context);

    // TODO: cascade result...
    if (!ENDS_PARTITION) {
        if (IS_PURE_SYNC) {

            // All methods in this MM are synchronous
            result = DELEGATE_NEXT(discriminant, result, ...MM_ARGS);
        }
        else {
            if (IS_PURE_ASYNC) {

                // All methods in this MM are asynchronous
                result = result.then(rs => DELEGATE_NEXT(discriminant, rs, ...MM_ARGS));
            }
            else {

                // Methods may be sync or async, and we must differentiate at runtime
                if (isPromise(result)) {
                    result = result.then(rs => DELEGATE_NEXT(discriminant, rs, ...MM_ARGS));
                }
                else {
                    result = DELEGATE_NEXT(discriminant, result, ...MM_ARGS);
                }
            }
        }
    }
    return result;
}
