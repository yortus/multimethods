import computeRuleReferenceSource from './compute-rule-reference-source';
import computeThunkTable from './compute-all-thunks';
import computeThunkSelector from './compute-thunk-selector';
import debug, {EMIT, DISPATCH} from '../../util/debug';
import {emitDispatchFunction} from './emit';
import * as fatalErrorUtil from '../../util/fatal-error';
import {LineageII} from '../compute-predicate-lineages-ii';
import * as predicates from '../../set-theory/predicates';
import MultimethodOptions from '../multimethod-options';
import * as sentinels from '../sentinels';
import {EulerDiagram} from '../../set-theory/sets';
import isPromiseLike from '../../util/is-promise-like';





// TODO: ...
export default function generateMultimethod(eulerDiagram: EulerDiagram<LineageII>, normalisedOptions: MultimethodOptions) {

    // TODO: ...
    // Generate the combined source code for handling the route. This includes local variable declarations for
    // all rules' matchers and methods, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of the route.
    let multimethodName = `MM${multimethodCounter++}`;
    let dispatchSource = getSourceCodeForDispatchFunction(multimethodName, normalisedOptions);
    let thunks = computeThunkTable(eulerDiagram, normalisedOptions);
    let thunkSelectorSource = computeThunkSelector(thunks);
    let ruleReferences = computeRuleReferenceSource(eulerDiagram);
    let wholeSource = [
        `// ========== MULTIMETHOD DISPATCH FUNCTION ==========`,
        dispatchSource,
        `// ========== THUNK SELECTOR FUNCTION ==========`,
        thunkSelectorSource,
        `// ========== THUNK TABLE ==========`,
        ...thunks.sets.map(set => set.thunkSource),
        `// ========== RULE REFERENCES ==========`, // TODO: rename...
        ruleReferences
    ].join('\n');

    // TODO: doc...
    if (debug.enabled) {
        for (let line of wholeSource.split('\n')) debug(`${EMIT} %s`, line);
    }

    // Bring things into local scope that are ref'd from eval'ed code. NB: the source code
    // for eval cannot safely refer directly to expressions like `util.isPromiseLike`, since the `util` identifier may not
    // appear in the transpiled JavaScript for this module. This is because TypeScript may rename modules to try to preserve
    // ES6 module semantics.
    const computeDiscriminant = normalisedOptions.toDiscriminant;
    computeDiscriminant; // Suppress TS6133 decl never used
    const isPromise = isPromiseLike;
    isPromise; // Suppress TS6133 decl never used
    const CONTINUE = sentinels.CONTINUE;
    CONTINUE; // Suppress TS6133 decl never used
    const toMatchFunction = predicates.toMatchFunction;             //      <===== refd in selectBestImplementation
    toMatchFunction; // Suppress TS6133 decl never used
    const parsePredicate = predicates.parsePredicatePattern;
    parsePredicate; // Suppress TS6133 decl never used
    const fatalError = fatalErrorUtil.default;
    fatalError; // Suppress TS6133 decl never used


// TODO: review comments below (copypasta'd from old code)
// TODO: switch to `new Function` with closed over vars passed as params (as done in bluebird)
    // Evaluate the source code, and return its result, which is the composite route handler function. The use of eval
    // here is safe. There are no untrusted inputs substituted into the source. The client-provided rule handler
    // functions can do anything (so may be considered untrusted), but that has nothing to do with the use of 'eval'
    // here, since they would need to be called by the route handler whether or not eval was used. More importantly,
    // the use of eval here allows for route handler code that is both more readable and more efficient, since it is
    // tailored specifically to the route being evaluated, rather than having to be generalized for all possible cases.




    // Generate a function that, given a discriminant, returns the executor for the best-matching route.
    let dispatchFunction: Function = eval(`(function () {\n${wholeSource}\nreturn ${multimethodName};\n})`)();





// TODO: temp testing... RESTORE...
if (debug.enabled) {
    let oldDispatch = dispatchFunction;
    dispatchFunction = function _dispatch(...args: any[]) {
        debug(`${DISPATCH} Call   args=%o   discriminant='%s'`, args, computeDiscriminant(...args));
        let result = oldDispatch(...args);
        let isAsync = isPromiseLike(result);
        return andThen(result, result => {
            debug(`${DISPATCH} Return%s   result=%o`, isAsync ? '   ASYNC' : '', result);
            debug('');
            return result;
        });
    }
}





    // All done.
    return dispatchFunction;
}





// TODO: copypasta - move to util
function andThen(val: any, cb: (val: any) => any) {
    return isPromiseLike(val) ? val.then(cb) : cb(val);
}










// TODO: temp testing...
function getSourceCodeForDispatchFunction(functionName: string, options: MultimethodOptions) {

    // TODO: fix arity cast below when MMOptions type is fixed
    let source = emitDispatchFunction(functionName, options.arity as number|undefined, {
        computeDiscriminant: 'computeDiscriminant',
        SELECT_IMPLEMENTATION: 'selectThunk', // TODO: temp testing... how to know this name?
        CONTINUE: 'CONTINUE',
        fatalError: 'fatalError'
    });

    // All done for this iteration.
    return source;
}





// TODO: doc...
let multimethodCounter = 0;
