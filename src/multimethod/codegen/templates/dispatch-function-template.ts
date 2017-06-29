import Thunk from '../thunk';





// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function...
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export const template = function __FUNCNAME__(__ELLIPSIS__MMARGS: any[]) {
    let discriminant = $.computeDiscriminant(__ELLIPSIS__MMARGS);
    let implementation = $.SELECT_IMPLEMENTATION(discriminant);
    let result = implementation(discriminant, $.CONTINUE, __ELLIPSIS__MMARGS);
    return result === $.CONTINUE ? $.fatalError('UNHANDLED') : result;
};





// TODO: explain...
declare const $: VariablesInScope;





// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VariablesInScope {
    computeDiscriminant: (...args: any[]) => string;
    SELECT_IMPLEMENTATION: (discriminant: string) => Thunk;
    CONTINUE: any;
    fatalError: (error: string) => never;
}
