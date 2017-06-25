




// --------------------------------------------------
export type Captures = {[captureName: string]: string};
export type Rules<THandler extends Function> = { [predicate: string]: THandler|THandler[]; };





export interface Options {
    // check correct number of args passed on every call if not undefined.
    arity?: undefined|1|2|3;
    // Check result if not undefined. For 'never', the result must NOT be a promise. For 'always', the result is wrapped using the global `Promise.resolve`
    async?: undefined|'never'|'always';
    // If not undefined, fails on early detection of discriminants for which there is no best handler.
    // TODO: alt names: unambiguous explicit exact definite precise complete whole exhaustive strict
    strict?: undefined|boolean;
    toDiscriminant: Function;
    rules: Rules<Function>;
}
export interface UnaryOptions<T0, TR> extends Options {
    toDiscriminant: (_0: T0) => string;
    rules: Rules<(_0: T0, captures: Captures, next: (_0: T0) => TR) => TR>;
}
export interface BinaryOptions<T0, T1, TR> extends Options {
    toDiscriminant: (_0: T0, _1: T1) => string;
    rules: Rules<(_0: T0, _1: T1, captures: Captures, next: (_0: T0, _1: T1) => TR) => TR>;
}
export interface TernaryOptions<T0, T1, T2, TR> extends Options {
    toDiscriminant: (_0: T0, _1: T1, _2: T2) => string;
    rules: Rules<(_0: T0, _1: T1, _2: T2, captures: Captures, next: (_0: T0, _1: T1, _2: T2) => TR) => TR>;
}
export interface VariadicOptions<T, TR> extends Options {
    toDiscriminant: (...args: T[]) => string;
    rules: Rules<(...args: Array<T|Captures|((...args: T[]) => TR)>) => TR>;
    // TODO: ^--- the `...args` type is best effort, but really needs to be (...args: T[], captures: {[name: string]: string}, next: Next)
}





export function multimethod<T0, TR>(options: {arity: 1; async: 'never'} & UnaryOptions<T0, TR>): (_0: T0) => TR;
export function multimethod<T0, TR>(options: {arity: 1; async: 'always'} & UnaryOptions<T0, TR | Promise<TR>>): (_0: T0) => Promise<TR>;
export function multimethod<T0, TR>(options: {arity: 1; async?: undefined} & UnaryOptions<T0, TR | Promise<TR>>): (_0: T0) => TR | Promise<TR>;
export function multimethod<T0, T1, TR>(options: {arity: 2; async: 'never'} & BinaryOptions<T0, T1, TR>): (_0: T0, _1: T1) => TR;
export function multimethod<T0, T1, TR>(options: {arity: 2; async: 'always'} & BinaryOptions<T0, T1, TR | Promise<TR>>): (_0: T0, _1: T1) => Promise<TR>;
export function multimethod<T0, T1, TR>(options: {arity: 2; async?: undefined} & BinaryOptions<T0, T1, TR | Promise<TR>>): (_0: T0, _1: T1) => TR | Promise<TR>;
export function multimethod<T0, T1, T2, TR>(options: {arity: 3; async: 'never'} & TernaryOptions<T0, T1, T2, TR>): (_0: T0, _1: T1, _2: T2) => TR;
export function multimethod<T0, T1, T2, TR>(options: {arity: 3; async: 'always'} & TernaryOptions<T0, T1, T2, TR | Promise<TR>>): (_0: T0, _1: T1, _2: T2) => Promise<TR>;
export function multimethod<T0, T1, T2, TR>(options: {arity: 3; async?: undefined} & TernaryOptions<T0, T1, T2, TR | Promise<TR>>): (_0: T0, _1: T1, _2: T2) => TR | Promise<TR>;
export function multimethod<T, TR>(options: {arity?: undefined; async: 'never'} & VariadicOptions<T, TR>): (...args: T[]) => TR;
export function multimethod<T, TR>(options: {arity?: undefined; async: 'always'} & VariadicOptions<T, TR | Promise<TR>>): (...args: T[]) => Promise<TR>;
export function multimethod<T, TR>(options: {arity?: undefined; async?: undefined} & VariadicOptions<T, TR | Promise<TR>>): (...args: T[]) => TR | Promise<TR>;
// ...if the search for a matching overload gets to here, the MM is definitely invalid...
export function multimethod(options: Options): void;
export function multimethod(_options: Options) {
    return null as any;
}





var mm = multimethod({
    arity: 2,
    async: 'always',
    strict: true,           // ALT: unambiguous explicit exact definite precise complete whole exhaustive strict

    toDiscriminant: (_0: string) => `---${_0}---`,
    rules: {
        '/...': _0 => 42,
        '/foo': async (_0, _1) => 42,
    }
});

mm('foo', 'bar');
