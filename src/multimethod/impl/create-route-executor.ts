//TODO: review all comments in here...
import * as util from '../../util';
import RouteExecutor from './route-executor';
import Rule from './rule';
import * as unhandled from './unhandled';





// TODO: rewrite comment. Esp signature of route executor matches signature of multimethod (as per provided Options)
/**
 * Generates the composite method for the route described by the given `rules`.
 * In the absence of meta-rules, the logic for executing a route is straightforward: execute the method for each rule in
 * turn, from the most- to the least-specific, until one produces a result. With meta-rules, the logic becomes more
 * complex, because a meta-rule's method must run *before* the methods of more specfic rules, with those more specific
 * methods being wrapped into a callback function and passed to the meta-rule's method. To account for this, we perform
 * an order-preserving partitioning of a route's rules into a number of sublists, with each meta-rule starting a new
 * partition. Within each partition, the simple cascading logic outlined in the first sentence above is performed.
 * However each partition is executed in reverse-order (least to most specific), with the next (more-specific) partition
 * being passed as the $next parameter to the meta-rule starting the previous (less-specific) partition.
 * @param {Rule[]} rules - the list of rules comprising the route, ordered from least- to most-specific.
 * @returns {Method} the composite method for the route.
 */
export default function createRouteExecutor(rules: Rule[]): RouteExecutor {

    // Obtain a reversed copy of the rule list, ordered from most- to least-specific. This simplifies logic below.
    rules = rules.slice().reverse();

    // Generate a unique pretty name for each rule, suitable for use in the generated source code.
    let ruleNames: string[] = rules
        .map(rule => rule.predicate.identifier)
        .reduce((names, name) => names.concat(`${name}${names.indexOf(name) === -1 ? '' : `_${names.length}`}`), []);

    // The 'start' rule is the one whose method we call to begin the cascading evaluation of the route. It is the
    // least-specific meta-rule, or if there are no meta-rules, it is the most-specific ordinary rule.
    let startMethodName = ruleNames.filter((_, i) => rules[i].isMetaRule).pop() || ruleNames[0];

    // Generate the combined source code for handling the route. This includes local variable declarations for
    // all rules' matchers and methods, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of the route.
    let lines = [
        ...ruleNames.map((name, i) => `var caps${name} = rules[${i}].predicate.match;`),
        ...ruleNames.map((name, i) => `var exec${name} = rules[${i}].method;`),
        'function ℙØ(addr, req) {\n    return UNHANDLED;\n}',
        generateMethodHandlerSourceCode(rules, ruleNames),
        `return ${startMethodName};`
    ];

// TODO: switch to `new Function` with closed over vars passed as params (as done in bluebird)
    // Evaluate the source code, and return its result, which is the composite route handler function. The use of eval
    // here is safe. There are no untrusted inputs substituted into the source. The client-provided rule handler
    // functions can do anything (so may be considered untrusted), but that has nothing to do with the use of 'eval'
    // here, since they would need to be called by the route handler whether or not eval was used. More importantly,
    // the use of eval here allows for route handler code that is both more readable and more efficient, since it is
    // tailored specifically to the route being evaluated, rather than having to be generalized for all possible cases.
    let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();

// TODO: temp testing
console.log('\n\n\n\n<----------------------->');
let allLines = lines.join('\n');
console.log(allLines);
console.log('</----------------------->');

    return fn;
}





/**
 * Helper function to generate source code for a set of interdependent functions (one per rule) that perform the
 * cascading evaluation of a route, accounting for the possibly mixed sync/async implementation of the rule handlers.
 */
function generateMethodHandlerSourceCode(rules: Rule[], ruleNames: string[]): string {

    // Generate source code for each rule in turn.
    let sources = rules.map((method, i) => {

        // For each rule, we reuse the source code template below. But first we need to compute a number of
        // values for substitution into the template. A few notes on these substitutions:
        // - `nextRuleName` is used for cascading evaluation, i.e. when the current rule handler returns UNHANDLED.
        // - `downstreamRuleName` refers to the first rule in the next more-specific partition (see JSDoc notes at top
        //   of this file). It is substituted in as the value of `$next` when a meta-rule's method is called.
        // - `handlerArgs` is a hash keyed by all possible parameter names a rule's raw handler may use, and whose
        //   values are the source code for the argument corresponding to each parameter.
        let methodName = ruleNames[i];
        let nextMethodName = ruleNames[i + 1];
        let downstreamMethodName = ruleNames.filter((n, j) => (j === 0 || rules[j].isMetaRule) && j < i).pop() || 'ℙØ';
        let startsPartition = i === 0 || method.isMetaRule;
        let endsPartition = i === rules.length - 1 || rules[i + 1].isMetaRule;
        let captureNames = method.predicate.captureNames;
        let hasCaptures = captureNames.length > 0;
        // let paramMappings = captureNames.reduce((map, name) => (map[name] = `captures${ruleName}.${name}`, map), {});
        // paramMappings['$addr'] = 'addr';
        // paramMappings['$req'] = 'req';
        // paramMappings['$next'] = `rq => ${downstreamRuleName}(addr, rq === void 0 ? req : rq)`;
        //const handlerArgs = rule.parameterNames.map(name => paramMappings[name]).join(', ');

//TODO: temp testing...
const handlerArgs = ['req', hasCaptures ? `captures${methodName}` : 'void 0'];
if (method.isMetaRule) {
    handlerArgs.push(`rq => ${downstreamMethodName}(addr, rq === void 0 ? req : rq)`);
}        

        // Generate the initial source code, substituting in the values computed above. Note the
        // conditional annotations to the right of each line. The code will be tweaked more below.
        let source = `
            function ${methodName}(addr, req, res?) {
                if (res !== UNHANDLED) return res;                                              #if ${!startsPartition}
                var captures${methodName} = caps${methodName}(addr);                            #if ${hasCaptures}
                var res = exec${methodName}(${handlerArgs});                                    #if ${!endsPartition}
                if (isPromise(res)) return res.then(rs => ${nextMethodName}(addr, req, rs));    #if ${!endsPartition}
                return ${nextMethodName}(addr, req, res);                                       #if ${!endsPartition}
                return exec${methodName}(${handlerArgs});                                       #if ${endsPartition}
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
