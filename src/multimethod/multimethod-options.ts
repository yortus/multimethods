




export default MultimethodOptions;
interface MultimethodOptions {
    arity?: number;
    timing?: 'mixed' | 'async' | 'sync';
    toDiscriminant?: Function;
    unhandled?: any;
    rules?: {[predicate: string]: Function};

    // TODO: ensure all codegen code respects this...
    emitES5?: boolean;
}
