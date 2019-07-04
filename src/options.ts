import {Unreachable} from './math/predicates';





// TODO: doc...
export interface Options {

    // TODO: doc...
    name?: string;

    // TODO: doc... check correct number of args passed on every call if not undefined.
    // TODO: validate integer >= 1 and less than something?
    // TODO: doc perf and signature differences of variadic vs fixed arity...
    arity?: number;

    // TODO: doc... determines special treatment of multimethod's returned values. Tristate:
    // - true: ensures mm always returns a promise, wrapping the result if necessary.
    //         - TODO: doc reliance on availability of global Promise.resolve if this option is `true`
    // - false: ensures mm always returns a value synchronously (ie never a promise). Throws if necessary
    //         - TODO: is this actually implemented? Additional strict mode checks - eg check it in every thunk?
    // - undefined: mm may return either a Promise or a value, and methods may return promises or values.
    async?: boolean;

    // TODO: doc... If not undefined, fails on early detection of discriminants for which there is no best method.
    // TODO: alt names: unambiguous explicit exact definite precise complete whole exhaustive strict
    // TODO: code up additional strict mode checks in thunks for what methods return when async='always|never'
    strict?: boolean;

    discriminator?: Function;

    // TODO: doc... this is the Method Table...
    methods?: {
        [predicate: string]: Function|Function[];
    };

    // TODO: doc... advanced option...
    unreachable?: Unreachable;



    // TODO: temp testing...
    unhandled?: (discriminant: string) => unknown;
}
