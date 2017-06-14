import RouteExecutor from './route-executor';





// TODO: how to ensure this is defined? Just doc?
let isPromise: (x: any) => boolean;





// TODO: explain each of these in turn...
let FALLBACK: any;
let IS_TRACING: boolean;
let TRACE_LABEL: string;
let ENDS_PARTITION: boolean;
let HAS_CAPTURES: boolean;
let IS_META_RULE: boolean;
let IS_PURE_SYNC: boolean;
let IS_PURE_ASYNC: boolean;
let HAS_DOWNSTREAM: boolean;
let DELEGATE_DOWNSTREAM: RouteExecutor;
let DELEGATE_NEXT: RouteExecutor;
let GET_CAPTURES: (discriminant: string) => {};
let CALL_METHOD: (...args: any[]) => any; // Method signature, NB: context is passed last!


// TODO: explain important norms in the template function...
// TODO: don't need to dedent any more!
// TODO: put more explanatory comments inside, and strip them out to maximise inlining potential
export default function METHOD_NAME(discriminant: string, result: any, ELLIPSIS_MMARGS: any[]) {

    // TODO: explain why result is passed in and checked here (hint: unified code for sync/async handling)
    if (result !== FALLBACK) {
        return result;
    }

    // TODO: trace...
    if (IS_TRACING) {
        if (IS_META_RULE) {
            console.log(`==> Enter '${TRACE_LABEL}' [METARULE]`);
        }
        else {
            console.log(`==> Enter '${TRACE_LABEL}'`);
        }
    }

    // TODO: call method in most efficient way...
    if (IS_META_RULE) {
        if (HAS_DOWNSTREAM) {
            var next: Function = function (ELLIPSIS_MMARGS: any[]) {
                return DELEGATE_DOWNSTREAM(discriminant, FALLBACK, ELLIPSIS_MMARGS);
            };
        }
        else {
            var next: Function = function () { return FALLBACK; };
        }
        if (HAS_CAPTURES) {
            var captures = GET_CAPTURES(discriminant);

            // TODO: trace...
            if (IS_TRACING) {
                console.log(`      Captures: ${JSON.stringify(captures)}`);
            }
            
            result = CALL_METHOD(ELLIPSIS_MMARGS, captures, next);
        }
        else {
            result = CALL_METHOD(ELLIPSIS_MMARGS, undefined, next);
        }
    }
    else {
        if (HAS_CAPTURES) {
            var captures = GET_CAPTURES(discriminant);

            // TODO: trace...
            if (IS_TRACING) {
                console.log(`      Captures: ${JSON.stringify(captures)}`);
            }

            result = CALL_METHOD(ELLIPSIS_MMARGS, captures);
        }
        else {
            result = CALL_METHOD(ELLIPSIS_MMARGS);
        }
    }

    // TODO: trace...
    if (IS_TRACING) {
        if (isPromise(result)) {
            result = result.then(function (rs: any) {
                console.log(`==> Leave '${TRACE_LABEL}'`);
                console.log(`      Handled? ${rs === FALLBACK ? ' NO' : `YES, type is ${typeof rs}]`}`);
                return rs;
            });
        }
        else {
            console.log(`==> Leave '${TRACE_LABEL}'`);
            console.log(`      Handled? ${result === FALLBACK ? ' NO' : `YES, type is ${typeof result}]`}`);
        }
    }

    // TODO: cascade result...
    if (!ENDS_PARTITION) {
        if (IS_PURE_SYNC) {

            // All methods in this MM are synchronous
            result = DELEGATE_NEXT(discriminant, result, ELLIPSIS_MMARGS);
        }
        else {
            if (IS_PURE_ASYNC) {

                // All methods in this MM are asynchronous
                result = result.then(function (rs: any) { return DELEGATE_NEXT(discriminant, rs, ELLIPSIS_MMARGS); });
            }
            else {

                // Methods may be sync or async, and we must differentiate at runtime
                if (isPromise(result)) {
                    result = result.then(function (rs: any) { return DELEGATE_NEXT(discriminant, rs, ELLIPSIS_MMARGS); });
                }
                else {
                    result = DELEGATE_NEXT(discriminant, result, ELLIPSIS_MMARGS);
                }
            }
        }
    }
    return result;
}
