




export default MultimethodOptions;
interface MultimethodOptions {
    arity?: number;
    timing?: 'mixed' | 'async' | 'sync';
    toDiscriminant?: Function;
    methods?: {[predicate: string]: Function};
}
