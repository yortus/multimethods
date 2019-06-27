export interface MultimethodStatic {

    // Functional-style factory function
    // NB 'never' result: will always throw after construction; no methods yet
    <P extends unknown[]>(options: Options<P, string>): Multimethod<P, never>;
    <P extends unknown[]>(options: Options<P, Promise<string>>): AsyncMultimethod<P, never>;

    // OO-style class constructor
    // NB 'never' result: will always throw after construction; no methods yet
    new <P extends unknown[]>(options: Options<P, string>): Multimethod<P, never>;
    new <P extends unknown[]>(options: Options<P, Promise<string>>): AsyncMultimethod<P, never>;
}

export let Multimethod!: MultimethodStatic; // TODO: initialise this var

export interface Multimethod<P extends unknown[], R> {
    (...args: P): R;
    extend<MR>(methods: MethodsObject<P, MR>): Multimethod<P, Result<R | MR>>;
    extend<MR>(methods: MethodsObject<P, MR | Promise<MR>>): Multimethod<P, Result<R | MR | Promise<MR>>>;
    decorate(decorators: MethodsObject<P, R>): Multimethod<P, R>;
}

export interface AsyncMultimethod<P extends unknown[], R> {
    (...args: P): Promise<R>;
    extend<MR>(methods: MethodsObject<P, MR | Promise<MR>>): AsyncMultimethod<P, R | MR>;
    decorate(decorators: MethodsObject<P, R | Promise<R>>): AsyncMultimethod<P, R>;
}




export type Options<P extends unknown[], D extends string | Promise<string>> =
    | DiscriminatorFunction<P, D>
    | OptionsObject<P, D>;

export interface OptionsObject<P extends unknown[], D extends string | Promise<string>> {
    discriminator: DiscriminatorFunction<P, D>;
    unhandled?: (discriminant: string) => unknown;
}

export type DiscriminatorFunction<P extends unknown[], D extends string | Promise<string>> = (...args: P) => D;




export interface MethodsObject<P extends unknown[], R> {
    [pattern: string]: Method<P, R> | Array<Method<P, R> | 'super'>;
}

export type Method<P extends unknown[], R> = (this: Context<P, R>, ...args: P) => R;

export interface Context<P extends unknown[], R> {
    pattern: { [bindingName: string]: string };
    inner: (...args: P) => R;
    outer: () => R;
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
//     '/bar': async () => next,
//     '/baz': () => 'baz',
// });
// let mm2b = mm2.decorate({
//     '**': (method, args) => 'asd' || method(...args),
// });
// let x2a = mm2(3, 'asda');


// let mm3 = mm2.extend({
//     '/foo/*': async () => 'hi hi',
//     '/foo/*/*': [() => 'hi hi hi'],
//     async '/{**path}'(a, b) { return `/${a}/${b}${this.pattern.path}`; },
//     async '/thing/{name}'(a, b) { return next; }, // TODO: was... `/${a}/${b}${this.captures.name}`; },
// });
// let x3a = mm3(3, 'asda');


// let mm4a = mm1.extend({foo: () => 'foo'});
// let mm4b = mm1.extend({foo: () => 42});
// let mm4c = mm4a.extend({foo: () => 42});
// let mm4d = mm4c.extend({foo: async () => next});
// mm4a = mm4b;
// mm4a = mm4c;
// mm4b = mm4a;
// mm4b = mm4c;
// mm4c = mm4a;
// mm4c = mm4b;
// let x4a = mm4a(42, 'foo');
// let x4b = mm4b(42, 'foo');


// let mm5 = mm2.extend({
//     '/foo': async () => next,
//     '/bar': async () => 42,
// });
// let x5a = mm5(3, 'asda');


// let mm6 = mm4b.extend({
//     '/foo': () => next,
//     '/bar': () => 'foo',
// });
// let x6a = mm6(3, 'asda');


// let mm7 = new Multimethod();
// let x7a = mm7.extend({foo: [
//     (a, b) => 'bar',
//     (a, b) => 'baz',
//     'super',
// ]})();


// let mm8a = new Multimethod(async (a: number, b: string) => `/${a}/${b}`);
// let mm8b = mm8a.extend({'/foo/*': () => 'foo'});
// let mm8c = mm8a.extend({'/bar/*': () => 'bar'}).decorate({'**': () => 'foo'});
// let x8b1 = mm8b(1, 'sdsd');
