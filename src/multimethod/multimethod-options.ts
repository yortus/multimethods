




export default MultimethodOptions;
interface MultimethodOptions {
    arity?: number;
    timing?: 'mixed' | 'async' | 'sync';
    toDiscriminant?: Function;
    rules?: {[predicate: string]: Function};
}
