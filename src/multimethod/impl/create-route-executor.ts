//TODO: review all comments in here...
import * as util from '../../util';
import RouteExecutor from './route-executor';
import Rule from './rule';
import * as unhandled from './unhandled';





// Declare isPromise and UNHANDLED in module scope, so the eval'ed route handlers below can reference them. NB: the source code
// for eval cannot safely refer directly to expressions like `util.isPromiseLike`, since the `util` identifier may not
// appear in the transpiled JavaScript for this module. This is because TypeScript may rename modules to try to preserve
// ES6 module semantics.
let isPromise = util.isPromiseLike;
let UNHANDLED = unhandled.default;





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
        'var FROZEN_EMPTY_OBJECT = Object.freeze({});',                 // TODO: note ES6 in source here
        'function ℙØ(disc, result, $0) {\n    return UNHANDLED;\n}',    // TODO: anything refs this ever??
        generateRouteExecutorSourceCode(rules, ruleNames),
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
// console.log('\n\n\n\n<----------------------->');
// let allLines = lines.join('\n');
// console.log(allLines);
// console.log('</----------------------->');

    return fn;
}





/**
 * Helper function to generate source code for a set of interdependent functions (one per rule) that perform the
 * cascading evaluation of a route, accounting for the possibly mixed sync/async implementation of the rule handlers.
 */
function generateRouteExecutorSourceCode(rules: Rule[], ruleNames: string[]): string {

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
        let isMetaRule = method.isMetaRule;


        let DELEGATE_DOWNSTREAM;    // ${downstreamMethodName}
        let DELEGATE_NEXT;          // ${nextMethodName}
        let EXECUTE_THIS;           // exec${methodName}
        let MATCH;                  // caps${methodName}
        let FROZEN_EMPTY_OBJECT;


        // TODO: note ES6 in source here - spread and rest (...MM_ARGS)
        let test_fn = function METHOD_NAME(disc: string, result: any, ...MM_ARGS: any[]) {
            if (!startsPartition) {
                if (result !== UNHANDLED) {
                    return result;
                }
            }
            if (hasCaptures) {
                var context = MATCH(disc);
            }
            if (!hasCaptures) {
                if (isMetaRule) {
                    var context: any = {};
                }
                if (!isMetaRule) {
                    var context = FROZEN_EMPTY_OBJECT;
                }
            }
            if (isMetaRule) {
                // TODO: need to ensure there is no capture named `next`
                context.next = (...MM_ARGS) => DELEGATE_DOWNSTREAM(disc, UNHANDLED, ...MM_ARGS);
            }

            if (!endsPartition) {
                result = EXECUTE_THIS(context, ...MM_ARGS);
                if (isPromise(result)) {
                    return result.then(rs => DELEGATE_NEXT(disc, rs, ...MM_ARGS));
                }
                else {
                    return DELEGATE_NEXT(disc, result, ...MM_ARGS);
                }
            }
            if (endsPartition) {
                return EXECUTE_THIS(context, ...MM_ARGS);
            }
        }

        // TODO:
        // 1. un-evaluate (i.e. stringify)
        let source = test_fn.toString();
        let srcLines = source.split(/[\r\n]+/); // NB: this removed blank lines too

        // 2. dedent
        let dedentCount = srcLines[1].match(/^[ ]+/)[0].length - 4;
        srcLines = [].concat(srcLines.shift(), ...srcLines.map(line => line.slice(dedentCount)));

        // 3. eliminate dead code
        srcLines = eliminateDeadCode(srcLines, {startsPartition, isMetaRule, hasCaptures, endsPartition});
        source = srcLines.join('\n');

        // 4. string replace
        source = source.replace(/METHOD_NAME/g, methodName);
        source = source.replace(/DELEGATE_DOWNSTREAM/g, downstreamMethodName);
        source = source.replace(/MATCH/g, `caps${methodName}`);
        source = source.replace(/EXECUTE_THIS/g, `exec${methodName}`);
        source = source.replace(/DELEGATE_NEXT/g, nextMethodName);

        // 5. done
        return source;
    });

    // Combine and return all the sources.
    return sources.join('\n');
}















const MATCH_IF = /^(\s*)if \((\!?)([a-z$_][a-z0-9$_]*)\) \{$/i;





// TODO: assumes consistent 4-space block indents, no elses, simple conditions... relax any of these?
// TODO: support simple `else`!
function eliminateDeadCode(inLines: string[], consts: {[name: string]: boolean}): string[] {
    let outLines: string[] = [];
    while (inLines.length > 0) {
        let inLine = inLines.shift();

        let matches = MATCH_IF.exec(inLine);
        if (!matches || !consts.hasOwnProperty(matches[3])) {
            outLines.push(inLine);
            continue;
        }

        let indent = matches[1];
        let isNegated = matches[2] === '!';
        let constName = matches[3];
        let isElided = consts[constName] === isNegated;
        let blockLines: string[] = [];
        let blockClose = indent + '}';

        // TODO: support recursion...
        while ((inLine = inLines.shift()) !== blockClose) {
            blockLines.push(inLine.slice(4));
        }
        if (!isElided) {
            outLines = outLines.concat(...eliminateDeadCode(blockLines, consts));
        }

        // while (inLines[0] !== blockClose) { // TODO: lots happening here, split into several lines?
        //     inLine = inLines.shift();
        //     if (!isElided) {
        //         outLines.push(inLine.slice(4));
        //     }
        // }
    }

    return outLines;
}
