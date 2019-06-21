export const CONTINUE = Symbol('CONTINUE') as never; // subtype of all types, so always allowed as method return




export interface MultimethodStatic {

    // Functional-style factory function
    // NB 'never' result: will always throw after construction; no methods yet
    <TParams extends unknown[]>(options?: MultimethodOptions<TParams>): Multimethod<TParams, never>;

    // OO-style class constructor
    // NB 'never' result: will always throw after construction; no methods yet
    new <TParams extends unknown[]>(options?: MultimethodOptions<TParams>): Multimethod<TParams, never>;
}
export interface Multimethod<TParams extends unknown[], TResult> {
    (...args: TParams): TResult;
    extend<TR>(methods: Methods<TParams, TR>): Multimethod<TParams, Result<TResult | TR>>;
    extend<TR>(methods: Methods<TParams, TR | Promise<TR>>): Multimethod<TParams, Result<TResult | TR | Promise<TR>>>;
}
export let Multimethod!: MultimethodStatic; // TODO: initialise this var




export interface AsyncMultimethodStatic {

    // Functional-style factory function
    // NB 'never' result: will always throw after construction; no methods yet
    <TParams extends unknown[]>(options?: MultimethodOptions<TParams>): AsyncMultimethod<TParams, never>;

    // OO-style class constructor
    // NB 'never' result: will always throw after construction; no methods yet
    new <TParams extends unknown[]>(options?: MultimethodOptions<TParams>): AsyncMultimethod<TParams, never>;
}
export interface AsyncMultimethod<TParams extends unknown[], TResult> {
    (...args: TParams): Promise<TResult>;
    extend<TR>(methods: Methods<TParams, TR | Promise<TR>>): AsyncMultimethod<TParams, TResult | TR>;
}
export let AsyncMultimethod!: AsyncMultimethodStatic; // TODO: initialise this var




export type MultimethodOptions<TParams extends unknown[]> =
    | DiscriminatorFunction<TParams>
    | MultimethodOptionsObject<TParams>;

export type MultimethodOptionsObject<TParams extends unknown[]> =
    & {discriminant?: DiscriminatorFunction<TParams> };

export type DiscriminatorFunction<TParams extends unknown[]> = (...args: TParams) => string;



export interface Methods<TParams extends unknown[], TResult> {
    [pattern: string]: (this: MethodContext, ...args: TParams) => TResult;
}




export interface MethodContext {
    captures: { [name: string]: string };
}




/**
 * Type operator that computes the return type of a multimethod, given the
 * union T = T1 | T2 | ... of the return types of the multimethod's methods.
 */
type Result<T> =

    // If none of the TNs are Promise types, then the result is T.
    (T extends Promise<any> ? 1 : never) extends never ? T :

    // If all of the TNs are Promise types, then the result is Promise<T1 | T2 | ...>.
    (T extends Promise<any> ? never : 1) extends never ? Promise<T extends Promise<infer U> ? U : T> :

    // If some TNs are Promise types and some are not, then the result is T1 | T2 | ... | Promise<T1 | T2 | ...>.
    (T extends Promise<infer U> ? U : T) | Promise<T extends Promise<infer U> ? U : T>;








// // TODO: temp testing...
// let mm1 = new Multimethod((a: number, b: string) => `/${a}/${b}`);
// mm1 = mm1.extend({foo: async () => 'foo'});
// let x1a = mm1(1, 'sdsd');


// let mm2 = mm1.extend({
//     '/foo': async () => 'hi',
//     '/bar': async () => CONTINUE,
// });
// let x2a = mm2(3, 'asda');


// let mm3 = mm2.extend({
//     '/foo/*': async () => 'hi hi',
//     '/foo/*/*': () => 'hi hi hi',
//     async '/{**path}'(a, b) { return `/${a}/${b}${this.captures.path}`; },
//     async '/thing/{name}'(a, b) { return CONTINUE; }, // TODO: was... `/${a}/${b}${this.captures.name}`; },
// });
// let x3a = mm3(3, 'asda');


// let mm4a = mm1.extend({foo: () => 'foo'});
// let mm4b = mm1.extend({foo: () => 42});
// let mm4c = mm4a.extend({foo: () => 42});
// let mm4d = mm4c.extend({foo: async () => CONTINUE});
// mm4a = mm4b;
// mm4a = mm4c;
// mm4b = mm4a;
// mm4b = mm4c;
// mm4c = mm4a;
// mm4c = mm4b;
// let x4a = mm4a(42, 'foo');
// let x4b = mm4b(42, 'foo');


// let mm5 = mm2.extend({
//     '/foo': async () => CONTINUE,
//     '/bar': async () => 42,
// });
// let x5a = mm5(3, 'asda');


// let mm6 = mm4b.extend({
//     '/foo': () => CONTINUE,
//     '/bar': () => 'foo',
// });
// let x6a = mm6(3, 'asda');
