// TODO: where to put the following note?
// NB: Multimethod classes are defined as decomposed static-side and instance-side interfaces. They are defined
//     this way to achieve type-parameterization in the constructor (class decls don't allow this, see TS #10860).
import Arity from './arity';
import createMultimethod from './create-multimethod';
import {MultimethodError} from '../util';





// TODO: Base case...
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
    new<T, TR>(options: {timing?: 'mixed'} & VariadicMultimethodOptions<T, TR | Promise<TR>>): VariadicMultimethod<T, TR | Promise<TR>>;
    new<T, TR>(options: {timing?: 'async'} & VariadicMultimethodOptions<T, Promise<TR>>): VariadicMultimethod<T, Promise<TR>>;
    new<T, TR>(options: {timing?: 'sync'} & VariadicMultimethodOptions<T, TR>): VariadicMultimethod<T, TR>;
    new(options?: MultimethodOptions): Multimethod;
}
export const Multimethod: MultimethodConstructor = createMultimethodClass(undefined);
export interface Multimethod extends Function {
    add(methods: {[predicate: string]: Function}): this;
    add(predicate: string, consequent: Function): this;
}
export interface MultimethodOptions {
    arity?: Arity;
    timing?: 'mixed' | 'async' | 'sync';
    toDiscriminant?: Function;
    methods?: {[predicate: string]: Function};
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
    add(methods: {[predicate: string]: NullaryMethod<TR>}): this;
    add(predicate: string, consequent: NullaryMethod<TR>): this;
}
export const NullaryMultimethod = <NullaryMultimethodConstructor> class NullaryMultimethod extends createMultimethodClass(0) { };
export interface NullaryMultimethodOptions<TR> extends MultimethodOptions {
    arity?: 0;
    toDiscriminant?: () => string;
    methods?: {[predicate: string]: NullaryMethod<TR>};
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
    add(methods: {[predicate: string]: VariadicMethod<T, TR>}): this;
    add(predicate: string, consequent: VariadicMethod<T, TR>): this;
}
export const VariadicMultimethod = <VariadicMultimethodConstructor> class VariadicMultimethod extends createMultimethodClass() { };
export interface VariadicMultimethodOptions<T, TR> extends MultimethodOptions {
    // TODO: was... arity?: 'variadic';
    toDiscriminant?: (...args: T[]) => string;
    methods?: {[predicate: string]: VariadicMethod<T, TR>};
}
export interface VariadicMethod<T, TR> {
    (ctx: Context, ...args: T[]): TR;
}





// TODO: ...
function createMultimethodClass(staticArity?: Arity): MultimethodConstructor {

    let result: any = class $MM {
        constructor(options?: {arity?: Arity}) {
            options = options || {};

            // If *both* arities given, they must match
            if (staticArity && options.arity && staticArity !== options.arity) {
                throw new MultimethodError(`arity mismatch`); // TODO: improve diagnostic message
            }

            // Use whichever arity is given. If neither arity is given, default to 'variadic'.
            let arity = staticArity || options.arity || undefined; // TODO: need last clause

            // TODO: ...
            let instance = createMultimethod(arity, options);
            instance[CTOR] = $MM;
            return instance;
        }

        static [Symbol.hasInstance](value: any) {
            if (staticArity) {


// TODO: temp testing...
debugger;
let v = value && value[CTOR];
let result = value && v === $MM;



                return value && value[CTOR] === $MM;
            }
            else {
                return value && value.hasOwnProperty(CTOR); // TODO: works for symbols? TEST it...
            }
        }
    }

// TODO: temp testing...
let name = 'MM';
switch (staticArity) {
    case 1: name = 'UnaryMM'; break;
    case 2: name = 'BinaryMM'; break;
    case 3: name = 'TernaryMM'; break;
}
let temp = `(${result.toString().replace(/\$MM/g, name)})`;
result = eval(`(${result.toString().replace(/\$MM/g, name)})`);


    return result;
}





// TODO: ...
const CTOR = Symbol('ctor');





// TODO: doc...
export type Context = {[name: string]: string} & {next: Function};

