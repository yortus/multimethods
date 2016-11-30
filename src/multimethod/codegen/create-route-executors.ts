//TODO: review all comments in here...
import * as util from '../../util';
import MultimethodOptions from '../multimethod-options';
import Pattern from '../../pattern';
import RouteExecutor from './route-executor';
import routeExecutorTemplate from './route-executor-template';
import Rule from '../impl/rule';
import Taxonomy, {TaxonomyNode} from '../../taxonomy';





// TODO: temp testing...
export type WithRoute = {route: Rule[]}





// TODO: ...
export default function createRouteExecutors(taxonomy: Taxonomy<WithRoute>, normalisedOptions: MultimethodOptions) {

    // TODO: temp testing...
    const UNHANDLED = normalisedOptions.unhandled;

    // TODO: temp testing...
//let routes = new Map(taxonomy.allNodes.map(node => [node.pattern, node.route] as [Pattern, Rule[]]));
    //let allRules: Rule[] = [...new Set([].concat(...routes.values())).values()];

    // Generate the combined source code for handling the route. This includes local variable declarations for
    // all rules' matchers and methods, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of the route.
    let lines = [

        // ...allRules
        //     .map((rule, i) => `var ${getCapturesFor}${getNameForRule(rule)} = allRules[${i}].predicate.match;`)
        //     .filter((_, i) => allRules[i].predicate.captureNames.length > 0),

        // ...allRules.map((rule, i) => `var ${invokeMethodFor}${getNameForRule(rule)} = allRules[${i}].method;`),

        `return {`,

        ...taxonomy.allNodes.map(node => generateExecutorSourceCode(node, normalisedOptions)),

        `};`
    ];

    // FOR DEBUGGING: uncomment the following line to see the generated code for each route executor at runtime.
    console.log(`\n\n\n================ ROUTE EXECUTORS ================\n${lines.join('\n')}`);

// TODO: switch to `new Function` with closed over vars passed as params (as done in bluebird)
    // Evaluate the source code, and return its result, which is the composite route handler function. The use of eval
    // here is safe. There are no untrusted inputs substituted into the source. The client-provided rule handler
    // functions can do anything (so may be considered untrusted), but that has nothing to do with the use of 'eval'
    // here, since they would need to be called by the route handler whether or not eval was used. More importantly,
    // the use of eval here allows for route handler code that is both more readable and more efficient, since it is
    // tailored specifically to the route being evaluated, rather than having to be generalized for all possible cases.
    let executors: {[pattern: string]: RouteExecutor} = eval(`(() => {\n${lines.join('\n')}\n})`)();
    return executors;
}





// Declare isPromise in module scope, so the eval'ed route handlers below can reference it. NB: the source code
// for eval cannot safely refer directly to expressions like `util.isPromiseLike`, since the `util` identifier may not
// appear in the transpiled JavaScript for this module. This is because TypeScript may rename modules to try to preserve
// ES6 module semantics.
const isPromise = util.isPromiseLike;





// TODO: temp testing... these are ref'ed in codegen code and never change
const FROZEN_EMPTY_OBJECT = Object.freeze({});
const ℙØ = (discriminant, result) => result; // ND: *always* called with result = UNHANDLED





// TODO: ...
const getCapturesFor = 'getCapturesFor';
const invokeMethodFor = 'invokeMethodFor';





// TODO: was... superseded by above/below code... extract out comments/useful stuff then remove...
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
 * being passed as the ctx.next parameter to the meta-rule starting the previous (less-specific) partition.
 * @param {Rule[]} rules - the list of rules comprising the route, ordered from least- to most-specific.
 * @returns {Method} the composite method for the route.
 */
// function createRouteExecutor(pattern: Pattern, rules: Rule[], options: MultimethodOptions): RouteExecutor {
//     // TODO: pattern parameter not used - remove it or use it?

//     // TODO: temp testing...
//     const UNHANDLED = options.unhandled;

//     // Obtain a reversed copy of the rule list, ordered from most- to least-specific. This simplifies logic below.
//     rules = rules.slice().reverse();

//     // The 'start' rule is the one whose method we call to begin the cascading evaluation of the route. It is the
//     // least-specific meta-rule, or if there are no meta-rules, it is the most-specific ordinary rule.
//     let startMethodName = (rules.filter(rule => rule.isMetaRule).pop() || rules[0]).name;

//     // Generate the combined source code for handling the route. This includes local variable declarations for
//     // all rules' matchers and methods, as well as the interdependent function declarations that perform
//     // the cascading, and possibly asynchronous, evaluation of the route.
//     let lines = [
//         ...rules
//             .map((rule, i) => `var ${getCapturesFor}${rule.name} = rules[${i}].predicate.match;`)
//             .filter((_, i) => rules[i].predicate.captureNames.length > 0),
//         ...rules.map((rule, i) => `var ${invokeMethodFor}${rule.name} = rules[${i}].method;`),
//         generateExecutorSourceCode(rules, options),
//         `return ${startMethodName};`
//     ];

