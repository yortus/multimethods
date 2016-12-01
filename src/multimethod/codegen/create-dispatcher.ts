import computeAllExecutors, {WithRoute} from './compute-all-executors';
import computeRouteSelector from './compute-route-selector';
import MultimethodOptions from '../multimethod-options';
import Pattern from '../../pattern';
import RouteExecutor from './route-executor';
import Rule from '../rule';
import Taxonomy from '../../taxonomy';
import * as util from '../../util';





// TODO: ...
export default function createDispatcher(taxonomy: Taxonomy<WithRoute>, normalisedOptions: MultimethodOptions) {

    // TODO: ...
    // Generate the combined source code for handling the route. This includes local variable declarations for
    // all rules' matchers and methods, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of the route.
    let t2 = computeAllExecutors(taxonomy, normalisedOptions);
    let selectorSource = computeRouteSelector(t2);

    let wholeSource = [selectorSource, ...t2.allNodes.map(node => node.source)].join('\n');

//    console.log(wholeSource);


    // Bring things into local scope that are ref'd from eval'ed code. NB: the source code
    // for eval cannot safely refer directly to expressions like `util.isPromiseLike`, since the `util` identifier may not
    // appear in the transpiled JavaScript for this module. This is because TypeScript may rename modules to try to preserve
    // ES6 module semantics.
    let toDiscriminant = normalisedOptions.toDiscriminant;
    const isPromise = util.isPromiseLike;
    const UNHANDLED = normalisedOptions.unhandled;



// TODO: review comment below (copypasta'd from old code)
// TODO: switch to `new Function` with closed over vars passed as params (as done in bluebird)
    // Evaluate the source code, and return its result, which is the composite route handler function. The use of eval
    // here is safe. There are no untrusted inputs substituted into the source. The client-provided rule handler
    // functions can do anything (so may be considered untrusted), but that has nothing to do with the use of 'eval'
    // here, since they would need to be called by the route handler whether or not eval was used. More importantly,
    // the use of eval here allows for route handler code that is both more readable and more efficient, since it is
    // tailored specifically to the route being evaluated, rather than having to be generalized for all possible cases.
    let selectRoute = eval(`(function () {\n${wholeSource}\nreturn _selectExecutor;\n})`)(); // TODO: brittle - don't assume name _selectExecutor 





    // // Create a route executor for each distinct route through the rule set.
    // let routeExecutors = createRouteExecutors(taxonomy, normalisedOptions);

    // // Generate a function that, given a discriminant, returns the executor for the best-matching route.
    // let selectRoute = createRouteSelector(taxonomy, routeExecutors);

    // Generate the overall dispatch function for the multimethod.
    // TODO: support arity properly... don't assume arity === 1 like done below...
    let dispatcher = function _dispatch($0) {
        let discriminant = toDiscriminant($0);
        let executeRoute = selectRoute(discriminant);
        let result = executeRoute(discriminant, UNHANDLED, $0);
        return result;
    };

    // All done.
    return dispatcher;
}
