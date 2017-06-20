




export default interface MultimethodOptions {
    arity: number | 'variadic';
    timing: 'mixed' | 'async' | 'sync';
    toDiscriminant: Function;
    rules: { [predicatePattern: string]: Function|Function[]; };

    // TODO: doc...
    strictChecks: boolean;
}
