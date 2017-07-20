import debug, {DISPATCH, EMIT} from '../util/debug';
import fatalError from '../util/fatal-error';
import {CONTINUE} from '../sentinels';
import emitDispatchFunction from './emit-dispatch-function';
import emitSelectorFunction from './emit-selector-function';
import repeat from '../util/string-repeat';
import isPromiseLike from '../util/is-promise-like';
import andThen from '../util/and-then';
import {MMInfo, MMNode} from '../analysis';
import {toIdentifierParts, toMatchFunction, toNormalPredicate, parsePredicateSource} from '../math/predicates';
import ThunkInfo from './thunk-info';
import computeThunksForNode from './compute-thunks-for-node';





// TODO: review all comments here
/** TODO: doc... */
export default function emitStuff(mminfo: MMInfo<MMNode>) {
    let dispatcher = emitDispatcher(mminfo);

    // TODO: compute additional info needed for emit
    let thunkInfo = mminfo.allNodes.reduce(
        (map, node) => map.set(node, computeThunksForNode(node, mminfo.options.arity, mminfo.options.async)),
        new Map<MMNode, ThunkInfo>()
    );
    let thunks = '';
    thunkInfo.forEach(({source}) => thunks += source + '\n\n\n');
    let thunkSelector = emitSelectorFunction(mminfo, thunkInfo);

    // TODO: buggy emit for isMatch and getCaptures below
    // - assumes predicate string is valid inside the literal single quotes put around it in the emit.
    // - SOLN: escape the predicate string properly!
    let identifiers = mminfo.allNodes.map(node => toIdentifierParts(node.predicateInMethodTable));
    let isMatchLines = identifiers.map((identifier, i) => `var isMatchː${identifier} = toMatchFunction('${toNormalPredicate(mminfo.allNodes[i].predicateInMethodTable)}');`);
    let getCapturesLines = identifiers
        .map((identifier, i) => `var getCapturesː${identifier} = toMatchFunction('${mminfo.allNodes[i].predicateInMethodTable}');`)
        .filter((_, i) => parsePredicateSource(mminfo.allNodes[i].predicateInMethodTable).captureNames.length > 0);
    let methodLines = mminfo.allNodes.reduce(
        (lines, n, i) => n.exactlyMatchingMethods.reduce(
            (lines, _, j) => lines.concat(`var methodː${identifiers[i]}${repeat('ᐟ', j)} = mminfo.allNodes[${i}].exactlyMatchingMethods[${j}];`),
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


let mm = emitAll(source, {mminfo, toMatchFunction, CONTINUE, unhandledError: fatalError.UNHANDLED, isPromiseLike});

// TODO: temp testing... neaten/improve emit of wrapper?
if (debug.enabled) {
    let mmname = mminfo.options.name;
    let oldmm = mm;
    mm = function _dispatch(...args: any[]) {
        debug(`${DISPATCH} |-->| ${mmname}   discriminant='%s'   args=%o`, mminfo.options.toDiscriminant(...args), args);
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
        mminfo: MMInfo<MMNode>,
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
        .replace(/\$1/g, env.mminfo.options.name);

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





// TODO: temp testing...
function emitDispatcher(mminfo: MMInfo<MMNode>) {

    let source = emitDispatchFunction(mminfo.options.name, mminfo.options.arity, {
        TO_DISCRIMINANT: 'toDiscriminant',
        SELECT_THUNK: 'selectThunk', // TODO: temp testing... how to know this name?
        CONTINUE: 'CONTINUE',
        UNHANDLED_ERROR: 'unhandledError'
    });

    // All done for this iteration.
    return source;
}
