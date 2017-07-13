import debug, {DISPATCH, EMIT} from '../../util/debug';

import isMetaMethod from '../shared/is-meta-method';
import fatalError from '../../util/fatal-error';
import CONTINUE from '../shared/continue';
import {emitThunkFunction, emitDispatchFunction} from './codegen/emit';
import repeatString from '../../util/repeat-string';
import isPromiseLike from '../../util/is-promise-like';
import andThen from '../shared/and-then';
import MMInfo, {MMNode} from '../shared/mm-info';
import {toIdentifierParts, toMatchFunction, toNormalPredicate, parsePredicateSource} from '../../set-theory/predicates';





interface ThunkInfo {
    name: string;
    source: string;
}





// TODO: review all comments here
/** TODO: doc... */
export default function emitStuff(mminfo: MMInfo) {
    let dispatcher = emitDispatcher(mminfo);

    // TODO: compute additional info needed for emit
    let thunkInfo = mminfo.nodes.reduce(
        (map, node) => map.set(node, computeThunksForNode(node, mminfo.arity, mminfo.async)),
        new Map<MMNode, ThunkInfo>()
    );
    let thunks = '';
    thunkInfo.forEach(({source}) => thunks += source + '\n\n\n');
    let thunkSelector = emitThunkSelector(mminfo, thunkInfo);

    // TODO: buggy emit for isMatch and getCaptures below
    // - assumes predicate string is valid inside the literal single quotes put around it in the emit.
    // - SOLN: escape the predicate string properly!
    let identifiers = mminfo.nodes.map(node => toIdentifierParts(node.predicate));
    let isMatchLines = identifiers.map((identifier, i) => `var isMatchː${identifier} = toMatchFunction('${toNormalPredicate(mminfo.nodes[i].predicate)}');`);
    let getCapturesLines = identifiers
        .map((identifier, i) => `var getCapturesː${identifier} = toMatchFunction('${mminfo.nodes[i].predicate}');`)
        .filter((_, i) => parsePredicateSource(mminfo.nodes[i].predicate).captureNames.length > 0);
    let methodLines = mminfo.nodes.reduce(
        (lines, n, i) => n.methods.reduce(
            (lines, _, j) => lines.concat(`var methodː${identifiers[i]}${repeatString('ᐟ', j)} = mminfo.nodes[${i}].methods[${j}];`),
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
        `var toDiscriminant = mminfo.toDiscriminant;`,
        `var EMPTY_OBJECT = Object.freeze({});`,
        isMatchLines.join('\n'),
        getCapturesLines.join('\n'),
        methodLines.join('\n'),
    ].join('\n\n\n') + '\n';


// TODO: doc...
if (debug.enabled) {
    for (let line of source.split('\n')) debug(`${EMIT} %s`, line);
}


let mm = emitAll(source, {mminfo, toMatchFunction, CONTINUE, unhandledError: fatalError.UNHANDLED, isPromiseLike});

// TODO: temp testing... neaten/improve emit of wrapper?
if (debug.enabled) {
    let mmname = mminfo.name;
    let oldmm = mm;
    mm = function _dispatch(...args: any[]) {
        debug(`${DISPATCH} |-->| ${mmname}   discriminant='%s'   args=%o`, mminfo.toDiscriminant(...args), args);
        let getResult = () => oldmm(...args);
        return andThen(getResult, (result, error, isAsync) => {
            if (error) {
                debug(`${DISPATCH} |<--| ${mmname}   %s   result=ERROR`, isAsync ? 'async' : 'sync');
            }
            else {
                debug(`${DISPATCH} |<--| ${mmname}   %s   result=%o`, isAsync ? 'async' : 'sync', result);
            }
            debug('');
            if (error) throw error; else return result;
        });
    }
}

return mm;


function emitAll(
    source: string,
    env: {
        mminfo: MMInfo,
        toMatchFunction: Function,
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
        let {mminfo, toMatchFunction, CONTINUE, unhandledError, isPromiseLike} = env;

        // Suppress TS6133 decl never used for above locals, which *are* referenced in the source code eval'ed below.
        [mminfo, toMatchFunction, CONTINUE, unhandledError, isPromiseLike];

        $0

        return $1;
    }


}



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
function computeThunksForNode(node: MMNode, arity: number|undefined, async: boolean|undefined): ThunkInfo {

    const mostSpecificNode = node;
    let allMethods = [] as {method: Function, node: MMNode, localIndex: number}[];
    while (node !== null) {
        allMethods = allMethods.concat(node.methods.map((method, localIndex) => ({method, node, localIndex})));
        node = node.fallback!; // NB: may be null
    }

    let sources = allMethods.map(({method, node, localIndex}, i) => {
        const identifier = toIdentifierParts(node.predicate);

        // To avoid unnecessary duplication, skip emit for regular methods that are less specific that the set's predicate, since these will be handled in their own set.
        if (!isMetaMethod(method) && node !== mostSpecificNode) return '';

        // TODO: temp testing... explain!!
        let isLeastSpecificMethod = i === allMethods.length - 1;
        let downstream = allMethods.filter(({method}, j) => (j === 0 || isMetaMethod(method)) && j < i).pop();

        // TODO: temp testing...
        return emitThunkFunction(getNameForThunk(i), arity, {
            IS_PROMISE: 'isPromiseLike',
            CONTINUE: 'CONTINUE',
            EMPTY_OBJECT: 'EMPTY_OBJECT',
            GET_CAPTURES: `getCapturesː${identifier}`,
            CALL_METHOD: `methodː${identifier}${repeatString('ᐟ', localIndex)}`,
            DELEGATE_DOWNSTREAM: downstream ? getNameForThunk(allMethods.indexOf(downstream)) : '',
            DELEGATE_FALLBACK: isLeastSpecificMethod ? '' : getNameForThunk(i + 1),

            // Statically known booleans --> 'true'/'false' literals (for dead code elimination)
            ENDS_PARTITION: isLeastSpecificMethod || isMetaMethod(allMethods[i + 1].method),
            HAS_CAPTURES: parsePredicateSource(node.predicate).captureNames.length > 0,
            IS_META_METHOD: isMetaMethod(method),
            HAS_DOWNSTREAM: downstream != null,
            IS_NEVER_ASYNC: async === false,
            IS_ALWAYS_ASYNC: async === true
        });
    });

    // TODO: thunk names and sources...

    // TODO: temp testing...
    // The 'entry point' method is the one whose method we call to begin the cascading evaluation of the route. It is the
    // least-specific meta-method, or if there are no meta-methods, it is the most-specific ordinary method.
    let entryPoint = allMethods.filter(el => isMetaMethod(el.method)).pop() || allMethods[0];
    return {
        name: getNameForThunk(allMethods.indexOf(entryPoint)),
        source: sources.join('\n\n')
    };

    // TODO: closure... move out?
    function getNameForThunk(i: number): string {
        let el = allMethods[i];
        let baseName = `${toIdentifierParts(el.node.predicate)}${repeatString('ᐟ', el.localIndex)}`;
        if (isMetaMethod(el.method) && (el.node !== mostSpecificNode || el.localIndex > 0)) {
            return `thunkː${toIdentifierParts(mostSpecificNode.predicate)}ːviaː${baseName}`;
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
function emitThunkSelector(mminfo: MMInfo, thunkInfo: Map<MMNode, ThunkInfo>) {

    // Generate the combined source code for selecting the best thunk based on predicate-matching of the discriminant.
    let lines = [
        'function selectThunk(discriminant) {',
        ...emitThunkSelectorBlock(mminfo.root, thunkInfo, 1),
        '}',
    ];
    let source = lines.join('\n') + '\n';
    return source;
}





/** Helper function to generate source code for the thunk selector function. */
function emitThunkSelectorBlock(node: MMNode, thunkInfo: Map<MMNode, ThunkInfo>, nestDepth: number) {

    // Make the indenting string corresponding to the given `nestDepth`.
    let indent = repeatString('    ', nestDepth);

    // Recursively generate the conditional logic block to select among the given patterns.
    let lines: string[] = [];
    node.children.forEach(node => {
        let condition = `${indent}if (isMatchː${toIdentifierParts(node.predicate)}(discriminant)) `;

        if (node.children.length === 0) {
            lines.push(`${condition}return ${thunkInfo.get(node)!.name};`);
            return;
        }

        lines = [
            ...lines,
            `${condition}{`,
            ...emitThunkSelectorBlock(node, thunkInfo, nestDepth + 1),
            `${indent}}`
        ];
    });

    // Add a line to select the fallback predicate if none of the more specialised predicates matched the discriminant.
    lines.push(`${indent}return ${thunkInfo.get(node)!.name};`);
    return lines;
}





// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%     DISPATCHER
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%





// TODO: temp testing...
function emitDispatcher(mminfo: MMInfo) {

    let source = emitDispatchFunction(mminfo.name, mminfo.arity, {
        TO_DISCRIMINANT: 'toDiscriminant',
        SELECT_THUNK: 'selectThunk', // TODO: temp testing... how to know this name?
        CONTINUE: 'CONTINUE',
        UNHANDLED_ERROR: 'unhandledError'
    });

    // All done for this iteration.
    return source;
}
