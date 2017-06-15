




export default interface MultimethodOptions {
    arity: number | 'variadic';
    timing: 'mixed' | 'async' | 'sync';
    toDiscriminant: Function;
    FALLBACK: any;
    rules: { [predicatePattern: string]: Function|Function[]; };

    // TODO: doc/improve...
    trace: boolean;

    // TODO: doc...
    strictChecks: boolean;
}
