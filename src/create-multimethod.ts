import analyse from './analysis';
import codegen from './codegen';
import debug from './util/debug';
import instrument from './instrumentation';
import Options from './options';
import validate from './validation';





function create<T0, TR>(options: {arity: 1; async: false} & UnaryOptions<T0, TR>): (_0: T0) => TR;
function create<T0, TR>(options: {arity: 1; async: true} & UnaryOptions<T0, TR | Promise<TR>>): (_0: T0) => Promise<TR>;
function create<T0, TR>(options: {arity: 1} & UnaryOptions<T0, TR | Promise<TR>>): (_0: T0) => TR | Promise<TR>;
function create<T0, T1, TR>(options: {arity: 2; async: false} & BinaryOptions<T0, T1, TR>): (_0: T0, _1: T1) => TR;
function create<T0, T1, TR>(options: {arity: 2; async: true} & BinaryOptions<T0, T1, TR | Promise<TR>>): (_0: T0, _1: T1) => Promise<TR>;
function create<T0, T1, TR>(options: {arity: 2} & BinaryOptions<T0, T1, TR | Promise<TR>>): (_0: T0, _1: T1) => TR | Promise<TR>;
function create<T0, T1, T2, TR>(options: {arity: 3; async: false} & TernaryOptions<T0, T1, T2, TR>): (_0: T0, _1: T1, _2: T2) => TR;
function create<T0, T1, T2, TR>(options: {arity: 3; async: true} & TernaryOptions<T0, T1, T2, TR | Promise<TR>>): (_0: T0, _1: T1, _2: T2) => Promise<TR>;
function create<T0, T1, T2, TR>(options: {arity: 3} & TernaryOptions<T0, T1, T2, TR | Promise<TR>>): (_0: T0, _1: T1, _2: T2) => TR | Promise<TR>;
function create<T, TR>(options: {async: false} & VariadicOptions<T, TR>): (...args: T[]) => TR;
function create<T, TR>(options: {async: true} & VariadicOptions<T, TR | Promise<TR>>): (...args: T[]) => Promise<TR>;
function create<T, TR>(options?: VariadicOptions<T, TR | Promise<TR>>): (...args: T[]) => TR | Promise<TR>;
function create(options?: Options) {
    options = options || {};
    validate(options); // NB: may throw
    let mminfo = analyse(options);
    let emit = codegen(mminfo);
    if (debug.enabled) instrument(emit);
    let multimethod = emit.generate();
    return multimethod;
}
export default create;





export interface UnaryOptions<T0, TR> extends Options {
    toDiscriminant?: (_0: T0) => string;
    methods?: Methods<(_0: T0, captures: Captures, forward: (_0: T0) => TR) => TR>;
}





export interface BinaryOptions<T0, T1, TR> extends Options {
    toDiscriminant?: (_0: T0, _1: T1) => string;
    methods?: Methods<(_0: T0, _1: T1, captures: Captures, forward: (_0: T0, _1: T1) => TR) => TR>;
}





export interface TernaryOptions<T0, T1, T2, TR> extends Options {
    toDiscriminant?: (_0: T0, _1: T1, _2: T2) => string;
    methods?: Methods<(_0: T0, _1: T1, _2: T2, captures: Captures, forward: (_0: T0, _1: T1, _2: T2) => TR) => TR>;
}





export interface VariadicOptions<T, TR> extends Options {
    toDiscriminant?: (...args: T[]) => string;
    methods?: Methods<(...args: Array<T|Captures|((...args: T[]) => TR)>) => TR>;
    // TODO: ^--- the `...args` type is best effort, but really needs to be (...args: T[], captures: {[name: string]: string}, next: Next)
}





export type Methods<TMethod extends Function> = { [predicate: string]: TMethod|TMethod[]; };





export type Captures = {[captureName: string]: string};
