import MultimethodOptions from './multimethod-options';
import normaliseMethods from './normalise-methods';
import {EulerDiagram, EulerSet} from '../../set-theory/sets';
import {toNormalPredicate, NormalPredicate} from '../../set-theory/predicates';
import debug, {DISPATCH, EMIT} from '../../util/debug';

import getLongestCommonPrefix from '../../util/get-longest-common-prefix';
import getLongestCommonSuffix from '../../util/get-longest-common-suffix';
import isMetaMethod from './is-meta-method';
import fatalError from '../../util/fatal-error';
import {toIdentifierParts, toMatchFunction, parsePredicateSource as parse, toPredicate, Predicate} from '../../set-theory/predicates';
import {CONTINUE} from './sentinels';
import {emitThunkFunction, emitDispatchFunction} from './codegen/emit';
import repeatString from '../../util/repeat-string';
import isPromiseLike from '../../util/is-promise-like';





// TODO: review all comments here
/** TODO: doc... */
export default function createDispatchFunction(normalisedOptions: MultimethodOptions) {

    // TODO: ...
    let normalisedMethods = normaliseMethods(normalisedOptions.methods);
    normalisedOptions.methods = normalisedMethods;

    // Generate a taxonomic arrangement of all the predicate patterns that occur in the `methods` hash.
    let eulerDiagram = new EulerDiagram(Object.keys(normalisedMethods).map(toPredicate));



    // TODO: temp testing...
    let mminfo = createMMInfo(eulerDiagram, normalisedOptions);
    let dispatcher = emitDispatcher(mminfo);
    let thunkSelector = emitThunkSelector(mminfo);
    let thunks = mminfo.nodes.map(n => n.thunkSource).join('\n\n\n');
    let isMatchLines = mminfo.nodes.map((n, i) => `var isMatchː${n.identifier} = mminfo.nodes[${i}].isMatch;`);
    let getCapturesLines = mminfo.nodes
        .map((n, i) => `var getCapturesː${n.identifier} = mminfo.nodes[${i}].getCaptures;`)
        .filter((_, i) => mminfo.nodes[i].getCaptures != null);

    let methodLines = mminfo.nodes.reduce(
        (lines, n, i) => n.methods.reduce(
            (lines, _, j) => lines.concat(`var methodː${n.identifier}${repeatString('ᐟ', j)} = mminfo.nodes[${i}].methods[${j}];`),
            lines
        ),
        [] as string[]
    );

    // TODO: revise comment... terminology has changed
    // Generate the combined source code for the multimethod. This includes local variable declarations for
    // all predicates and methods, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of each multimethod call.
    let source = [
        `// ========== MULTIMETHOD DISPATCHER ==========`,
        dispatcher,
        `// ========== THUNK SELECTOR ==========`,
        thunkSelector,
        `// ========== THUNKS ==========`,
        thunks,
        `// ========== ENVIRONMENT ==========`,
        `var toDiscriminant = mminfo.options.toDiscriminant;`,
        `var EMPTY_OBJECT = Object.freeze({});`,
        isMatchLines.join('\n'),
        getCapturesLines.join('\n'),
        methodLines.join('\n'),
    ].join('\n\n\n') + '\n';


// TODO: doc...
if (debug.enabled) {
    for (let line of source.split('\n')) debug(`${EMIT} %s`, line);
}


let mm = emitAll(source, {mminfo, CONTINUE, unhandledError: fatalError.UNHANDLED, isPromiseLike});

// TODO: temp testing... neaten/improve emit of wrapper?
if (debug.enabled) {
    let oldmm = mm;
    mm = function _dispatch(...args: any[]) {
        debug(`${DISPATCH} Call   discriminant='%s'   args=%o`, normalisedOptions.toDiscriminant(...args), args);
        let result = oldmm(...args);
        let isAsync = isPromiseLike(result);
        return andThen(result, result => {
            debug(`${DISPATCH} Return%s   result=%o`, isAsync ? '   ASYNC' : '', result);
            debug('');
            return result;
        });
    }
}

return mm;


function emitAll(
    source: string,
    env: {
        mminfo: MMInfo,
        CONTINUE: any,
        unhandledError: typeof fatalError.UNHANDLED,
        isPromiseLike: Function,
    }
) {
    let $0: any;
    let $1: any;
    let abc = xyz
        .toString()
        .replace(/\$0/g, source)
        .replace(/\$1/g, env.mminfo.name);

    // TODO: revise comment...
    // Evaluate the source code, and return its result, which is the multimethod dispatch function. The use of eval
    // here is safe. There are no untrusted inputs substituted into the source. The client-provided methods can do
    // anything (so may be considered untrusted), but that has nothing to do with the use of 'eval' here, since they
    // would need to be called by the dispatcher whether or not eval was used. More importantly, the use of eval here
    // allows for multimethod dispatch code that is both more readable and more efficient, since it is tailored
    // specifically to the options of this multimethod, rather than having to be generalized for all possible cases.
    let mm: Function = eval(`(${abc})`)();
    return mm;


    function xyz() {
        let {mminfo, CONTINUE, unhandledError, isPromiseLike} = env;

        // Suppress TS6133 decl never used for above locals, which *are* referenced in the source code eval'ed below.
        [mminfo, CONTINUE, unhandledError, isPromiseLike];

        $0

        return $1;
    }


}



}