//     // FOR DEBUGGING: uncomment the following line to see the generated code for each route executor at runtime.
//     console.log(`\n\n\n================ ROUTE EXECUTOR for ${startMethodName} ================\n${lines.join('\n')}`);

// // TODO: switch to `new Function` with closed over vars passed as params (as done in bluebird)
//     // Evaluate the source code, and return its result, which is the composite route handler function. The use of eval
//     // here is safe. There are no untrusted inputs substituted into the source. The client-provided rule handler
//     // functions can do anything (so may be considered untrusted), but that has nothing to do with the use of 'eval'
//     // here, since they would need to be called by the route handler whether or not eval was used. More importantly,
//     // the use of eval here allows for route handler code that is both more readable and more efficient, since it is
//     // tailored specifically to the route being evaluated, rather than having to be generalized for all possible cases.
//     let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
//     return fn;
// }





/**
 * Helper function to generate source code for a set of interdependent functions (one per rule) that perform the
 * cascading evaluation of a route, accounting for the possibly mixed sync/async implementation of the rule handlers.
 */
function generateExecutorSourceCode(node: TaxonomyNode & WithRoute, options: MultimethodOptions): string {

    // Obtain a reversed copy of the rule list, ordered from most- to least-specific. This simplifies logic below.
    let rules = node.route;

    // TODO: copypasta from above... pass this in? or out? or factor into own function?
    // The 'start' rule is the one whose method we call to begin the cascading evaluation of the route. It is the
    // least-specific meta-rule, or if there are no meta-rules, it is the most-specific ordinary rule.
    let entryPointRule = rules.filter(rule => rule.isMetaRule).pop() || rules[0]
    let entryPointName = `${entryPointRule.predicate.identifier}_${rules.indexOf(entryPointRule)}`;

    // Generate source code for each rule in turn.
    let sources = rules.map((rule, i) => {

        // For each rule, we reuse the source code template below. But first we need to compute a number of
        // values for substitution into the template. A few notes on these substitutions:
        // - `nextRuleName` is used for cascading evaluation, i.e. when the current rule handler returns UNHANDLED.
        // - `downstreamRuleName` refers to the first rule in the next more-specific partition (see JSDoc notes at top
        //   of this file). It is substituted in as the value of `$next` when a meta-rule's method is called.
        // - `handlerArgs` is a hash keyed by all possible parameter names a rule's raw handler may use, and whose
        //   values are the source code for the argument corresponding to each parameter.


        // TODO:
        let source = routeExecutorTemplate.toString();
        source = normaliseSource(source);
        source = eliminateDeadCode(source, {
            STARTS_PARTITION: i === 0 || rule.isMetaRule,
            ENDS_PARTITION: i === rules.length - 1 || rules[i + 1].isMetaRule,
            HAS_CAPTURES: rule.predicate.captureNames.length > 0,
            IS_META_RULE: rule.isMetaRule,
            IS_PURE_SYNC: options.timing === 'sync',
            IS_PURE_ASYNC: options.timing === 'async'
        });

// TODO: temp testing...
let downstreamRule = rules.filter((_, j) => (j === 0 || rules[j].isMetaRule) && j < i).pop();
let downstreamName = downstreamRule ? `${downstreamRule.predicate.identifier}_${rules.indexOf(downstreamRule)}` : 'ℙØ';

        source = replaceAll(source, {
            METHOD_NAME: `${rule.predicate.identifier}_${i}`,
            GET_CAPTURES: `${getCapturesFor}${rule.predicate.identifier}_${i}`,
            CALL_METHOD: `${invokeMethodFor}${rule.predicate.identifier}_${i}`,
            DELEGATE_DOWNSTREAM: downstreamName,
            DELEGATE_NEXT: i < rules.length - 1 ? `${rules[i + 1].predicate.identifier}_${i + 1}` : null
        });

        // TODO: temp testing... specialise for arity...
        if (typeof options.arity === 'number') {
            let replacement = [...Array(options.arity).keys()].map(key => '_' + key).join(', '); // TODO: ES6 stuff here...
            source = source.replace(/\.\.\.MM_ARGS/g, replacement);
        }
        else if (options.emitES5) {
            source = downlevelES6Rest(source);
            source = downlevelES6Spread(source);
        }

// TODO: temp testing...
source = `var ${invokeMethodFor}${rule.predicate.identifier}_${i} = taxonomy.get('${node.pattern.normalized}').route[${i}].method;\n${source}`;
if (rule.predicate.captureNames.length > 0) {
    source = `var ${getCapturesFor}${rule.predicate.identifier}_${i} = taxonomy.get('${node.pattern.normalized}').route[${i}].predicate.match;\n${source}`
}

        return source;
    });

    sources = [].concat(...sources.map(lines => lines.split('\n')));
    sources = sources.map(line => '        ' + line);

    // Combine and return all the sources into an IIFE that returns the executor's entry point.
// TODO: temp testing...
let namesake = rules[0].predicate.identifier;
    return `\n    ${namesake}: (function () {\n${sources.join('\n')}\n        return ${entryPointName};\n    })(),`;  // TODO: ES2017 trailing comma will break stuff!
}





