// TODO: where to put the following note?
// NB: Multimethod classes are defined as decomposed static-side and instance-side interfaces. They are defined
//     this way to achieve type-parameterization in the constructor (class decls don't allow this, see TS #10860).
import {MultimethodError} from '../util';





// TODO: Base case...
export interface MultimethodConstructor {
    new<T0, TR>(options: {arity: 1, async?: 'mixed'} & UnaryMultimethodOptions<T0, TR | Promise<TR>>): UnaryMultimethod<T0, TR | Promise<TR>>;
    new<T0, TR>(options: {arity: 1, async?: true} & UnaryMultimethodOptions<T0, Promise<TR>>): UnaryMultimethod<T0, Promise<TR>>;
    new<T0, TR>(options: {arity: 1, async?: false} & UnaryMultimethodOptions<T0, TR>): UnaryMultimethod<T0, TR>;
    new<T0, T1, TR>(options: {arity: 2, async?: 'mixed'} & BinaryMultimethodOptions<T0, T1, TR | Promise<TR>>): BinaryMultimethod<T0, T1, TR | Promise<TR>>;
    new<T0, T1, TR>(options: {arity: 2, async?: true} & BinaryMultimethodOptions<T0, T1, Promise<TR>>): BinaryMultimethod<T0, T1, Promise<TR>>;
    new<T0, T1, TR>(options: {arity: 2, async?: false} & BinaryMultimethodOptions<T0, T1, TR>): BinaryMultimethod<T0, T1, TR>;
    new<T0, T1, T2, TR>(options: {arity: 3, async?: 'mixed'} & TernaryMultimethodOptions<T0, T1, T2, TR | Promise<TR>>): TernaryMultimethod<T0, T1, T2, TR | Promise<TR>>;
    new<T0, T1, T2, TR>(options: {arity: 3, async?: true} & TernaryMultimethodOptions<T0, T1, T2, Promise<TR>>): TernaryMultimethod<T0, T1, T2, Promise<TR>>;
    new<T0, T1, T2, TR>(options: {arity: 3, async?: false} & TernaryMultimethodOptions<T0, T1, T2, TR>): TernaryMultimethod<T0, T1, T2, TR>;
    new<T, TR>(options: {arity: 'variadic', async?: 'mixed'} & VariadicMultimethodOptions<T, TR | Promise<TR>>): VariadicMultimethod<T, TR | Promise<TR>>;
    new<T, TR>(options: {arity: 'variadic', async?: true} & VariadicMultimethodOptions<T, Promise<TR>>): VariadicMultimethod<T, Promise<TR>>;
    new<T, TR>(options: {arity: 'variadic', async?: false} & VariadicMultimethodOptions<T, TR>): VariadicMultimethod<T, TR>;
    new(options?: MultimethodOptions): Multimethod;
}
export const Multimethod: MultimethodConstructor = createMultimethodClass(undefined);
export interface Multimethod extends Function {
    add(methods: {[predicate: string]: Function}): this;
    add(predicate: string, consequent: Function): this;
}
export interface MultimethodOptions {
    arity?: Arity;
    async?: true | false | 'mixed';
    toDiscriminant?: Function;
    methods?: {[predicate: string]: Function};
}
export default Multimethod;





// TODO: Unary case...
export interface UnaryMultimethodConstructor {
    new<T0, TR>(options: UnaryMultimethodOptions<T0, TR | Promise<TR>> & {async?: 'mixed'}): UnaryMultimethod<T0, TR | Promise<TR>>;
    new<T0, TR>(options: UnaryMultimethodOptions<T0, Promise<TR>> & {async?: true}): UnaryMultimethod<T0, Promise<TR>>;
    new<T0, TR>(options: UnaryMultimethodOptions<T0, TR> & {async?: false}): UnaryMultimethod<T0, TR>;
    new(): UnaryMultimethod<any, any>;
}
export interface UnaryMultimethod<T0, TR> {
    ($0: T0): TR;
    add(methods: {[predicate: string]: UnaryMethod<T0, TR>}): this;
    add(predicate: string, consequent: UnaryMethod<T0, TR>): this;
}
export const UnaryMultimethod = <UnaryMultimethodConstructor> class UnaryMultimethod extends createMultimethodClass(1) { };
export interface UnaryMultimethodOptions<T0, TR> extends MultimethodOptions {
    arity?: 1;
    toDiscriminant?: ($0: T0) => string;
    methods?: {[predicate: string]: UnaryMethod<T0, TR>};
}
export interface UnaryMethod<T0, TR> {
    ($0: T0, captures: Captures, next: Next): TR;
}





