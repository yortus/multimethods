// TODO: where to put the following note?
// NB: Multimethod classes are defined as decomposed static-side and instance-side interfaces. They are defined
//     this way to achieve type-parameterization in the constructor (class decls don't allow this, see TS #10860).
import createMultimethod from './impl/create-multimethod';
import MultimethodOptions from './multimethod-options';
import {MultimethodError} from '../util';





// TODO: Base case...
// TODO: could this be more DRYly represented as an intersection of the other cases?
export interface MultimethodConstructor {
    new<TR>(options: {arity: 0, timing?: 'mixed'} & NullaryMultimethodOptions<TR | Promise<TR>>): NullaryMultimethod<TR | Promise<TR>>;
    new<TR>(options: {arity: 0, timing?: 'async'} & NullaryMultimethodOptions<Promise<TR>>): NullaryMultimethod<Promise<TR>>;
    new<TR>(options: {arity: 0, timing?: 'sync'} & NullaryMultimethodOptions<TR>): NullaryMultimethod<TR>;
    new<T0, TR>(options: {arity: 1, timing?: 'mixed'} & UnaryMultimethodOptions<T0, TR | Promise<TR>>): UnaryMultimethod<T0, TR | Promise<TR>>;
    new<T0, TR>(options: {arity: 1, timing?: 'async'} & UnaryMultimethodOptions<T0, Promise<TR>>): UnaryMultimethod<T0, Promise<TR>>;
    new<T0, TR>(options: {arity: 1, timing?: 'sync'} & UnaryMultimethodOptions<T0, TR>): UnaryMultimethod<T0, TR>;
    new<T0, T1, TR>(options: {arity: 2, timing?: 'mixed'} & BinaryMultimethodOptions<T0, T1, TR | Promise<TR>>): BinaryMultimethod<T0, T1, TR | Promise<TR>>;
    new<T0, T1, TR>(options: {arity: 2, timing?: 'async'} & BinaryMultimethodOptions<T0, T1, Promise<TR>>): BinaryMultimethod<T0, T1, Promise<TR>>;
    new<T0, T1, TR>(options: {arity: 2, timing?: 'sync'} & BinaryMultimethodOptions<T0, T1, TR>): BinaryMultimethod<T0, T1, TR>;
    new<T0, T1, T2, TR>(options: {arity: 3, timing?: 'mixed'} & TernaryMultimethodOptions<T0, T1, T2, TR | Promise<TR>>): TernaryMultimethod<T0, T1, T2, TR | Promise<TR>>;
    new<T0, T1, T2, TR>(options: {arity: 3, timing?: 'async'} & TernaryMultimethodOptions<T0, T1, T2, Promise<TR>>): TernaryMultimethod<T0, T1, T2, Promise<TR>>;
    new<T0, T1, T2, TR>(options: {arity: 3, timing?: 'sync'} & TernaryMultimethodOptions<T0, T1, T2, TR>): TernaryMultimethod<T0, T1, T2, TR>;
    new<T, TR>(options: {arity?: never, timing?: 'mixed'} & VariadicMultimethodOptions<T, TR | Promise<TR>>): VariadicMultimethod<T, TR | Promise<TR>>;
    new<T, TR>(options: {arity?: never, timing?: 'async'} & VariadicMultimethodOptions<T, Promise<TR>>): VariadicMultimethod<T, Promise<TR>>;
    new<T, TR>(options: {arity?: never, timing?: 'sync'} & VariadicMultimethodOptions<T, TR>): VariadicMultimethod<T, TR>;
    new(options?: MultimethodOptions): Multimethod;
}
export const Multimethod: MultimethodConstructor = createMultimethodClass(undefined);
export interface Multimethod extends Function {
    add(rules: {[predicate: string]: Function}): this;
    add(predicate: string, method: Function): this;
}
export default Multimethod;