// TODO: was... remove...
// export type Captures = {[name: string]: string;};
// export type Next = Function; // TODO: type this properly...








// TODO: temp testing remove...
        function test() {


            let mmx = new Multimethod({ // mixed variadic
                //arity: undefined, // uncomment and it becomes UnaryMultimethod (except if using --strictNullChecks)
            });
            let resultx = mmx('foo');
            resultx = mmx('foo', 42, 'bar'); // OK, variadic


            let mm0 = new Multimethod({ // mixed variadic
                arity: undefined, // or don't give this key at all
                timing: 'mixed',
                toDiscriminant: ([$0]) => '',
                methods: {
                    '/foo': async (_, x) => 42,
                    '/bar': async (_, x) => 42,
                    '/baz': async (_, x, y, z, w) => 42,
                }
            });
            let result0 = mm0('foo');
            result0 = mm0('foo', 42, 'bar'); // OK, variadic


            let mm1 = new Multimethod<string, string>({ // async unary
                arity: 1,
                timing: 'async',
                methods: {
                    '/foo': async ({n, next}, x) => '42',
                    '/bar': async (_, x) => '42',
                }
            });
            mm1.add('/foo', async ({n, next}, x) => '42');
            let result1 = mm1('foo');
            result1 = mm1();                                                    // ERROR arity
            result1 = mm1('foo', 'bar');                                        // ERROR arity


            let mm2 = new UnaryMultimethod({ // sync unary
                //arity: 1,
                timing: 'sync',
                methods: {
                    '/foo': (_, x: string) => '42',
                    '/bar': (_, x: string) => '42',
                    // '/baz': (_, x: string, y: number) => '42' ERROR if uncommented
                }
            });
            mm2.add({'/baz': (_, a) => '42'});
            let result2 = mm2('foo');
            result2 = mm2();                                                    // ERROR arity
            result2 = mm2('foo', 'bar');                                        // ERROR arity


            let mm3 = new Multimethod({ // async unary
                arity: 1,
                timing: 'async',
                methods: {
                    '/foo': async (_, x: string) => '42',
                    '/bar': async (_, x: string) => '42',
                }
            });
            let result3 = mm3('foo');
            result3 = mm3(); // ERROR arity
            result3 = mm3('foo', 'bar');                                        // ERROR arity


            let mm4 = new BinaryMultimethod({ // mixed binary
                //arity: 2,
                //timing: 'async',
                methods: {
                    '/foo': async ({}, x: string, y: number) => '42',
                    '/bar': async ({next}, x: string, y: number) => '42',
                }
            });
            let result4 = mm4('foo', 720);
            result4 = mm4();                                                    // ERROR arity
            result4 = mm4('foo', 'bar');                                        // ERROR type
            result4 = mm4('foo', 11, 'bar');                                    // ERROR arity


            let mm5 = new Multimethod({ // mixed ternary
                arity: 3,
                //timing: 'async',
                methods: {
                    '/foo': ({n}, x, y, z) => '42',
                    '/bar': async ({n}, x, y, z) => '42',
                }
            });
            let result5 = mm5('foo', 'bar', 'baz');
            result5 = mm5('foo', 'bar');                                        // ERROR arity
            result5 = mm5('foo', 'bar', 'baz', 'quux');                         // ERROR arity


            let mm = new Multimethod({}); // untyped
            mm(42, 24);
            mm(1, 2, 3);


            let mm6 = new Multimethod({ // mixed nullary
                arity: 0,
                methods: {
                    foo: (ctx) => 'foo'
                }
            });
            let result6 = mm6();
            result6 = mm6('foo');                                               // ERROR arity

        }


        function test2() {

            let m1 = new Multimethod(); // untyped
            let r1 = m1(42, 24);
            
            let m2 = new UnaryMultimethod();
            let r2 = m2(43);
            r2 = m2(43, true);                                                  // ERROR arity

            let m3 = new BinaryMultimethod();
            let r3 = m3(42, 24);

            let m4 = new TernaryMultimethod();
            let r4 = m4(42, 24, 2);

            let m5 = new VariadicMultimethod();
            let r5 = m5(42, 24);
            r5 = m5(); // OK

        }
