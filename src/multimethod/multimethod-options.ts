import Rule from './rule';





export default MultimethodOptions;
interface MultimethodOptions {
    arity: number | 'variadic';
    timing: 'mixed' | 'async' | 'sync';
    toDiscriminant: Function;
    FALLBACK: any;
    rules: { [predicatePattern: string]: Function|Function[]; };

    // TODO: rename to tiebreak...
    //   -or- just make ambiguities an unconditional error
    //   but then how to deal with genuine cases?
    //   - allow arrays of handers?
    //   - *official* priority decorator, a bit like css z-index
    moreSpecific: (a: Rule, b: Rule) => Rule|undefined;

    // TODO: doc/improve...
    trace: boolean;

    // TODO: doc...
    strictChecks: boolean;
}
