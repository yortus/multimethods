import downlevelES6Rest from './transforms/downlevel-es6-rest';
import downlevelES6Spread from './transforms/downlevel-es6-spread';
import eliminateDeadCode from './transforms/eliminate-dead-code';
import getNormalisedFunctionSource from './get-normalised-function-source';
import {Lineage} from '../compute-predicate-lineages';
import MultimethodOptions from '../multimethod-options';
import {toIdentifier, parsePredicatePattern, toNormalPredicate} from '../../set-theory/predicates';
import replaceAll from './transforms/replace-all';
import routeExecutorTemplate from './route-executor-template';
import Rule from '../rule';
import {EulerDiagram, Set} from '../../set-theory/sets';





// TODO: temp testing...
export interface WithExecutors {
    source: string;
    entryPoint: string;
};





// TODO: rewrite comments. Esp signature of route executor matches signature of multimethod (as per provided Options)

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
export default function computeAllExecutors(eulerDiagram: EulerDiagram<Lineage>, options: MultimethodOptions) {

    let augmentedEulerDiagram = eulerDiagram.augment(set => {

        // TODO: doc...
        let rulesWithDuplicatesRemoved = set.lineage.filter(rule => rule.isMetaRule || eulerDiagram.get(rule.predicate) === set);
        let sources = rulesWithDuplicatesRemoved.map(rule => getSourceCodeForRule(eulerDiagram, set, rule, options) + '\n');
        let source = [`// ========== EXECUTORS FOR ${set.predicate} ==========\n`].concat(sources).join('');

        // TODO: temp testing...
        // The 'entry point' rule is the one whose method we call to begin the cascading evaluation of the route. It is the
        // least-specific meta-rule, or if there are no meta-rules, it is the most-specific ordinary rule.
        let rules = set.lineage;
        let entryPointRule = rules.filter(rule => rule.isMetaRule).pop() || rules[0];
        let entryPoint = getNameForRule(eulerDiagram, set, entryPointRule);

        return <WithExecutors> { source, entryPoint };
    });
    return augmentedEulerDiagram;
}





// TODO: ...
function getSourceCodeForRule(eulerDiagram: EulerDiagram<Lineage>, set: Set & Lineage, rule: Rule, options: MultimethodOptions) {

    // TODO: to get copypasta'd code working... revise...
    let i = set.lineage.indexOf(rule);
    let rules = set.lineage;

    // TODO: start with the template...
    let source = getNormalisedFunctionSource(routeExecutorTemplate);

    // TODO: temp testing...
    let downstreamRule = rules.filter((_, j) => (j === 0 || rules[j].isMetaRule) && j < i).pop();
    let predicateIdentifier = toIdentifier(set.predicate);
    let getCaptures = `get${i ? 'Rule' + (i + 1) : ''}CapturesFor${predicateIdentifier}`;
    let callMethod = `call${i ? 'Rule' + (i + 1) : ''}MethodFor${predicateIdentifier}`;
    let captureNames = parsePredicatePattern(rule.predicate.toString()).captureNames;

    // For each rule, we reuse the source code template below. But first we need to compute a number of
    // values for substitution into the template. A few notes on these substitutions:
    // - `nextRuleName` is used for cascading evaluation, i.e. when the current rule handler returns UNHANDLED.
    // - `downstreamRuleName` refers to the first rule in the next more-specific partition (see JSDoc notes at top
    //   of this file). It is substituted in as the value of `$next` when a meta-rule's method is called.
    // - `handlerArgs` is a hash keyed by all possible parameter names a rule's raw handler may use, and whose
    //   values are the source code for the argument corresponding to each parameter.

    // TODO: ... all booleans
    source = eliminateDeadCode(source, {
        IS_TRACING: options.trace,
        ENDS_PARTITION: i === rules.length - 1 || rules[i + 1].isMetaRule,
        HAS_CAPTURES: captureNames.length > 0,
        IS_META_RULE: rule.isMetaRule,
        HAS_DOWNSTREAM: downstreamRule != null,
        IS_PURE_SYNC: options.timing === 'sync',
        IS_PURE_ASYNC: options.timing === 'async'
    });

    // TODO: ... all strings
    source = replaceAll(source, {
        METHOD_NAME: getNameForRule(eulerDiagram, set, rule),
        GET_CAPTURES: getCaptures,
        CALL_METHOD: callMethod,
        DELEGATE_DOWNSTREAM: downstreamRule ? getNameForRule(eulerDiagram, set, downstreamRule) : '',
        DELEGATE_NEXT: i < rules.length - 1 ? getNameForRule(eulerDiagram, set, rules[i + 1]) : ''
    });

    // TODO: temp testing... specialise for arity...
    if (typeof options.arity === 'number') {
        let paramNames = [];
        for (let i = 0; i < options.arity; ++i) paramNames.push('$' + i);
        source = source.replace(/\.\.\.MM_ARGS/g, paramNames.join(', '));
    }
    else if (options.emitES5) {
        source = downlevelES6Rest(source);
        source = downlevelES6Spread(source);
    }

    // TODO: temp testing... brittle!!! use real code -> toString -> augment -> eval like elsewhere
    if (captureNames.length > 0) {
        source = source + `\nvar ${getCaptures} = toMatchFunction(eulerDiagram.get('${toNormalPredicate(set.predicate)}').lineage[${i}].predicate.toString());` // TODO: too long and complex! fix me!!!
    }
    source = source + `\nvar ${callMethod} = eulerDiagram.get('${toNormalPredicate(set.predicate)}').lineage[${i}].method;`;

    // All done for this iteration.
    return source;
}





// TODO: ...
function getNameForRule(eulerDiagram: EulerDiagram<Lineage>, set: Set & Lineage, rule: Rule) {
    let ruleNode = eulerDiagram.get(rule.predicate);
    let ruleIndex = ruleNode.lineage.indexOf(rule);
    let ruleIdentifier = toIdentifier(ruleNode.predicate);

    if (rule.isMetaRule) {
        let nodeIdentifier = toIdentifier(set.predicate);
        return `tryMetaRule${ruleIndex ? ruleIndex + 1 : ''}For${ruleIdentifier}Within${nodeIdentifier}`;
    }
    else {
        return `tryRule${ruleIndex ? ruleIndex + 1 : ''}For${ruleIdentifier}`;
    }
}