// TODO: copypasta - move to util
function andThen(val: any, cb: (val: any) => any) {
    return isPromiseLike(val) ? val.then(cb) : cb(val);
}





// TODO: doc...
interface MMInfo {
    name: string;
    options: MultimethodOptions;
    nodes: MMNode[];
    root: MMNode;
}
interface MMNode {
    predicate: Predicate;
    methods: Function[];
    fallback: MMNode|null;

    identifier: string;
    isMatch(discriminant: string): object/*truthy*/|null/*falsy*/; // TODO: use like a boolean...
    getCaptures(discriminant: string): {[captureName: string]: string};

    thunkName: string;
    thunkSource: string;

    children: MMNode[];
}





// TODO: temp testing...
// TODO: reuse/revise old comments below, all from computePredicateLineages()...
// (1):
    // Every route begins with the universal predicate. It matches all discriminants,
    // and its method simply returns the `CONTINUE` sentinel value.

// (2):
    // Every set in the euler diagram represents the best-matching pattern for some set of discriminants. Therefore, the set
    // of all possible discriminants may be thought of as being partitioned by an euler diagram into one partition per set,
    // where for each partition, that partition's set holds the most-specific predicate that matches that partition's
    // discriminants. For every such partition, we can concatenate the 'equal best' methods for all the sets along the
    // routes from the universal set to the most-specific set in the partition, thus getting a method
    // list for each partition, ordered from least- to most-specific, of all the methods that match all the partition's
    // discriminants. One complication here is that there may be multiple routes from the universal set to some other set in the
    // euler diagram, since it is a DAG and may therefore contain 'diamonds'. Since we tolerate no ambiguity, these multiple
    // routes must be effectively collapsed down to a single unambiguous route. The details of this are in the
    // disambiguateRoutes() function.

// (3):
    // Returns a mapping of every possible route through the given euler diagram, keyed by predicate. There is one route for each
    // set in the euler diagram. A route is simply a list of methods, ordered from least- to most-specific, that all match the set
    // of discriminants matched by the corresponding euler diagram set's predicate. Routes are an important internal concept,
    // because each route represents the ordered list of matching methods for any given discriminant.

// (4):
    // Get all the methods in the methods hash whose normalized predicate exactly matches that of the given set's predicate.
    // Some sets may have no matching methods, because the euler diagram may include predicates that are not in the
    // original methods hash for the following cases:
    // (i) the always-present root predicate '…', which may be in the methods hash.
    // (ii) predicates synthesized at the intersection of overlapping (i.e. non-disjoint) predicates in the methods hash.

// (5):
    // We now have an array of methods whose predicates are all equivalent. To sort these methods from least- to most-
    // specific, we use a comparator that orders any two given 'equivalent' methods according to the following laws:
    // (i) A meta-method is always less specific than a regular method
    // (ii) For two regular methods in the same chain, the leftmost method is more specific
    // (iii) For two meta-methods in the same chain, the leftmost method is less specific
    // (iv) Anything else is ambiguous and results in an error

