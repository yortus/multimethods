import Thunk from '../thunk';





// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
let CONTINUE: any;
let computeDiscriminant: (...args: any[]) => string;
let fatalError: (error: string) => never;

// TODO: these are replacement placeholders.
// TODO: explain each of these in turn...
let SELECT_THUNK: (discriminant: string) => Thunk;
// FUNCTION_NAME is also replaced





// TODO: explain important norms in the template function...
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export default function FUNCTION_NAME(ELLIPSIS_MMARGS: any[]) {
    let discriminant = computeDiscriminant(ELLIPSIS_MMARGS);
    let implementation = SELECT_THUNK(discriminant);
    let result = implementation(discriminant, CONTINUE, ELLIPSIS_MMARGS);
    return result === CONTINUE ? fatalError('UNHANDLED') : result;
};
