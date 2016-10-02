//TODO: review all comments in here...
import * as util from '../util';
import PathHandler from './path-handler';
import Method from './method';
import * as unhandled from './unhandled';





/**
 * Generates the composite handler function for the route described by the given `rules`.
 * In the absence of decorators, the logic for executing a route is fairly simple: execute the handler for each rule in
 * turn, from the most- to the least-specific, until one produces a response. With decorators, the logic becomes more
 * complex, because a decorator must run *before* its more specfic handlers, with those more specific handlers being
 * wrapped into a callback function and passed to the decorator. To account for this, we perform an order-preserving
 * partitioning of a route's rules into a number of sublists, with each decorator starting a new partition. Within each
 * partition, the simple cascading logic outlined in the first sentence above is performed. However each partition is
 * executed in reverse-order (least to most specific), with the next (more-specific) partition being passed as the
 * $next parameter to the decorator starting the previous (less-specific) partition.
 * @param {Method[]} methods - the list of rules comprising the route, ordered from least- to most-specific.
 * @returns {Handler} the composite handler function for the route.
 */
export default function makePathHandler(methods: Method[]): PathHandler {

    // Obtain a reversed copy of the rule list, ordered from most- to least-specific. This simplifies logic below.
    methods = methods.slice().reverse();

    // Generate a unique pretty name for each rule, suitable for use in the generated source code.
    let methodNames: string[] = methods
        .map(method => method.predicate.identifier)
        .reduce((names, name) => names.concat(`${name}${names.indexOf(name) === -1 ? '' : `_${names.length}`}`), []);

    // The 'start' rule is the one whose handler we call to begin the cascading evaluation of the route. It is the
    // least-specific decorator rule, or if there are no decorator rules, it is the most-specific rule.
    let startMethodName = methodNames.filter((_, i) => methods[i].isDecorator).pop() || methodNames[0];

    // Generate the combined source code for handling the route. This includes local variable declarations for
    // all rules' match and handler functions, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of the route.
    let lines = [
        ...methodNames.map((name, i) => `var match${name} = methods[${i}].predicate.match;`),
        ...methodNames.map((name, i) => `var handle${name} = methods[${i}].consequent;`),
        'function ℙØ(addr, req) {\n    return UNHANDLED;\n}',
        generateMethodHandlerSourceCode(methods, methodNames),
        `return ${startMethodName};`
    ];

    // Evaluate the source code, and return its result, which is the composite route handler function. The use of eval
    // here is safe. There are no untrusted inputs substituted into the source. The client-provided rule handler
    // functions can do anything (so may be considered untrusted), but that has nothing to do with the use of 'eval'
    // here, since they would need to be called by the route handler whether or not eval was used. More importantly,
    // the use of eval here allows for route handler code that is both more readable and more efficient, since it is
    // tailored specifically to the route being evaluated, rather than having to be generalized for all possible cases.
    let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
    return fn;
}





/**
 * Helper function to generate source code for a set of interdependent functions (one per rule) that perform the
 * cascading evaluation of a route, accounting for the possibly mixed sync/async implementation of the rule handlers.
 */
function generateMethodHandlerSourceCode(methods: Method[], methodNames: string[]): string {

    // Generate source code for each rule in turn.
    let sources = methods.map((method, i) => {

        // For each rule, we reuse the source code template below. But first we need to compute a number of
        // values for substitution into the template. A few notes on these substitutions:
        // - `nextRuleName` is used for cascading evaluation, i.e. when the current rule handler returns UNHANDLED.
        // - `downstreamRuleName` refers to the first rule in the next more-specific partition (see JSDoc notes at top
        //   of this file). It is substituted in as the value of `$next` when a decorator rule's handler is called.
        // - `handlerArgs` is a hash keyed by all possible parameter names a rule's raw handler may use, and whose
        //   values are the source code for the argument corresponding to each parameter.
        let methodName = methodNames[i];
        let nextMethodName = methodNames[i + 1];
        let downstreamMethodName = methodNames.filter((n, j) => (j === 0 || methods[j].isDecorator) && j < i).pop() || 'ℙØ';
        let startsPartition = i === 0 || method.isDecorator;
        let endsPartition = i === methods.length - 1 || methods[i + 1].isDecorator;
        let captureNames = method.predicate.captureNames;
        let hasCaptures = captureNames.length > 0;
        // let paramMappings = captureNames.reduce((map, name) => (map[name] = `captures${ruleName}.${name}`, map), {});
        // paramMappings['$addr'] = 'addr';
        // paramMappings['$req'] = 'req';
        // paramMappings['$next'] = `rq => ${downstreamRuleName}(addr, rq === void 0 ? req : rq)`;
        //const handlerArgs = rule.parameterNames.map(name => paramMappings[name]).join(', ');

//TODO: temp testing...
const handlerArgs = ['req', hasCaptures ? `captures${methodName}` : 'void 0'];
if (method.isDecorator) {
    handlerArgs.push(`rq => ${downstreamMethodName}(addr, rq === void 0 ? req : rq)`);
}        

        // Generate the initial source code, substituting in the values computed above. Note the
        // conditional annotations to the right of each line. The code will be tweaked more below.
        let source = `
            function ${methodName}(addr, req, res?) {
                if (res !== UNHANDLED) return res;                                          #if ${!startsPartition}
                var captures${methodName} = match${methodName}(addr);                           #if ${hasCaptures}
                var res = handle${methodName}(${handlerArgs});                                #if ${!endsPartition}
                if (isPromise(res)) return res.then(rs => ${nextMethodName}(addr, req, rs));  #if ${!endsPartition}
                return ${nextMethodName}(addr, req, res);                                     #if ${!endsPartition}
                return handle${methodName}(${handlerArgs});                                   #if ${endsPartition}
            }
        `;

        // Strip off superfluous lines and indentation.
        source = source.split(/[\r\n]+/).slice(1, -1).join('\n');
        let indent = source.match(/^[ ]+/)[0].length;
        source = source.split('\n').map(line => line.slice(indent)).join('\n');

        // Conditionally keep/discard whole lines according to #if directives.
        source = source.replace(/^(.*?)([ ]+#if true)$/gm, '$1').replace(/\n.*?[ ]+#if false/g, '');

        // The first rule in each partition doesn't need a 'res' parameter. Adjust accordingly.
        source = source.replace(', res?', startsPartition ? '' : ', res');
        source = source.replace('var res', startsPartition ? 'var res' : 'res');
        return source;
    });

    // Combine and return all the sources.
    return sources.join('\n');
}





// Declare isPromise and UNHANDLED in local scope, so the eval'ed route handlers can reference them. NB: the source code
// for eval cannot safely refer directly to expressions like `util.isPromiseLike`, since the `util` identifier may not
// appear in the transpiled JavaScript for this module. This is because TypeScript may rename modules to try to preserve
// ES6 module semantics.
let isPromise = util.isPromiseLike;
let UNHANDLED = unhandled.default;
