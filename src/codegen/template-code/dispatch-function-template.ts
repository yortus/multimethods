import * as fatalError from '../../util/fatal-error';
import Thunk from '../thunk';




// tslint:disable: max-line-length
// tslint:disable: no-shadowed-variable
// tslint:disable: no-var-keyword
// tslint:disable: only-arrow-functions




// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export default function __FUNCNAME__(__ARGS__: any) {
    var args: any;
    var dsc = arguments.length <= $.ARITY ? $.DISCRIMINATOR(__ARGS__) : $.DISCRIMINATOR.apply(null, args = $.COPY_ARRAY(arguments));

    if (typeof dsc === 'string') {
        var res = $.SELECT_THUNK(dsc)(dsc, $.NEXT, __ARGS__, args);
    }
    else {
        var res: any = (dsc as Promise<string>).then(dsc => $.SELECT_THUNK(dsc)(dsc, $.NEXT, __ARGS__, args));
    }

    // Result may be sync or async, and we must differentiate at runtime.
    if ($.IS_PROMISE_LIKE(res)) {
        return res.then(res => res === $.NEXT ? $.ERROR_UNHANDLED(dsc) : res);
    }
    else {
        return res === $.NEXT ? $.ERROR_UNHANDLED(dsc) : res;
    }
}




// TODO: explain...
declare const $: VarsInScope;




// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VarsInScope {
    IS_PROMISE_LIKE: (x: any) => x is Promise<any>;
    NEXT: any;
    ERROR_UNHANDLED: typeof fatalError.UNHANDLED;
    DISCRIMINATOR: (...args: any[]) => string;
    SELECT_THUNK: (discriminant: string) => Thunk;
    ARITY: number;
    COPY_ARRAY: (els: any) => any[];
}
