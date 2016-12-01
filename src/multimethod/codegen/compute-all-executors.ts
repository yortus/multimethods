import downlevelES6Rest from './transforms/downlevel-es6-rest';
import downlevelES6Spread from './transforms/downlevel-es6-spread';
import eliminateDeadCode from './transforms/eliminate-dead-code';
import getNormalisedFunctionSource from './get-normalised-function-source';
import MultimethodOptions from '../multimethod-options';
import replaceAll from './transforms/replace-all';
import routeExecutorTemplate from './route-executor-template';
import Rule from '../rule';
import Taxonomy, {TaxonomyNode} from '../../taxonomy';





// TODO: temp testing...
export interface WithRoute {
    route: Rule[];
};
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
export default function computeAllExecutors(taxonomy: Taxonomy<WithRoute>, options: MultimethodOptions) {

    let augmentedTaxomony = taxonomy.augment(node => {

        // TODO: doc...
        let rulesWithDuplicatesRemoved = node.route.filter(rule => rule.isMetaRule || taxonomy.get(rule.predicate) === node);
        let sources = rulesWithDuplicatesRemoved.map(rule => getSourceCodeForRule(taxonomy, node, rule, options) + '\n');
        let source = [`// ========== EXECUTORS FOR ${node.pattern} ==========\n`].concat(sources).join('');

        // TODO: temp testing...
        // The 'entry point' rule is the one whose method we call to begin the cascading evaluation of the route. It is the
        // least-specific meta-rule, or if there are no meta-rules, it is the most-specific ordinary rule.
        let rules = node.route;
        let entryPointRule = rules.filter(rule => rule.isMetaRule).pop() || rules[0];
        let entryPoint = getNameForRule(taxonomy, node, entryPointRule);

        return <WithExecutors> { source, entryPoint };
    });
    return augmentedTaxomony;
}





// TODO: ...
function getSourceCodeForRule(taxonomy: Taxonomy<WithRoute>, node: TaxonomyNode & WithRoute, rule: Rule, options: MultimethodOptions) {
    let name = getNameForRule(taxonomy, node, rule);

    // TODO: to get copypasta'd code working... revise...
    let i = node.route.indexOf(rule);
    let rules = node.route;

    // TODO: start with the template...
    let source = getNormalisedFunctionSource(routeExecutorTemplate);

    // TODO: temp testing...
    let downstreamRule = rules.filter((_, j) => (j === 0 || rules[j].isMetaRule) && j < i).pop();
    let getCaptures = `get${i ? 'Rule' + (i + 1) : ''}CapturesFor${node.pattern.identifier}`;
    let callMethod = `call${i ? 'Rule' + (i + 1) : ''}MethodFor${node.pattern.identifier}`;

    // For each rule, we reuse the source code template below. But first we need to compute a number of
    // values for substitution into the template. A few notes on these substitutions:
    // - `nextRuleName` is used for cascading evaluation, i.e. when the current rule handler returns UNHANDLED.
    // - `downstreamRuleName` refers to the first rule in the next more-specific partition (see JSDoc notes at top
    //   of this file). It is substituted in as the value of `$next` when a meta-rule's method is called.
    // - `handlerArgs` is a hash keyed by all possible parameter names a rule's raw handler may use, and whose
    //   values are the source code for the argument corresponding to each parameter.

    // TODO: ... all booleans
    source = eliminateDeadCode(source, {
        ENDS_PARTITION: i === rules.length - 1 || rules[i + 1].isMetaRule,
        HAS_CAPTURES: rule.predicate.captureNames.length > 0,
        IS_META_RULE: rule.isMetaRule,
        HAS_DOWNSTREAM: downstreamRule != null,
        IS_PURE_SYNC: options.timing === 'sync',
        IS_PURE_ASYNC: options.timing === 'async'
    });

    // TODO: ... all strings
    source = replaceAll(source, {
        METHOD_NAME: getNameForRule(taxonomy, node, rule),
        GET_CAPTURES: getCaptures,
        CALL_METHOD: callMethod,
        DELEGATE_DOWNSTREAM: downstreamRule ? getNameForRule(taxonomy, node, downstreamRule) : '',
        DELEGATE_NEXT: i < rules.length - 1 ? getNameForRule(taxonomy, node, rules[i + 1]) : ''
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
    if (rule.predicate.captureNames.length > 0) {
        source = source + `\nvar ${getCaptures} = taxonomy.get('${node.pattern.normalized}').route[${i}].predicate.match;`
    }
    source = source + `\nvar ${callMethod} = taxonomy.get('${node.pattern.normalized}').route[${i}].method;`;

    // All done for this iteration.
    return source;
}





// TODO: ...
function getNameForRule(taxonomy: Taxonomy<WithRoute>, node: TaxonomyNode & WithRoute, rule: Rule) {
    let ruleNode = taxonomy.get(rule.predicate.normalized);
    let ruleIndex = ruleNode.route.indexOf(rule);

    if (rule.isMetaRule) {
        return `tryMetaRule${ruleIndex ? ruleIndex + 1 : ''}For${ruleNode.pattern.identifier}Within${node.pattern.identifier}`;
    }
    else {
        return `tryRule${ruleIndex ? ruleIndex + 1 : ''}For${ruleNode.pattern.identifier}`;
    }
}