// TODO: Nullary case...
export interface NullaryMultimethodConstructor {
    new<TR>(options: NullaryMultimethodOptions<TR | Promise<TR>> & {timing?: 'mixed'}): NullaryMultimethod<TR | Promise<TR>>;
    new<TR>(options: NullaryMultimethodOptions<Promise<TR>> & {timing?: 'async'}): NullaryMultimethod<Promise<TR>>;
    new<TR>(options: NullaryMultimethodOptions<TR> & {timing?: 'sync'}): NullaryMultimethod<TR>;
    new(): NullaryMultimethod<any>;
}
export interface NullaryMultimethod<TR> extends Multimethod {
    (): TR;
    add(rules: {[predicate: string]: NullaryMethod<TR>}): this;
    add(predicate: string, method: NullaryMethod<TR>): this;
}
export const NullaryMultimethod = <NullaryMultimethodConstructor> class NullaryMultimethod extends createMultimethodClass(0) { };
export interface NullaryMultimethodOptions<TR> extends MultimethodOptions {
    arity?: 0;
    toDiscriminant?: () => string;
    rules?: {[predicate: string]: NullaryMethod<TR>};
}
export interface NullaryMethod<TR> {
    (ctx: Context): TR;
}





// TODO: Unary case...
export interface UnaryMultimethodConstructor {
    new<T0, TR>(options: UnaryMultimethodOptions<T0, TR | Promise<TR>> & {timing?: 'mixed'}): UnaryMultimethod<T0, TR | Promise<TR>>;
    new<T0, TR>(options: UnaryMultimethodOptions<T0, Promise<TR>> & {timing?: 'async'}): UnaryMultimethod<T0, Promise<TR>>;
    new<T0, TR>(options: UnaryMultimethodOptions<T0, TR> & {timing?: 'sync'}): UnaryMultimethod<T0, TR>;
    new(): UnaryMultimethod<any, any>;
}
export interface UnaryMultimethod<T0, TR> extends Multimethod {
    ($0: T0): TR;
    add(rules: {[predicate: string]: UnaryMethod<T0, TR>}): this;
    add(predicate: string, method: UnaryMethod<T0, TR>): this;
}
export const UnaryMultimethod = <UnaryMultimethodConstructor> class UnaryMultimethod extends createMultimethodClass(1) { };
export interface UnaryMultimethodOptions<T0, TR> extends MultimethodOptions {
    arity?: 1;
    toDiscriminant?: ($0: T0) => string;
    rules?: {[predicate: string]: UnaryMethod<T0, TR>};
}
export interface UnaryMethod<T0, TR> {
    (ctx: Context, $0: T0): TR;
}





// TODO: Binary case...
export interface BinaryMultimethodConstructor {
    new<T0, T1, TR>(options: BinaryMultimethodOptions<T0, T1, TR | Promise<TR>> & {timing?: 'mixed'}): BinaryMultimethod<T0, T1, TR | Promise<TR>>;
    new<T0, T1, TR>(options: BinaryMultimethodOptions<T0, T1, Promise<TR>> & {timing?: 'async'}): BinaryMultimethod<T0, T1, Promise<TR>>;
    new<T0, T1, TR>(options: BinaryMultimethodOptions<T0, T1, TR> & {timing?: 'sync'}): BinaryMultimethod<T0, T1, TR>;
    new(): BinaryMultimethod<any, any, any>;
}
export interface BinaryMultimethod<T0, T1, TR> extends Multimethod {
    ($0: T0, $1: T1): TR;
    add(rules: {[predicate: string]: BinaryMethod<T0, T1, TR>}): this;
    add(predicate: string, method: BinaryMethod<T0, T1, TR>): this;
}
export const BinaryMultimethod = <BinaryMultimethodConstructor> class BinaryMultimethod extends createMultimethodClass(2) { };
export interface BinaryMultimethodOptions<T0, T1, TR> extends MultimethodOptions {
    arity?: 2;
    toDiscriminant?: ($0: T0, $1: T1) => string;
    rules?: {[predicate: string]: BinaryMethod<T0, T1, TR>};
}
export interface BinaryMethod<T0, T1, TR> {
    (ctx: Context, $0: T0, $1: T1): TR;
}