function createMMInfo(eulerDiagram: EulerDiagram, normalisedOptions: MultimethodOptions): MMInfo {

    // Augment sets with exactly-matching methods in most- to least-specific order.
    let euler2 = eulerDiagram.augment(set => {
        let predicateInHash = findMatchingPredicateInMethods(set.predicate, normalisedOptions.methods) || set.predicate;

        // Find the index in the chain where meta-methods end and regular methods begin.
        let chain = normalisedOptions.methods[predicateInHash] || [];
        if (!Array.isArray(chain)) chain = [chain];
        let i = 0;
        while (i < chain.length && isMetaMethod(chain[i])) ++i;
        // TODO: explain ordering: regular methods from left-to-right; then meta-methods from right-to-left
        let methods = chain.slice(i).concat(chain.slice(0, i).reverse());

        return {predicateInHash, methods};
    });

    // TODO: create one node for each set. Leave everything from `fallback` onward null for now.
    let nodes: MMNode[] = euler2.sets.map(set => ({
        predicate: set.predicateInHash,
        methods: set.methods,
        fallback: null,

        identifier: toIdentifierParts(set.predicate),
        isMatch: toMatchFunction(set.predicate),
        getCaptures: parse(set.predicateInHash).captureNames.length ? toMatchFunction(set.predicateInHash) as any : null,

        thunkName: '', // TODO: leave for now...
        thunkSource: '', // TODO: leave for now...

        children: []
    }));

    // Go back over the nodes and work out the correct `fallback` node. There must be precisely one (except for the root).
    nodes.forEach((node, i) => {
        let set = euler2.sets[i];

        // Case 0: the root node has no fallback.
        // Leave fallback as null, but synthesize an additional regular method that always returns CONTINUE.
        if (set.supersets.length === 0) {
            let method = function _unhandled() { return CONTINUE; };
            insertAsLeastSpecificRegularMethod(node.methods, method);
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

            // Ensure the divergent sets contain NO meta-methods.
            pathsFromRoot.forEach(path => {
                let divergentSets = path.slice(prefix.length, path.length - suffix.length);
                let hasMetaMethods = divergentSets.some(set => set.methods.some(h => isMetaMethod(h)));
                if (hasMetaMethods) return fatalError.MULTIPLE_PATHS_TO(node.predicate);
            });

            // TODO: explain all below more clearly...
            // Synthesize a 'crasher' method that throws an 'ambiguous' error, and add it to the existing methods.
            let candidates = pathsFromRoot.map(path => path[path.length - suffix.length - 1].predicate).join(', ');
            let method = function _ambiguous() { fatalError.MULTIPLE_FALLBACKS_FROM(node.predicate, candidates); };
            insertAsLeastSpecificRegularMethod(node.methods, method);

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

    // TODO: children...
    nodes.forEach((node, i) => {
        let set = euler2.sets[i];
        node.children = set.subsets.map((subset: any) => nodes[euler2.sets.indexOf(subset)]); // TODO: why cast needed?
    });

    // TODO: all together...
    let name = `MM${multimethodCounter++}`;
    let root = nodes[euler2.sets.indexOf(euler2.universe)];
    return {name, options: normalisedOptions, nodes, root};
}





// TODO: doc...
function findMatchingPredicateInMethods(normalisedPredicate: NormalPredicate, methods: MultimethodOptions['methods']) {
    for (let key in methods) {
        let predicate = toPredicate(key);

        // Skip until we find the right predicate.
        if (toNormalPredicate(predicate) !== normalisedPredicate) continue;

        // Found it!
        return predicate;
    }

    // If we get here, there is no matching predicate in the given `methods`.
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
function insertAsLeastSpecificRegularMethod(orderedMethods: Function[], method: Function) {
    let i = 0;
    while (i < orderedMethods.length && !isMetaMethod(orderedMethods[i])) ++i;
    orderedMethods.splice(i, 0, method);
}





// TODO: rewrite comments. Esp signature of route executor matches signature of multimethod (as per provided Options)
/**
 * Generates the virtual method, called a 'thunk', for the given node.
 * In the absence of meta-methods, the logic for the virtual method is straightforward: execute each matching method
 * in turn, from the most- to the least-specific, until one produces a result. With meta-methods, the logic becomes more
 * complex, because a meta-method must run *before* more-specific regular methods, with those more specific
 * methods being wrapped into a callback function and passed to the meta-method. To account for this, we perform
 * an order-preserving partitioning of all matching methods for the node, with each meta-method starting a new
 * partition. Within each partition, we use the straightforward cascading logic outlined above.
 * However, each partition as a whole is executed in reverse-order (least to most specific), with the next (more-specific)
 * partition being passed as the `next` parameter to the meta-method starting the previous (less-specific) partition.
 * @param {node} MMNode - contains the list of matching methods for the node's predicate, ordered from most- to least-specific.
 * @returns {Thunk} the virtual method for the node.
 */
function computeThunksForNode(node: MMNode, options: MultimethodOptions) {
    const mostSpecificNode = node;
    let allMethods = [] as {method: Function, node: MMNode, localIndex: number}[];
    while (node !== null) {
        allMethods = allMethods.concat(node.methods.map((method, localIndex) => ({method, node, localIndex})));
        node = node.fallback!; // NB: may be null
    }

    let sources = allMethods.map(({method, node, localIndex}, i) => {

        // To avoid unnecessary duplication, skip emit for regular methods that are less specific that the set's predicate, since these will be handled in their own set.
        if (!isMetaMethod(method) && node !== mostSpecificNode) return '';

        // TODO: temp testing... explain!!
        let isLeastSpecificMethod = i === allMethods.length - 1;
        let downstream = allMethods.filter(({method}, j) => (j === 0 || isMetaMethod(method)) && j < i).pop();

        // TODO: temp testing...
        return emitThunkFunction(getNameForThunk(i), options.arity as number|undefined, { // TODO: fix cast after Options type is fixed
            IS_PROMISE: 'isPromiseLike',
            CONTINUE: 'CONTINUE',
            EMPTY_OBJECT: 'EMPTY_OBJECT',
            GET_CAPTURES: `getCapturesː${node.identifier}`,
            CALL_METHOD: `methodː${node.identifier}${repeatString('ᐟ', localIndex)}`,
            DELEGATE_DOWNSTREAM: downstream ? getNameForThunk(allMethods.indexOf(downstream)) : '',
            DELEGATE_FALLBACK: isLeastSpecificMethod ? '' : getNameForThunk(i + 1),

            // Statically known booleans --> 'true'/'false' literals (for dead code elimination)
            ENDS_PARTITION: isLeastSpecificMethod || isMetaMethod(allMethods[i + 1].method),
            HAS_CAPTURES: node.getCaptures != null,
            IS_META_METHOD: isMetaMethod(method),
            HAS_DOWNSTREAM: downstream != null,
            IS_NEVER_ASYNC: options.timing === 'sync',
            IS_ALWAYS_ASYNC: options.timing === 'async'
        });
    });

    // TODO: thunk names and sources...

    // TODO: temp testing...
    // The 'entry point' method is the one whose method we call to begin the cascading evaluation of the route. It is the
    // least-specific meta-method, or if there are no meta-methods, it is the most-specific ordinary method.
    let entryPoint = allMethods.filter(el => isMetaMethod(el.method)).pop() || allMethods[0];
    let thunkName = getNameForThunk(allMethods.indexOf(entryPoint));
    return {
        thunkName,
        thunkSource: sources.join('\n\n')
    };

    // TODO: closure... move out?
    function getNameForThunk(i: number): string {
        let el = allMethods[i];
        let baseName = `${el.node.identifier}${repeatString('ᐟ', el.localIndex)}`;
        if (isMetaMethod(el.method) && (el.node !== mostSpecificNode || el.localIndex > 0)) {
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

    // Generate the combined source code for selecting the best thunk based on predicate-matching of the discriminant.
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
function emitDispatcher(mminfo: MMInfo) {

    let source = emitDispatchFunction(mminfo.name, mminfo.options.arity as number|undefined, {
        TO_DISCRIMINANT: 'toDiscriminant',
        SELECT_THUNK: 'selectThunk', // TODO: temp testing... how to know this name?
        CONTINUE: 'CONTINUE',
        UNHANDLED_ERROR: 'unhandledError'
    });

    // All done for this iteration.
    return source;
}





// TODO: doc...
let multimethodCounter = 0;
