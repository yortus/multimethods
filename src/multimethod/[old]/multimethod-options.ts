




export default interface MultimethodOptions {
    arity: number | 'variadic';
    timing: 'mixed' | 'async' | 'sync';
    toDiscriminant: Function;
    methods: { [predicatePattern: string]: Function|Function[]; };
}
