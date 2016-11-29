import createRouteExecutors from './create-route-executors';
import createRouteSelector from './create-route-selector';
import MultimethodOptions from '../multimethod-options';
import Pattern from '../../pattern';
import RouteExecutor from './route-executor';
import Rule from '../impl/rule';
import Taxonomy from '../../taxonomy';





export default function createDispatcher(taxonomy: Taxonomy<never>, routes: Map<Pattern, Rule[]>, normalisedOptions: MultimethodOptions) {

    // TODO: ...
    let toDiscriminant = normalisedOptions.toDiscriminant;
    let UNHANDLED = normalisedOptions.unhandled;

    // Create a route executor for each distinct route through the rule set.
    let routeExecutors = createRouteExecutors(routes, normalisedOptions);

    // Generate a function that, given a discriminant, returns the executor for the best-matching route.
    let selectRoute = createRouteSelector(taxonomy, routeExecutors);

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
