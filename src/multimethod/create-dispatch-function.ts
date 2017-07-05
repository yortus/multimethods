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
import {emitThunkFunction, emitDispatchFunction} from './codegen/emit';
import repeatString from '../util/repeat-string';





// TODO: review all comments here - eg refs to 'RuleSet' should be updated to Multimethod, etc
/** Internal function used to generate the RuleSet#execute method. */
export default function createDispatchFunction(normalisedOptions: MultimethodOptions) {

    // TODO: ...
    let normalisedRules = normaliseRules(normalisedOptions.rules);

    // Generate a taxonomic arrangement of all the predicate patterns that occur in the rule set.
    let eulerDiagram = new EulerDiagram(normalisedRules.map(rule => rule.predicate));


// TODO: temp testing...
let multimethodName = `MM${multimethodCounter++}`;
let dispatcher = emitDispatcher(multimethodName, normalisedOptions);

let mminfo = createMMInfo(eulerDiagram, normalisedOptions);
let thunkSelector = emitThunkSelector(mminfo);
let thunks = mminfo.nodes.map(n => n.thunkSource).join('\n\n\n');
let isMatch = mminfo.nodes.map((n, i) => `var isMatch:${n.identifier} = mminfo.nodes[${i}].isMatch;`).join('\n');
let getCaptures = mminfo.nodes.map((n, i) => `var getCaptures:${n.identifier} = mminfo.nodes[${i}].getCaptures;`).join('\n');

let handler = mminfo.nodes.reduce(
    (lines, n, i) => n.handlers.reduce(
        (lines, _, j) => lines.concat(`var handler:${n.identifier}${repeatString('ᐟ', j)} = mminfo.nodes[${i}].handlers[${j}];`),
        lines
    ),
    [] as string[]
).join('\n');

let source = [
    dispatcher,
    thunkSelector,
    thunks,
    isMatch,
    getCaptures,
    handler,
].join('\n\n\n') + '\n';
source;



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
    root: MMNode;
    nodes: MMNode[];
}
interface MMNode {
    predicate: Predicate;
    handlers: Function[];
    fallback: MMNode|null;

    identifier: string;
    isMatch(discriminant: string): object/*truthy*/|null/*falsy*/; // TODO: use like a boolean...
    getCaptures(discriminant: string): {[captureName: string]: string};

    thunkName: string;
    thunkSource: string;

    children: MMNode[];
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
        getCaptures: parse(set.predicateInRule).captureNames.length ? toMatchFunction(set.predicateInRule) as any : null,

        thunkName: '', // TODO: leave for now...
        thunkSource: '', // TODO: leave for now...

        children: []
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
        else {

            // Find the longest common prefix and suffix of all the alternatives.
            // TODO: possible for prefix and suffix to overlap? What to do?
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

            // Set 'fallback' to the node at the end of the common prefix.
            node.fallback = nodes[euler2.sets.indexOf(prefix[prefix.length - 1])];
        }
    });

    // TODO: thunks...
    nodes.forEach(node => {
        let thunks = computeThunksForNode(node, normalisedOptions);
        node.thunkName = thunks.thunkName;
        node.thunkSource = thunks.thunkSource;
    });

    nodes.forEach((node, i) => {
        let set = euler2.sets[i];
        node.children = set.subsets.map((subset: any) => nodes[euler2.sets.indexOf(subset)]); // TODO: why cast needed?
    });

    let root = nodes[euler2.sets.indexOf(euler2.universe)];
    return {root, nodes};
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





