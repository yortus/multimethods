




// --------------------------------------------------
export type Captures = {[captureName: string]: string};
export type Rules<THandler extends Function> = { [predicate: string]: THandler|THandler[]; };





export interface Options {
    // check correct number of args passed on every call if not undefined.
    arity?: undefined|1|2|3;
    // Check result if not undefined. For 'never', the result must NOT be a promise. For 'always', the result is wrapped using the global `Promise.resolve`
    async?: undefined|'never'|'always';
    // If not undefined, fails on early detection of discriminants for which there is no best handler.
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
export // ...if the search for a matching overload gets to here, the MM is definitely invalid...
function multimethod(options: Options): void;
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










// --------------------------------------------------
type Diff<T extends string, U extends string> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = { [P in Diff<keyof T, K>]: T[P] };
type Overwrite<T, U> = { [P in Diff<keyof T, keyof U>]: T[P] } & U;
type Pick<T, K extends keyof T> = { [P in K]: T[P] };


var rules = {
    toDiscriminant: (_0: string) => `---${_0}---`,
    '/...': _0 => 42,
    '/foo': _0 => 'foo',
    '/bar': _0 => 'baz',
};
// type Rules = {
//     toDiscriminant: (_0: string) => string;
//     '/...': (_0: string) => number;
//     '/foo': (_0: string) => number;
// };





type TwoTypes<KN extends string, VN, KM extends string, VM> = { [K in KN]: VN; } & {[K in KM]: VM; };
//type Rules2 = TwoTypes<'toDiscriminant', (_0: string) => string, '/...'|'/foo'|'/bar', (_0: string) => number>;
//type Rules3<T0> = TwoTypes<'toDiscriminant', (_0: T0) => string, '/...'|'/foo'|'/bar', (_0: T0) => number>;
//type Rules4<T0, TR> = TwoTypes<'toDiscriminant', (_0: T0) => string, '/...'|'/foo'|'/bar', (_0: T0) => TR>;
//type Rules5<T0, TR, U extends string> = TwoTypes<'toDiscriminant', (_0: T0) => string, U, (_0: T0) => TR>;
//type Rules6<T0, TR, U extends string> = TwoTypes<'toDiscriminant', (_0: T0) => string, Diff<U, 'toDiscriminant'>, (_0: T0) => TR>;


//declare function fuuu<T0, TR>(r: Rules5<T0, TR, '/...'|'/foo'|'/bar'>): any;
//declare function fuuu<T0, TR, U>(r: {[K in 'toDiscriminant'|'/...'|'/foo'|'/bar']: Rules5<T0, TR, '/...'|'/foo'|'/bar'>[K]}): U;
//declare function fuuu<T0, TR, U>(r: U & {[K in 'toDiscriminant'|'/...'|'/foo'|'/bar']: Rules5<T0, TR, '/...'|'/foo'|'/bar'>[K]}): U;
//declare function fuuu<T0, TR, U>(r: U & {[K in 'toDiscriminant'|'/...'|'/foo'|'/bar']: Rules6<T0, TR, 'toDiscriminant'|'/...'|'/foo'|'/bar'>[K]}): U;
//declare function fuuu<T0, TR, U, V extends keyof U>(r: U & Rules6<T0, TR, 'toDiscriminant'|'/...'|'/foo'|'/bar'>): U;
//declare function fuuu<T0, TR, U, V extends 'toDiscriminant'|'/...'|'/foo'|'/bar'>(r: U & Rules6<T0, TR, V>): U;
//declare function fuuu<T0, TR, U extends 'toDiscriminant'|'/...'|'/foo'|'/bar'>(r: {[K in U]: {}} & Rules6<T0, TR, U>): U;
//declare function fuuu<T0, TR, U extends string>(r: {[K in U]: {}} & Rules6<T0, TR, U>): U;

// declare function fuuu<T0, TR, U>(r:
//     U
//   &
//     {[K1 in 'toDiscriminant']: (_0: T0) => string}
//   &
//     {[K2 in '/...'|'/foo'|'/bar']: (_0: T0) => TR}
// ): U;

// declare function fuuu<T0, TR, U>(r:
//     Obj<U>
//   &
//     {[K1 in 'toDiscriminant']: (_0: T0) => string}
//   &
//     {[K2 in '/...'|'/foo'|'/bar']: (_0: T0) => TR}
// ): U;

// declare function fuuu<K extends keyof T, T, T0, TR>(r:
//     Record<K, T>
//   &
//     {[K1 in 'toDiscriminant']: (_0: T0) => string}
//   &
//     {[K2 in Diff<K, 'toDiscriminant'>]: (_0: T0) => TR}
// ): U;

// type Record<K extends keyof T, T> = { [P in K]: T[P]; };

//declare function fuuu<T0, TR, T>(r: T & {[P in DiscProp<keyof T>]: (_0: T0) => string }   &   {[P in OtherProps<keyof T>]: (_0: T0) => TR }): any;
type DiscProp<T extends string> = ({[P in 'toDiscriminant']: 'toDiscriminant'}   &   {[x: string]: never})   [T];
type OtherProps<T extends string> = ({[P in T]: P}   &   {[P in 'toDiscriminant']: never}   &   {[x: string]: never})   [T];
type T98 = DiscProp<keyof Rules>;
type T99 = OtherProps<keyof Rules>;


//type Part1<T0, K extends string> = { [P in K]: ({toDiscriminant: (_0: T0) => string} & { [x: string]: any })[P] };
//type Part2<T0, TR, K extends string> = { [P in K]: ({ [x: string]: (_0: T0) => TR } & { toDiscriminant: any })[P] };


type Part1<T0> = {toDiscriminant: (_0: T0) => string; [x: string]: any};
type Part2<K extends string, T0> = { [P in K]: (_0: T0) => any };
//declare function fuuu<K extends string, T0>(r: {[P in K]: any} & Part1<T0> ): any;
//declare function fuuu<K extends string, T0>(r: {[P in K]: any} & Part1<T0> & Part2<Diff<K, 'toDiscriminant'>, T0> ): any;
//declare function fuuu<U, T0>(r: U & {[P in keyof U]: U[P]} & Part1<T0> & Part2<Diff<keyof U, 'toDiscriminant'>, T0> ): any;
//declare function fuuu<K extends string, T0>(r: {[P in K]: any} & Part1<T0> & Part2<Diff<K, 'toDiscriminant'>, T0> ): any;


//declare function fuuu<K extends string, T0>(r: {toDiscriminant: (_0: T0) => any} & {[P in K]: (_0: T0) => any }): any;
//declare function fuuu<K extends string, T0>(r: {toDiscriminant: (_0: T0) => any; [s: string]: any} ): any;
//declare function fuuu<K extends string, T0>(r: {toDiscriminant: (_0: T0) => any; [s: string]: any} & {[s: string]: (_0: T0) => any}): any;
//declare function fuuu<T0, TR>(r: {[s: string]: (_0: T0) => TR | string}): any;




//type TwoTypes2<T0, KM extends string, VM> = { toDiscriminant: (_0: T0) => string; [x: string]: any; } & {[K in KM]: VM; };
//type Rules7<T0, TR, U extends string> = TwoTypes2<T0, Diff<U, 'toDiscriminant'>, (_0: T0) => TR>;
//declare function fuuu<T0, TR, U, V extends 'toDiscriminant'|'/...'|'/foo'|'/bar'>(r: U & Rules6<T0, TR, V>): U;
//declare function fuuu<T0, TR, U, V extends keyof U>(r: U & Rules7<T0, TR, V>): U;


//declare function fuuu<T0, U extends {toDiscriminant: UnaryFunc<T0, string>; [x: string]: UnaryFunc<T0, any>}>(r: U): any;
//declare function unarymm<T0, TR>(r: {toDiscriminant: (_0: T0) => any; [x: string]: (_0: T0) => TR | string }): any;
declare function unarymm<T0, TR, K extends string = string>(r:
    { toDiscriminant: (_0: T0) => any; [x: string]: any }
&
    { [P in OtherProps<K>]: (_0: T0) => any }
): any;

// Fails but does infer T0/TR types:
//declare function fuuu<K extends string, T0, TR>(r:{toDiscriminant: UnaryFunc<T0, any>; [x: string]: UnaryFunc<T0, TR>}): any;

// declare function fuuu<K extends string, T0, TR>(r:
//     {toDiscriminant: UnaryFunc<T0, any>; [x: string]: any}
// &
//     {[P in Diff<K, 'toDiscriminant'>]: UnaryFunc<T0, TR> }
// ): any;





let fu1 = unarymm<boolean, number>({
    toDiscriminant: (_0: boolean) => `---${_0}---`,
    '/...': _0 => 42,
    '/foo': _0 => 1,
    '/bar': _0 => 2,
});


type T100 = Pick<typeof rules, 'toDiscriminant'>;
type T101 = Omit<typeof rules, 'toDiscriminant'>;




//declare function yyy(rules: Rules): Omit<Rules, 'toDiscriminant'>;
//declare function yyy<T0, U, V extends Diff<keyof U, 'toDiscriminant'>>(rules: U & {toDiscriminant: (_0: T0) => string}): { [P in V]: U[P] }
//declare function yyy<T0, U, V extends Diff<keyof U, 'toDiscriminant'>>(rules: U & {toDiscriminant: (_0: T0) => string} & {[P in V]: U[P]}): {(_0: T0): any}

//declare function yyy<T0, U extends {}>(rules: U): {(_0: T0): any}
declare function yyy<T0, U extends {toDiscriminant: (_0: T0) => string; [key: string]: any;}>(rules: U): {(_0: T0): any}
//declare function yyy<T0, U extends {toDiscriminant: (_0: T0) => string}, V extends Diff<keyof U, 'toDiscriminant'>>(rules: U): {(_0: T0): any}


let yy1 = yyy({
    toDiscriminant: (_0: string) => `---${_0}---`,
    '/...': _0 => 42,
    '/foo': _0 => 'foo',
    '/bar': _0 => 'baz',
});





type T1 = Diff<"a" | "b" | "c", "c" | "d">;  // "a" | "b"

type Item1 = { a: string, b: number, c: boolean };
type Item2 = { a: number };

type T2 = Omit<Item1, "a"> // { b: number, c: boolean };
type T3 = Overwrite<Item1, Item2> // { a: number, b: number, c: boolean };





declare function f<T0, TR, U, K extends keyof U>(rules: /*{ toDiscriminant(_0: T0): string; } &*/ U /*& Omit<U, 'toDiscriminant'>*/): { (_0: T0): TR; };


let rr = f({
    toDiscriminant: (_0: string) => `---${_0}---`,
    '/...': _0 => '42'
});





// type RuleSet2<T> = { [predicate: string]: T|T[]; };
// type UnaryMultimethodOptions<T, T0, TR> = {toDiscriminant: (_0: T0) => string} & {rules: RuleSet2<UnaryMethod<T0, TR>>}
// declare function foo<T, T0, TR>(options: T & UnaryMultimethodOptions<T, T0, TR>): [T0, TR];
// let f1 = foo({
//     toDiscriminant: (_0: string) => `---${_0}---`,
//     rules: {
//         '/...': _0 => 42,
//     }
// });








//      T|never = T      T&never = never





// declare function foobar<T, T0, TR>(r:
//     T
// &
//     {toDiscriminant: UnaryFunc<T0, string>; [x: string]: any; }
// &
//     { [P in Diff<keyof T, 'toDiscriminant'>]: UnaryFunc<T0, TR> }
// ): [keyof T, T0, TR];

// let fb1 = foobar({
//     toDiscriminant: (_0: string) => `---${_0}---`,
//     '/...': (_0: string) => 42,
// });