// TODO: Binary case...
export interface BinaryMultimethodConstructor {
    new<T0, T1, TR>(options: BinaryMultimethodOptions<T0, T1, TR | Promise<TR>> & {async?: 'mixed'}): BinaryMultimethod<T0, T1, TR | Promise<TR>>;
    new<T0, T1, TR>(options: BinaryMultimethodOptions<T0, T1, Promise<TR>> & {async?: true}): BinaryMultimethod<T0, T1, Promise<TR>>;
    new<T0, T1, TR>(options: BinaryMultimethodOptions<T0, T1, TR> & {async?: false}): BinaryMultimethod<T0, T1, TR>;
    new(): BinaryMultimethod<any, any, any>;
}
export interface BinaryMultimethod<T0, T1, TR> extends Multimethod {
    ($0: T0, $1: T1): TR;
    add(methods: {[predicate: string]: BinaryMethod<T0, T1, TR>}): this;
    add(predicate: string, consequent: BinaryMethod<T0, T1, TR>): this;
}
export const BinaryMultimethod = <BinaryMultimethodConstructor> class BinaryMultimethod extends createMultimethodClass(2) { };
export interface BinaryMultimethodOptions<T0, T1, TR> extends MultimethodOptions {
    arity?: 2;
    toDiscriminant?: ($0: T0, $1: T1) => string;
    methods?: {[predicate: string]: BinaryMethod<T0, T1, TR>};
}
export interface BinaryMethod<T0, T1, TR> {
    ($0: T0, $1: T1, captures: Captures, next: Next): TR;
}





// TODO: Ternary case...
export interface TernaryMultimethodConstructor {
    new<T0, T1, T2, TR>(options: TernaryMultimethodOptions<T0, T1, T2, TR | Promise<TR>> & {async?: 'mixed'}): TernaryMultimethod<T0, T1, T2, TR | Promise<TR>>;
    new<T0, T1, T2, TR>(options: TernaryMultimethodOptions<T0, T1, T2, Promise<TR>> & {async?: true}): TernaryMultimethod<T0, T1, T2, Promise<TR>>;
    new<T0, T1, T2, TR>(options: TernaryMultimethodOptions<T0, T1, T2, TR> & {async?: false}): TernaryMultimethod<T0, T1, T2, TR>;
    new(): TernaryMultimethod<any, any, any, any>;
}
export interface TernaryMultimethod<T0, T1, T2, TR> extends Multimethod {
    ($0: T0, $1: T1, $2: T2): TR;
    add(methods: {[predicate: string]: TernaryMethod<T0, T1, T2, TR>}): this;
    add(predicate: string, consequent: TernaryMethod<T0, T1, T2, TR>): this;
}
export const TernaryMultimethod = <TernaryMultimethodConstructor> class TernaryMultimethod extends createMultimethodClass(3) { };
export interface TernaryMultimethodOptions<T0, T1, T2, TR> extends MultimethodOptions {
    arity?: 3;
    toDiscriminant?: ($0: T0, $1: T1, $2: T2) => string;
    methods?: {[predicate: string]: TernaryMethod<T0, T1, T2, TR>};
}
export interface TernaryMethod<T0, T1, T2, TR> {
    ($0: T0, $1: T1, $2: T2, captures: Captures, next: Next): TR;
}





// TODO: Variadic case...
export interface VariadicMultimethodConstructor {
    new<T, TR>(options: VariadicMultimethodOptions<T, TR | Promise<TR>> & {async?: 'mixed'}): VariadicMultimethod<T, TR | Promise<TR>>;
    new<T, TR>(options: VariadicMultimethodOptions<T, Promise<TR>> & {async?: true}): VariadicMultimethod<T, Promise<TR>>;
    new<T, TR>(options: VariadicMultimethodOptions<T, TR> & {async?: false}): VariadicMultimethod<T, TR>;
    new(): VariadicMultimethod<any, any>;
}
export interface VariadicMultimethod<T, TR> extends Multimethod {
    (...args: T[]): TR;
    add(methods: {[predicate: string]: VariadicMethod<T, TR>}): this;
    add(predicate: string, consequent: VariadicMethod<T, TR>): this;
}
export const VariadicMultimethod = <VariadicMultimethodConstructor> class VariadicMultimethod extends createMultimethodClass('variadic') { };
export interface VariadicMultimethodOptions<T, TR> extends MultimethodOptions {
    arity?: 'variadic';
    toDiscriminant?: (args: T[]) => string;
    methods?: {[predicate: string]: VariadicMethod<T, TR>};
}
export interface VariadicMethod<T, TR> {
    (args: T[], captures: Captures, next: Next): TR;
}





