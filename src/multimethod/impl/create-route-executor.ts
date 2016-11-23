//TODO: review all comments in here...
import * as util from '../../util';
import MultimethodOptions from '../multimethod-options';
import RouteExecutor from './route-executor';
import Rule from './rule';





// Declare isPromise in module scope, so the eval'ed route handlers below can reference it. NB: the source code
// for eval cannot safely refer directly to expressions like `util.isPromiseLike`, since the `util` identifier may not
// appear in the transpiled JavaScript for this module. This is because TypeScript may rename modules to try to preserve
// ES6 module semantics.
const isPromise = util.isPromiseLike;





// TODO: ...
const getCapturesFor = 'getCapturesFor';
const callMethodFor = 'callMethodFor';





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
export default function createRouteExecutor(rules: Rule[], options: MultimethodOptions): RouteExecutor {

    // TODO: temp testing...
    const UNHANDLED = options.unhandled;
    const arity = options.arity;

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
        ...ruleNames.map((name, i) => `var ${getCapturesFor}${name} = rules[${i}].predicate.match;`),
        ...ruleNames.map((name, i) => `var ${callMethodFor}${name} = rules[${i}].method;`),
        'var FROZEN_EMPTY_OBJECT = Object.freeze({});',                 // TODO: note ES6 in source here
        'function ℙØ(discriminant, result, $0) {\n    return UNHANDLED;\n}',    // TODO: anything refs this ever??
        generateRouteExecutorSourceCode(rules, ruleNames, arity),
        `return ${startMethodName};`
    ];

    // FOR DEBUGGING: uncomment the following line to see the generated code for each route executor at runtime.
    console.log(`\n\n\n================ ROUTE EXECUTOR for ${startMethodName} ================\n${lines.join('\n')}`);

// TODO: switch to `new Function` with closed over vars passed as params (as done in bluebird)
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
function generateRouteExecutorSourceCode(rules: Rule[], ruleNames: string[], arity: number|undefined): string {

    // Generate source code for each rule in turn.
    let sources = rules.map((method, i) => {

        // For each rule, we reuse the source code template below. But first we need to compute a number of
        // values for substitution into the template. A few notes on these substitutions:
        // - `nextRuleName` is used for cascading evaluation, i.e. when the current rule handler returns UNHANDLED.
        // - `downstreamRuleName` refers to the first rule in the next more-specific partition (see JSDoc notes at top
        //   of this file). It is substituted in as the value of `$next` when a meta-rule's method is called.
        // - `handlerArgs` is a hash keyed by all possible parameter names a rule's raw handler may use, and whose
        //   values are the source code for the argument corresponding to each parameter.


        // TODO:
        let source = template.toString();
        source = normaliseSource(source);
        source = eliminateDeadCode(source, {
            STARTS_PARTITION: i === 0 || method.isMetaRule,
            ENDS_PARTITION: i === rules.length - 1 || rules[i + 1].isMetaRule,
            HAS_CAPTURES: method.predicate.captureNames.length > 0,
            IS_META_RULE: method.isMetaRule
        });
        source = replaceAll(source, {
            METHOD_NAME: ruleNames[i],
            GET_CAPTURES: `${getCapturesFor}${ruleNames[i]}`,
            CALL_METHOD: `${callMethodFor}${ruleNames[i]}`,
            DELEGATE_DOWNSTREAM: ruleNames.filter((n, j) => (j === 0 || rules[j].isMetaRule) && j < i).pop() || 'ℙØ',
            DELEGATE_NEXT: ruleNames[i + 1]
        });

        // TODO: temp testing... specialise for arity...
        if (typeof arity === 'number') {
            let replacement = [...Array(arity).keys()].map(key => '_' + key).join(', '); // TODO: ES6 stuff here...
            source = source.replace(/\.\.\.MM_ARGS/g, replacement);
        }


        return source;
    });

    // Combine and return all the sources.
    return sources.join('\n');
}





// TODO: explain each of these in turn...
let UNHANDLED: any;
let STARTS_PARTITION: boolean;
let ENDS_PARTITION: boolean;
let HAS_CAPTURES: boolean;
let IS_META_RULE: boolean;
let METHOD_NAME: string;
let DELEGATE_DOWNSTREAM: RouteExecutor;
let DELEGATE_NEXT: RouteExecutor;
let GET_CAPTURES: (discriminant: string) => {};
let CALL_METHOD: (context: any, ...args: any[]) => any; // Method signature
let FROZEN_EMPTY_OBJECT: {};


// TODO: note ES6 in source here - spread and rest (...MM_ARGS)
// TODO: explain important norms in the template function...
// TODO: don't need to dedent any more!
let template = function METHOD_NAME(discriminant: string, result: any, ...MM_ARGS: any[]) {
    if (!STARTS_PARTITION) {
        if (result !== UNHANDLED) {
            return result;
        }
    }
    if (HAS_CAPTURES) {
        var context = GET_CAPTURES(discriminant);
    }
    if (!HAS_CAPTURES) {
        if (IS_META_RULE) {
            var context = {};
        }
        if (!IS_META_RULE) {
            var context = FROZEN_EMPTY_OBJECT;
        }
    }
    if (IS_META_RULE) {
        // TODO: need to ensure there is no capture named `next`
        context['next'] = (...MM_ARGS) => DELEGATE_DOWNSTREAM(discriminant, UNHANDLED, ...MM_ARGS);
    }

    if (!ENDS_PARTITION) {
        result = CALL_METHOD(context, ...MM_ARGS);
        if (isPromise(result)) {
            return result.then(rs => DELEGATE_NEXT(discriminant, rs, ...MM_ARGS));
        }
        else {
            return DELEGATE_NEXT(discriminant, result, ...MM_ARGS);
        }
    }
    if (ENDS_PARTITION) {
        return CALL_METHOD(context, ...MM_ARGS);
    }
}










// TODO: ... doc: 4-space indents, no blank lines, '\n' line endings
function normaliseSource(source: string): string {
    // TODO: verify/fix 4-space indents. Otherwise hard-to find bugs may creep in if devs alter the template function
    // TODO: -or- don't assume 4-space indents anymore?
    let lines = source.split(/[\r\n]+/); // NB: this removes blank lines too
    let dedentCount = lines[1].match(/^[ ]+/)[0].length - 4;
    lines = [].concat(lines.shift(), ...lines.map(line => line.slice(dedentCount)));
    source = lines.join('\n');
    return source;
}





// TODO: assumes consistent 4-space block indents, no elses, simple conditions... relax any of these?
// TODO: support simple `else`!
function eliminateDeadCode(source: string, consts: {[name: string]: boolean}): string {
    const MATCH_IF = /^(\s*)if \((\!?)([a-z$_][a-z0-9$_]*)\) \{$/i;
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

        // TODO: support recursion...
        while ((inLine = inLines.shift()) !== blockClose) {
            blockLines.push(inLine.slice(4));
        }
        if (!isElided) {
            outLines = outLines.concat(eliminateDeadCode(blockLines.join('\n'), consts));
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
