import {Options} from './options';




export interface MultimethodConstructor {
    // Functional-style factory function
    // NB 'never' result: will always throw after construction; no methods yet
    <P extends unknown[]>(options: Options<P, Awaitable<string>>): Multimethod<P>;
    <P extends unknown[]>(options: Options<P, Promise<string>>): AsyncMultimethod<P>;

    // OO-style class constructor
    // NB 'never' result: will always throw after construction; no methods yet
    new <P extends unknown[]>(options: Options<P, Awaitable<string>>): Multimethod<P>;
    new <P extends unknown[]>(options: Options<P, Promise<string>>): AsyncMultimethod<P>;
}




export interface Multimethod<P extends unknown[] = unknown[], R = never> {
    (...args: P): R;
    extend<MR>(methods: Methods<P, MR, 'super'>): Multimethod<P, Result<R | MR>>;
    extend<MR>(methods: Methods<P, Awaitable<MR>, 'super'>): Multimethod<P, Result<R | MR | Promise<MR>>>;
    decorate(decorators: Decorators<P, R, 'super'>): Multimethod<P, R>;

}




export interface AsyncMultimethod<P extends unknown[] = unknown[], R = never> {
    (...args: P): Promise<R>;
    extend<MR>(methods: Methods<P, Awaitable<MR>, 'super'>): AsyncMultimethod<P, R | MR>;
    decorate(decorators: Decorators<P, Awaitable<R>, 'super'>): AsyncMultimethod<P, R>;
}




export type Methods<P extends unknown[] = unknown[], R = unknown, Super extends 'super' = never>
    = Record<string, Method<P, R> | Array<Method<P, R> | Super>>;
export type Method<P extends unknown[] = unknown[], R = unknown>
    = (bindings: PatternBindings, ...args: P) => R;
export type Decorators<P extends unknown[] = unknown[], R = unknown, Super extends 'super' = never>
    = Record<string, Decorator<P, R> | Array<Decorator<P, R> | Super>>;
export type Decorator<P extends unknown[] = unknown[], R = unknown>
    = (bindings: PatternBindings, method: (...args: P) => R, args: P) => R;
export type PatternBindings = { [name in string]?: string };




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




type Awaitable<T> = T | Promise<T>;
