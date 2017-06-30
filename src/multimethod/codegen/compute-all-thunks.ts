import {LineageII} from '../compute-predicate-lineages-ii';
import MultimethodOptions from '../multimethod-options';
import {toIdentifierParts} from '../../set-theory/predicates';
import repeatString from '../../util/repeat-string';
import {emitThunkFunction} from './emit';
import Rule from '../rule';
import {EulerDiagram, EulerSet} from '../../set-theory/sets';
import isMetaHandler from '../is-meta-handler';





// TODO: temp testing...
export interface WithThunks {
    thunkSource: string;
    thunkName: string;
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
export default function computeAllThunks(eulerDiagram: EulerDiagram<LineageII>, options: MultimethodOptions) {

    let augmentedEulerDiagram = eulerDiagram.augment(set => {

        // TODO: doc...
        let sources = set.matchingRules.map(rule => getSourceCodeForRule(eulerDiagram, set, rule, options) + '\n');
        let thunkSource = sources.join('');

        // TODO: temp testing...
        // The 'entry point' rule is the one whose handler we call to begin the cascading evaluation of the route. It is the
        // least-specific meta-rule, or if there are no meta-rules, it is the most-specific ordinary rule.
        let rules = set.matchingRules;
        let entryPointRule = rules.filter(rule => isMetaHandler(rule.handler)).pop() || rules[0];
        let thunkName = getNameForRule(eulerDiagram, set, entryPointRule);

        return <WithThunks> { thunkSource, thunkName };
    });
    return augmentedEulerDiagram;
}





// TODO: ...
function getSourceCodeForRule(eulerDiagram: EulerDiagram<LineageII>, set: EulerSet & LineageII, rule: Rule, options: MultimethodOptions) {

    // TODO: to get copypasta'd code working... revise...
    let i = set.matchingRules.map(r => r.handler).indexOf(rule.handler);
    let rules = set.matchingRules;

    // TODO: explain... put a self-describing boolean var in the data structure...
    if (!set.matchingRules[i].callHandlerVarDecl) return '';
    //TODO: was... if (!rule.isMetaRule && eulerDiagram.get(rule.predicate) !== set) return '';

    // TODO: temp testing...
    let downstreamRule = rules.filter((_, j) => (j === 0 || isMetaHandler(rules[j].handler)) && j < i).pop();

    // For each rule, we reuse the source code template below. But first we need to compute a number of
    // values for substitution into the template. A few notes on these substitutions:
    // - `nextRuleName` is used for cascading evaluation, i.e. when the current rule handler returns CONTINUE.
    // - `downstreamRuleName` refers to the first rule in the next more-specific partition (see JSDoc notes at top
    //   of this file). It is substituted in as the value of `$next` when a meta-rule's method is called.
    // - `handlerArgs` is a hash keyed by all possible parameter names a rule's raw handler may use, and whose
    //   values are the source code for the argument corresponding to each parameter.

    // TODO: fix arity cast below when MMOptions type is fixed
    let source = emitThunkFunction(getNameForRule(eulerDiagram, set, rule), options.arity as number|undefined, {
        isPromise: 'isPromise',
        CONTINUE: 'CONTINUE',

        GET_CAPTURES: set.matchingRules[i].getCapturesVarName,
        CALL_HANDLER: set.matchingRules[i].callHandlerVarName,
        DELEGATE_DOWNSTREAM: downstreamRule ? getNameForRule(eulerDiagram, set, downstreamRule) : '',
        DELEGATE_NEXT: i < rules.length - 1 ? getNameForRule(eulerDiagram, set, rules[i + 1]) : '',

        // Statically known booleans --> 'true'/'false' literals (for dead code elimination in next step)
        ENDS_PARTITION: i === rules.length - 1 || isMetaHandler(rules[i + 1].handler),
        HAS_CAPTURES: set.matchingRules[i].getCapturesVarDecl !== null,
        IS_META_RULE: isMetaHandler(rule.handler),
        HAS_DOWNSTREAM: downstreamRule != null,
        IS_PURE_SYNC: options.timing === 'sync',
        IS_PURE_ASYNC: options.timing === 'async'
    });

    // All done for this iteration.
    return source;
}





// TODO: ...
function getNameForRule(eulerDiagram: EulerDiagram<LineageII>, set: EulerSet & LineageII, rule: Rule) {
    let ruleNode = eulerDiagram.get(rule.predicate);
    let ruleIndex = ruleNode.matchingRules.map(r => r.handler).indexOf(rule.handler);
    let ruleIdentifier = toIdentifierParts(ruleNode.predicate);

    if (isMetaHandler(rule.handler)) {
        let nodeIdentifier = toIdentifierParts(set.predicate);
        return `thunkː${nodeIdentifier}ːviaMetaː${ruleIdentifier}${repeatString('ᐟ', ruleIndex)}`;
    }
    else {
        return `thunkː${ruleIdentifier}${repeatString('ᐟ', ruleIndex)}`;
    }
}