// TODO: doc...
function computeThunksForNode(node: MMNode, options: MultimethodOptions) {
    const mostSpecificNode = node;
    let allHandlers = [] as {handler: Function, node: MMNode, localIndex: number}[];
    while (node !== null) {
        allHandlers = allHandlers.concat(node.handlers.map((handler, localIndex) => ({handler, node, localIndex})));
        node = node.fallback!; // NB: may be null
    }

    let sources = allHandlers.map(({handler, node, localIndex}, i) => {

        // To avoid unnecessary duplication, skip emit for regular rules that are less specific that the set's predicate, since these will be handled in their own set.
        if (!isMetaHandler(handler) && node !== mostSpecificNode) return '';

        // TODO: temp testing... explain!!
        let isFinalHandler = i === allHandlers.length - 1;
        let downstream = allHandlers.filter(({handler}, j) => (j === 0 || isMetaHandler(handler)) && j < i).pop();

        // TODO: temp testing...
        return emitThunkFunction(getNameForThunk(i), options.arity as number|undefined, { // TODO: fix cast after Options type is fixed
            isPromise: 'isPromise',
            CONTINUE: 'CONTINUE',
            GET_CAPTURES: `getCapturesː${node.identifier}`,
            CALL_HANDLER: `handlerː${node.identifier}${repeatString('ᐟ', localIndex)}`,
            DELEGATE_DOWNSTREAM: downstream ? getNameForThunk(allHandlers.indexOf(downstream)) : '',
            DELEGATE_FALLBACK: isFinalHandler ? '' : getNameForThunk(i + 1),

            // Statically known booleans --> 'true'/'false' literals (for dead code elimination)
            ENDS_PARTITION: isFinalHandler || isMetaHandler(allHandlers[i + 1].handler),
            HAS_CAPTURES: node.getCaptures != null,
            IS_META_RULE: isMetaHandler(handler),
            HAS_DOWNSTREAM: downstream != null,
            IS_PURE_SYNC: options.timing === 'sync',
            IS_PURE_ASYNC: options.timing === 'async'
        });
    });

    // TODO: thunk names and sources...

    // TODO: temp testing...
    // The 'entry point' rule is the one whose handler we call to begin the cascading evaluation of the route. It is the
    // least-specific meta-rule, or if there are no meta-rules, it is the most-specific ordinary rule.
    let entryPoint = allHandlers.filter(el => isMetaHandler(el.handler)).pop() || allHandlers[0];
    let thunkName = getNameForThunk(allHandlers.indexOf(entryPoint));
    return {
        thunkName,
        thunkSource: sources.join('\n\n')
    };

    // TODO: closure... move out?
    function getNameForThunk(i: number): string {
        let el = allHandlers[i];
        let baseName = `${el.node.identifier}${repeatString('ᐟ', el.localIndex)}`;
        if (isMetaHandler(el.handler) && (el.node !== mostSpecificNode || el.localIndex > 0)) {
            return `thunkː${mostSpecificNode.identifier}ːviaː${baseName}`;
        }
        else {
            return `thunkː${baseName}`;
        }
    }
}





// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%     SELECTOR
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%





// TODO: rewrite doc...
/**
 * Generates a function that, given a discriminant, returns the best-matching route executor from the given list of
 * candidates. The returned selector function is generated for maximum readability and efficiency, using conditional
 * constructs that follow the branches of the given `eulerDiagram`.
 * @param {EulerDiagram} eulerDiagram - The arrangement of patterns on which to base the returned selector function.
 * @returns {(address: string) => Function} The generated route selector function.
 */
function emitThunkSelector(mminfo: MMInfo) {

    // Generate the combined source code for selecting the best thunk. This includes local variable declarations
    // for all the match functions and all the candidate route handler functions, as well as the dispatcher function
    // housing all the conditional logic for selecting the best route handler based on address matching.
    let lines = [
        'function selectThunk(discriminant) {',
        ...emitThunkSelectorBlock(mminfo.root, 1),
        '}',
    ];
    let source = lines.join('\n') + '\n';
    return source;
}





/** Helper function to generate source code for the thunk selector function. */
function emitThunkSelectorBlock(node: MMNode, nestDepth: number) {

    // Make the indenting string corresponding to the given `nestDepth`.
    let indent = repeatString('    ', nestDepth);

    // Recursively generate the conditional logic block to select among the given patterns.
    let lines: string[] = [];
    node.children.forEach(node => {
        let condition = `${indent}if (isMatchː${node.identifier}(discriminant)) `;

        if (node.children.length === 0) {
            lines.push(`${condition}return ${node.thunkName};`);
            return;
        }

        lines = [
            ...lines,
            `${condition}{`,
            ...emitThunkSelectorBlock(node, nestDepth + 1),
            `${indent}}`
        ];
    });

    // Add a line to select the fallback predicate if none of the more specialised predicates matched the discriminant.
    lines.push(`${indent}return ${node.thunkName};`);
    return lines;
}





// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%     DISPATCHER
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%





// TODO: temp testing...
function emitDispatcher(functionName: string, options: MultimethodOptions) {

    let source = emitDispatchFunction(functionName, options.arity as number|undefined, {
        TO_DISCRIMINANT: 'toDiscriminant',
        SELECT_THUNK: 'selectThunk', // TODO: temp testing... how to know this name?
        CONTINUE: 'CONTINUE',
        FATAL_ERROR: 'fatalError'
    });

    // All done for this iteration.
    return source;
}





// TODO: doc...
let multimethodCounter = 0;