// TODO: ...
export type Arity = 1 | 2 | 3 | 'variadic';





// TODO: ...
function createMultimethodClass(staticArity?: Arity): MultimethodConstructor {

    return <any> class Multimethod {
        constructor(options: {arity?: Arity}) {

            // If *both* arities given, they must match
            if (staticArity && options.arity && staticArity !== options.arity) {
                throw new MultimethodError(`arity mismatch`); // TODO: improve diagnostic message
            }

            // Use whichever arity is given. If neither arity is given, default to 'variadic'.
            let arity = staticArity || options.arity || 'variadic';

            // TODO: ...
            let instance = createMultimethod(arity, options);
            instance[CTOR] = Multimethod;
            return instance;
        }

        static [Symbol.hasInstance](value: any) {
            if (staticArity) {
                return value && value[CTOR] === Multimethod;
            }
            else {
                return value && value.hasOwnProperty(CTOR); // TODO: works for symbols?
            }
        }
    }
}





// TODO: ...
function createMultimethod(arity: Arity, options: {}) {
    // TODO: ...
    return <any> {};
}





// TODO: ...
const CTOR = Symbol('ctor');





// TODO: doc...
export type Captures = {[name: string]: string;};
export type Next = Function; // TODO: type this properly...








// EXAMPLES / TESTS
// TODO: temp testing...
function test() {


    let mm0 = new Multimethod({ // mixed variadic
        async: 'mixed',
        arity: 'variadic',
        toDiscriminant: ([$0]) => '',
        methods: {
            '/foo': async ([x]) => 42,
            '/bar': async ([x]) => 42,
        }
    });
    let result0 = mm0('foo');


    let mm1 = new Multimethod<string, string>({ // async unary
        async: true,
        arity: 1,
        methods: {
            '/foo': async (x, {n}, next) => '42',
            '/bar': async (x) => '42',
        }
    });
    mm1.add('/foo', async (x, {n}, next) => '42');
    let result1 = mm1('foo');


    let mm2 = new UnaryMultimethod({ // sync unary
        async: false,
        //arity: 1,
        methods: {
            '/foo': (x: string) => '42',
            '/bar': (x: string) => '42'
        }
    });
    mm2.add({'/baz': (a) => '42'});
    let result2 = mm2('foo');


    let mm3 = new Multimethod({ // async unary
        async: true,
        arity: 1,
        methods: {
            '/foo': async (x: string) => '42',
            '/bar': async (x: string) => '42',
        }
    });
    let result3 = mm3('foo');


    let mm4 = new BinaryMultimethod({ // mixed binary
        //async: true,
        //arity: 2,
        methods: {
            '/foo': async (x: string, y: number, {}) => '42',
            '/bar': async (x: string, y: number, {}, next: any) => '42',
        }
    });
    let result4 = mm4('foo', 720);


    let mm5 = new Multimethod({ // mixed ternary
        //async: true,
        arity: 3,
        methods: {
            '/foo': (x, y, z, {n}) => '42',
            '/bar': async (x, y, z, {n}) => '42',
        }
    });
    let result5 = mm5('foo', 'bar', 'baz');


    let mm = new Multimethod({}); // untyped
    mm(42, 24);
}


namespace ns {

    let m1 = new Multimethod(); // untyped
    let r1 = m1(42, 24);
    
    let m2 = new UnaryMultimethod();
    let r2 = m2(43);

    let m3 = new BinaryMultimethod();
    let r3 = m3(42, 24);

    let m4 = new TernaryMultimethod();
    let r4 = m4(42, 24, 2);

    let m5 = new VariadicMultimethod();
    let r5 = m5(42, 24); // TODO: should NOT typecheck!
}
