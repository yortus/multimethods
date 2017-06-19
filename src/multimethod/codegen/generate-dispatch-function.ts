import computeAllExecutors from './compute-all-executors';
import computeRouteSelector from './compute-route-selector';
import {fatalError} from '../../util';
import {Lineage} from '../compute-predicate-lineages';
import * as predicates from '../../set-theory/predicates';
import MultimethodOptions from '../multimethod-options';
import * as sentinels from '../sentinels';
import {EulerDiagram} from '../../set-theory/sets';
import * as util from '../../util';





// TODO: ...
export default function generateDispatchFunction(eulerDiagram: EulerDiagram<Lineage>, normalisedOptions: MultimethodOptions) {

    // TODO: ...
    // Generate the combined source code for handling the route. This includes local variable declarations for
    // all rules' matchers and methods, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of the route.
    let t2 = computeAllExecutors(eulerDiagram, normalisedOptions);
    let selectorSource = computeRouteSelector(t2);

    let wholeSource = [selectorSource, ...t2.sets.map(set => set.source)].join('\n');

// TODO: temp testing... remove
//console.log(wholeSource);


    // Bring things into local scope that are ref'd from eval'ed code. NB: the source code
    // for eval cannot safely refer directly to expressions like `util.isPromiseLike`, since the `util` identifier may not
    // appear in the transpiled JavaScript for this module. This is because TypeScript may rename modules to try to preserve
    // ES6 module semantics.
    const toDiscriminant = normalisedOptions.toDiscriminant;
    const isPromise = util.isPromiseLike;
    isPromise; // Suppress TS6133 decl never used
    const CONTINUE = sentinels.CONTINUE;
    CONTINUE; // Suppress TS6133 decl never used
    const toMatchFunction = predicates.toMatchFunction;
    toMatchFunction; // Suppress TS6133 decl never used
    const parsePredicate = predicates.parsePredicatePattern;
    parsePredicate; // Suppress TS6133 decl never used


// TODO: review comments below (copypasta'd from old code)
// TODO: switch to `new Function` with closed over vars passed as params (as done in bluebird)
    // Evaluate the source code, and return its result, which is the composite route handler function. The use of eval
    // here is safe. There are no untrusted inputs substituted into the source. The client-provided rule handler
    // functions can do anything (so may be considered untrusted), but that has nothing to do with the use of 'eval'
    // here, since they would need to be called by the route handler whether or not eval was used. More importantly,
    // the use of eval here allows for route handler code that is both more readable and more efficient, since it is
    // tailored specifically to the route being evaluated, rather than having to be generalized for all possible cases.

    // Generate a function that, given a discriminant, returns the executor for the best-matching route.
    let selectRoute = eval(`(function () {\n${wholeSource}\nreturn _selectExecutor;\n})`)(); // TODO: brittle - don't assume name _selectExecutor 

    // Generate the overall dispatch function for the multimethod.
    // TODO: support arity properly... don't assume arity === 1 like done below...
    // TODO: use rest/spread and the transforms used in generating the executors...
    let dispatchFunction: Function = function _dispatch($0: any) {
        let discriminant = toDiscriminant($0);
        let executeRoute = selectRoute(discriminant);
        let result = executeRoute(discriminant, CONTINUE, $0);
        if (result === CONTINUE) return fatalError('UNHANDLED');
        return result;
    };

    // TODO: temp testing... fix arity handling... but what about variadic?
    if (typeof normalisedOptions.arity === 'number') {
        let paramNames = [];
        for (let i = 0; i < normalisedOptions.arity; ++i) paramNames.push('$' + i);
        let source = dispatchFunction.toString();
        source = source.replace(/\$0/g, paramNames.join(', '));
        dispatchFunction = eval(`(${source})`);
    }

    // All done.
    return dispatchFunction;
}