// TODO: Ternary case...
export interface TernaryMultimethodConstructor {
    new<T0, T1, T2, TR>(options: TernaryMultimethodOptions<T0, T1, T2, TR | Promise<TR>> & {timing?: 'mixed'}): TernaryMultimethod<T0, T1, T2, TR | Promise<TR>>;
    new<T0, T1, T2, TR>(options: TernaryMultimethodOptions<T0, T1, T2, Promise<TR>> & {timing?: 'async'}): TernaryMultimethod<T0, T1, T2, Promise<TR>>;
    new<T0, T1, T2, TR>(options: TernaryMultimethodOptions<T0, T1, T2, TR> & {timing?: 'sync'}): TernaryMultimethod<T0, T1, T2, TR>;
    new(): TernaryMultimethod<any, any, any, any>;
}
export interface TernaryMultimethod<T0, T1, T2, TR> extends Multimethod {
    ($0: T0, $1: T1, $2: T2): TR;
    add(rules: {[predicate: string]: TernaryMethod<T0, T1, T2, TR>}): this;
    add(predicate: string, method: TernaryMethod<T0, T1, T2, TR>): this;
}
export const TernaryMultimethod = <TernaryMultimethodConstructor> class TernaryMultimethod extends createMultimethodClass(3) { };
export interface TernaryMultimethodOptions<T0, T1, T2, TR> extends MultimethodOptions {
    arity?: 3;
    toDiscriminant?: ($0: T0, $1: T1, $2: T2) => string;
    rules?: {[predicate: string]: TernaryMethod<T0, T1, T2, TR>};
}
export interface TernaryMethod<T0, T1, T2, TR> {
    (ctx: Context, $0: T0, $1: T1, $2: T2): TR;
}





// TODO: Variadic case...
export interface VariadicMultimethodConstructor {
    new<T, TR>(options: VariadicMultimethodOptions<T, TR | Promise<TR>> & {timing?: 'mixed'}): VariadicMultimethod<T, TR | Promise<TR>>;
    new<T, TR>(options: VariadicMultimethodOptions<T, Promise<TR>> & {timing?: 'async'}): VariadicMultimethod<T, Promise<TR>>;
    new<T, TR>(options: VariadicMultimethodOptions<T, TR> & {timing?: 'sync'}): VariadicMultimethod<T, TR>;
    new(): VariadicMultimethod<any, any>;
}
export interface VariadicMultimethod<T, TR> extends Multimethod {
    (...args: T[]): TR;
    add(rules: {[predicate: string]: VariadicMethod<T, TR>}): this;
    add(predicate: string, method: VariadicMethod<T, TR>): this;
}
export const VariadicMultimethod = <VariadicMultimethodConstructor> class VariadicMultimethod extends createMultimethodClass() { };
export interface VariadicMultimethodOptions<T, TR> extends MultimethodOptions {
    arity?: never;
    toDiscriminant?: (...args: T[]) => string;
    rules?: {[predicate: string]: VariadicMethod<T, TR>};
}
export interface VariadicMethod<T, TR> {
    (ctx: Context, ...args: T[]): TR;
}





// TODO: ...
function createMultimethodClass(staticArity?: number): MultimethodConstructor {

    return <any> class Multimethod {
        constructor(options?: MultimethodOptions) {
            options = options || {};

            // If *both* arities given, they must match
            if (typeof staticArity === 'number' && typeof options.arity === 'number' && staticArity !== options.arity) {
                throw new MultimethodError(`arity mismatch`); // TODO: improve diagnostic message
            }

            // Create a new options object incorporating all defaults (including staticArity)
            // TODO: other defaults?
            options = Object.assign({}, options);
            if (typeof options.arity !== 'number') options.arity = staticArity;
            options.rules = options.rules || {};
            options.toDiscriminant = options.toDiscriminant || (x => x.toString()); // TODO: temp testing review this!
            options.unhandled = options.unhandled || '???'; // TODO: temp testing - what should be the default UNHANLDED sentinet? undefined? null? false? Some export? Pros/cons of each?

            // TODO: ...
            let instance = createMultimethod(options);
            instance[CTOR] = Multimethod;
            return instance;
        }

        static [Symbol.hasInstance](value: any) {
            if (staticArity) {
                return value && value[CTOR] === Multimethod;
            }
            else {
                return value && value.hasOwnProperty(CTOR); // TODO: works for symbols? TEST it...
            }
        }
    }
}





// TODO: ...
const CTOR = Symbol('ctor');





// TODO: doc...
export type Context = {[name: string]: string} & {next: Function};

// TODO: was... remove...
// export type Captures = {[name: string]: string;};
// export type Next = Function; // TODO: type this properly...
