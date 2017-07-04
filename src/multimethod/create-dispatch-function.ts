import computePredicateLineages from './compute-predicate-lineages';
import computePredicateLineagesII from './compute-predicate-lineages-ii';
import generateMultimethod from './codegen/generate-multimethod';
import MultimethodOptions from './multimethod-options';
import normaliseRules from './normalise-rules';
import {EulerDiagram, EulerSet} from '../set-theory/sets';
import {toNormalPredicate, NormalPredicate} from '../set-theory/predicates';
import {validateEulerDiagram} from './validate';
import debug, {VALIDATE} from '../util/debug';

import getLongestCommonPrefix from '../util/get-longest-common-prefix';
import getLongestCommonSuffix from '../util/get-longest-common-suffix';
import isMetaHandler from './is-meta-handler';
import fatalError from '../util/fatal-error';
import {toIdentifierParts, toMatchFunction, parsePredicateSource as parse, toPredicate, Predicate} from '../set-theory/predicates';
import {CONTINUE} from './sentinels';





// TODO: review all comments here - eg refs to 'RuleSet' should be updated to Multimethod, etc
/** Internal function used to generate the RuleSet#execute method. */
export default function createDispatchFunction(normalisedOptions: MultimethodOptions) {

    // TODO: ...
    let normalisedRules = normaliseRules(normalisedOptions.rules);

    // Generate a taxonomic arrangement of all the predicate patterns that occur in the rule set.
    let eulerDiagram = new EulerDiagram(normalisedRules.map(rule => rule.predicate));


// TODO: temp testing...
let mminfo = createMMInfo(eulerDiagram, normalisedOptions);
mminfo


    // TODO: explain...
    if (debug.enabled) {
        let problems = validateEulerDiagram(eulerDiagram, normalisedOptions);
        problems.forEach(problem => debug(`${VALIDATE} %s`, problem));
    }

    // Find every possible functionally-distinct route that any discriminant can take through the rule set.
    let eulerDiagramWithLineages = computePredicateLineages(eulerDiagram, normalisedRules);
    let eulerDiagramWithLineagesII = computePredicateLineagesII(eulerDiagramWithLineages);

    // TODO: ...
    let dispatchFunction = generateMultimethod(eulerDiagramWithLineagesII, normalisedOptions);
    return dispatchFunction;
}





// TODO: doc...
interface MMInfo {
    nodes: MMNode[];
}
interface MMNode {
    predicate: Predicate;
    handlers: Function[];
    fallback: MMNode|null;

    identifier: string;
    isMatch(discriminant: string): object/*truthy*/|null/*falsy*/; // TODO: use like a boolean...
    getCaptures(discriminant: string): {[captureName: string]: string};
}





// TODO: temp testing...
function createMMInfo(eulerDiagram: EulerDiagram, normalisedOptions: MultimethodOptions): MMInfo {

    // Augment sets with exactly-matching handlers in most- to least-specific order.
    let euler2 = eulerDiagram.augment(set => {
        let predicateInRule = findMatchingPredicateInRules(set.predicate, normalisedOptions.rules) || set.predicate;

        // Find the index in the chain where meta-handlers end and regular handlers begin.
        let chain = normalisedOptions.rules[predicateInRule] || [];
        if (!Array.isArray(chain)) chain = [chain];
        let i = 0;
        while (i < chain.length && isMetaHandler(chain[i])) ++i;
        // TODO: explain ordering: regular handlers from left-to-right; then meta-handlers from right-to-left
        let handlers = chain.slice(i).concat(chain.slice(0, i).reverse());

        return {predicateInRule, handlers};
    });

    // TODO: create one node for each set. Leave `fallback` null for now.
    let nodes: MMNode[] = euler2.sets.map(set => ({
        predicate: set.predicateInRule,
        handlers: set.handlers,
        fallback: null,

        identifier: toIdentifierParts(set.predicate),
        isMatch: toMatchFunction(set.predicate),
        getCaptures: parse(set.predicateInRule).captureNames.length ? toMatchFunction(set.predicateInRule) as any : null
    }));

    // Go back over the nodes and work out the correct `fallback` node. There must be precisely one (except for the root).
    nodes.forEach((node, i) => {
        let set = euler2.sets[i];

        // Case 0: the root node has no fallback.
        // Leave fallback as null, but synthesize an additional regular handler that always returns CONTINUE.
        if (set.supersets.length === 0) {
            let handler = function _unhandled() { return CONTINUE; };
            insertAsLeastSpecificRegularHandler(node.handlers, handler);
        }       

        // Case 1: if there is only one way into the set, then the fallback is the node corresponding to the one-and-only superset.
        else if (set.supersets.length === 1) {
            let j = euler2.sets.indexOf(set.supersets[0]);
            node.fallback = nodes[j];
        }

        // Case 2: there are multiple ways into the set.
        // TODO: explain the rationale and logic of this case and its handling
        // Find the longest common prefix and suffix of all the alternatives.
        // TODO: possible for prefix and suffix to overlap? What to do?
        else {
            let pathsFromRoot = getAllPathsFromRootToSet(set);
            let prefix = getLongestCommonPrefix(pathsFromRoot);
            let suffix = getLongestCommonSuffix(pathsFromRoot);

            // Ensure the divergent sets contain NO meta-handlers.
            pathsFromRoot.forEach(path => {
                let divergentSets = path.slice(prefix.length, path.length - suffix.length);
                let hasMetaHandlers = divergentSets.some(set => set.handlers.some(h => isMetaHandler(h)));
                if (hasMetaHandlers) return fatalError('MULTIPLE_PATHS_TO', node.predicate);
            });

            // TODO: explain all below more clearly...
            // Synthesize a 'crasher' handler that throws an 'ambiguous' error, and add it to the existing handlers.
            let candidates = pathsFromRoot.map(path => path[path.length - suffix.length - 1].predicate).join(', ');
            let handler = function _ambiguous() { fatalError('MULTIPLE_FALLBACKS_FROM', node.predicate, candidates); };
            insertAsLeastSpecificRegularHandler(node.handlers, handler);
        }
    });
    return {nodes};
}





// TODO: doc...
function findMatchingPredicateInRules(normalisedPredicate: NormalPredicate, rules: MultimethodOptions['rules']) {
    for (let key in rules) {
        let predicate = toPredicate(key);

        // Skip until we find the right predicate.
        if (toNormalPredicate(predicate) !== normalisedPredicate) continue;

        // Found it!
        return predicate;
    }

    // If we get here, there is no matching predicate in the given `rules`.
    return null;
}





/**
 * Enumerates every walk[1] in the euler diagram from the root to the given `set` following 'subset' edges.
 * Each walk is represented as a list of sets arranged in walk-order (i.e., from the root to the given `set`).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#walk
 */
function getAllPathsFromRootToSet<T extends EulerSet>(set: T): T[][] {
    let allPaths = ([] as T[][]).concat(...(set.supersets as T[]).map(getAllPathsFromRootToSet));
    if (allPaths.length === 0) {

        // No parent paths, therefore this must be the root.
        allPaths = [[]];
    }
    return allPaths.map(path => path.concat(set));
}





// TODO: doc...
function insertAsLeastSpecificRegularHandler(orderedHandlers: Function[], handler: Function) {
    let i = 0;
    while (i < orderedHandlers.length && !isMetaHandler(orderedHandlers[i])) ++i;
    orderedHandlers.splice(i, 0, handler);
}
