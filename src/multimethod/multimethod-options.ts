import Rule from './rule';





export default MultimethodOptions;
interface MultimethodOptions {
    arity: number | 'variadic';
    timing: 'mixed' | 'async' | 'sync';
    toDiscriminant: Function;
    unhandled: any;
    rules: {[predicatePattern: string]: Function};

    // TODO: ensure all codegen code respects this...
    emitES5: boolean;

    // TODO: tiebreak... or rename to chooseBestRule?
    moreSpecific: (a: Rule, b: Rule) => Rule|undefined;

    // TODO: doc/improve...
    trace: boolean;
}