// TODO: temp testing...
// function getNameForRule(rule: Rule) {
//     return rule.name;

//     // TODO: audit below - ensure it is not possible to craft a pattern whose identifier will be the same as an augmented rule name generated by this function

//     // if (rule.method.name === '_unhandled') {
//     //     return 'BIGDADDY'; // TODO: temp fix... always last method tried on every route (UNIVERSAL ROOT)
//     // }
//     // if (rule.method.name === '_ambiguous') {
//     //     return rule.predicate.identifier + '_ambiguous'; // TODO: see above comment - this *could* clash with another pattern identifier that was crafted to do that
//     // }
//     // else {
//     //     return rule.predicate.identifier;
//     // }
// }





// TODO: ... doc: 4-space indents, no blank lines, '\n' line endings
function normaliseSource(source: string): string {
    // TODO: verify/fix 4-space indents. Otherwise hard-to find bugs may creep in if devs alter the template function
    // TODO: -or- don't assume 4-space indents anymore?
    let lines = source.split(/[\r\n]+/); // NB: this removes blank lines too
    lines = lines.filter(line => !/^\s*\/\//.test(line)); // Remove comment lines
    let dedentCount = lines[1].match(/^[ ]+/)[0].length - 4;
    lines = [].concat(lines.shift(), ...lines.map(line => line.slice(dedentCount)));
    source = lines.join('\n');
    return source;
}





// TODO: assumes consistent 4-space block indents, simple conditions... relax any of these?
function eliminateDeadCode(source: string, consts: {[name: string]: boolean}): string {
    const MATCH_IF = /^(\s*)if \((\!?)([a-zA-Z$_][a-zA-Z0-9$_]*)\) {$/;
    const MATCH_ELSE = /^(\s*)else {$/;
    let inLines = source ? source.split('\n') : [];
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

        while ((inLine = inLines.shift()) !== blockClose) {
            blockLines.push(inLine.slice(4));
        }

        if (!isElided) {
            outLines = outLines.concat(eliminateDeadCode(blockLines.join('\n'), consts));
        }

        // TODO: handle 'else' blocks...
        if (inLines.length > 0 && MATCH_ELSE.test(inLines[0])) {
            inLines[0] = `${indent}if (${isNegated ? '' : '!'}${constName}) {`;
        }
    }

    return outLines.join('\n');
}





// TODO: ...
function replaceAll(source: string, replacements: {[identifier: string]: string}): string {
    let identifiers = Object.keys(replacements);
    let regexs = identifiers.map(id => new RegExp(id.replace(/\$/g, '\\$'), 'g'));
    for (let i = 0; i < identifiers.length; ++i) {
        let id = identifiers[i];
        let regex = regexs[i];
        let replacement = replacements[id];
        source = source.replace(regex, replacement);
    }
    return source;
}





// TODO: ...
function downlevelES6Rest(source: string): string {
    // TODO: ensure no other kinds of rest left behind afterward...

    // Matches (non-arrow) function headers with a rest argument
    const REGEX = /function([^(]*)\((.*?),\s*\.\.\.[^)]+\)\s*{\n(\s*)/gi;

    // ES5 equivalent for initialising the rest argument MM_ARGS
    const REST = `for (var MM_ARGS = [], len = arguments.length, i = 2; i < len; ++i) MM_ARGS.push(arguments[i]);`;

    return source.replace(REGEX, (substr, funcName: string, firstArgs: string, indent: string) => {
        return `function ${funcName}(${firstArgs}) {\n${indent}${REST}\n${indent}`;
    });
}





// TODO: ...
function downlevelES6Spread(source: string): string {
    // TODO: ensure no other kinds of spreads left behind afterward...

    // Matches argument list of function calls where the final argument is a spread expression
    let REGEX = /\(([^(]*?),\s*\.\.\.([^)]+)\)/gi;

    return source.replace(REGEX, (substr, firstArgs: string, finalSpreadArg: string) => {
        return `.apply(null, [${firstArgs}].concat(${finalSpreadArg}))`;
    });
}
