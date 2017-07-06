import createDispatchFunction from './create-dispatch-function';
import MultimethodOptions from './multimethod-options';
import normaliseOptions from './normalise-options';
export default multimethod;





// --------------------------------------------------
export type Captures = {[captureName: string]: string};
export type Methods<TMethod extends Function> = { [predicate: string]: TMethod|TMethod[]; };





export interface Options {
    // check correct number of args passed on every call if not undefined.
    arity?: undefined|1|2|3;
    // Check result if not undefined. For 'never', the result must NOT be a promise. For 'always', the result is wrapped using the global `Promise.resolve`
    async?: undefined|'never'|'always';
    // If not undefined, fails on early detection of discriminants for which there is no best method.
    // TODO: alt names: unambiguous explicit exact definite precise complete whole exhaustive strict
    strict?: undefined|boolean;
    toDiscriminant: Function;
    methods: Methods<Function>;
}
export interface UnaryOptions<T0, TR> extends Options {
    toDiscriminant: (_0: T0) => string;
    methods: Methods<(_0: T0, captures: Captures, next: (_0: T0) => TR) => TR>;
}
export interface BinaryOptions<T0, T1, TR> extends Options {
    toDiscriminant: (_0: T0, _1: T1) => string;
    methods: Methods<(_0: T0, _1: T1, captures: Captures, next: (_0: T0, _1: T1) => TR) => TR>;
}
export interface TernaryOptions<T0, T1, T2, TR> extends Options {
    toDiscriminant: (_0: T0, _1: T1, _2: T2) => string;
    methods: Methods<(_0: T0, _1: T1, _2: T2, captures: Captures, next: (_0: T0, _1: T1, _2: T2) => TR) => TR>;
}
export interface VariadicOptions<T, TR> extends Options {
    toDiscriminant: (...args: T[]) => string;
    methods: Methods<(...args: Array<T|Captures|((...args: T[]) => TR)>) => TR>;
    // TODO: ^--- the `...args` type is best effort, but really needs to be (...args: T[], captures: {[name: string]: string}, next: Next)
}





function multimethod<T0, TR>(options: {arity: 1; async: 'never'} & UnaryOptions<T0, TR>): (_0: T0) => TR;
function multimethod<T0, TR>(options: {arity: 1; async: 'always'} & UnaryOptions<T0, TR | Promise<TR>>): (_0: T0) => Promise<TR>;
function multimethod<T0, TR>(options: {arity: 1; async?: string} & UnaryOptions<T0, TR | Promise<TR>>): (_0: T0) => TR | Promise<TR>;
function multimethod<T0, T1, TR>(options: {arity: 2; async: 'never'} & BinaryOptions<T0, T1, TR>): (_0: T0, _1: T1) => TR;
function multimethod<T0, T1, TR>(options: {arity: 2; async: 'always'} & BinaryOptions<T0, T1, TR | Promise<TR>>): (_0: T0, _1: T1) => Promise<TR>;
function multimethod<T0, T1, TR>(options: {arity: 2; async?: string} & BinaryOptions<T0, T1, TR | Promise<TR>>): (_0: T0, _1: T1) => TR | Promise<TR>;
function multimethod<T0, T1, T2, TR>(options: {arity: 3; async: 'never'} & TernaryOptions<T0, T1, T2, TR>): (_0: T0, _1: T1, _2: T2) => TR;
function multimethod<T0, T1, T2, TR>(options: {arity: 3; async: 'always'} & TernaryOptions<T0, T1, T2, TR | Promise<TR>>): (_0: T0, _1: T1, _2: T2) => Promise<TR>;
function multimethod<T0, T1, T2, TR>(options: {arity: 3; async?: string} & TernaryOptions<T0, T1, T2, TR | Promise<TR>>): (_0: T0, _1: T1, _2: T2) => TR | Promise<TR>;
function multimethod<T, TR>(options: {arity?: number; async: 'never'} & VariadicOptions<T, TR>): (...args: T[]) => TR;
function multimethod<T, TR>(options: {arity?: number; async: 'always'} & VariadicOptions<T, TR | Promise<TR>>): (...args: T[]) => Promise<TR>;
function multimethod<T, TR>(options: {arity?: number; async?: string} & VariadicOptions<T, TR | Promise<TR>>): (...args: T[]) => TR | Promise<TR>;
// ...if the search for a matching overload gets to here, the MM is definitely invalid...
//function multimethod(options: Options): void;
function multimethod(options: Options) {

    // TODO: temp convertion while transitioning options types
    let mmopts: MultimethodOptions = {
        arity: options.arity || 'variadic',
        timing: options.async ? (options.async === 'always' ? 'async' : 'sync') : 'mixed',
        toDiscriminant: options.toDiscriminant,
        methods: options.methods
    };

    // Create a new options object incorporating all defaults.
    let normalisedOptions = normaliseOptions(mmopts);

    // TODO: ...
    let instance: any = createDispatchFunction(normalisedOptions);
    instance._options = normalisedOptions; // TODO: add typing and/or docs for this?
    return instance;
}




// TODO: ...
