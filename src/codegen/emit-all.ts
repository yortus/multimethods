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
import Emitter from './emitter';





// TODO: review all comments here
/** TODO: doc... */
export default function emitAll(mminfo: MMInfo<MMNode>) {

    let allLines = [] as string[];
    let emit: Emitter = (...lines: string[]) => {
        lines.forEach(line => allLines.push(...line.split(/\n/)));
    };


    emit(`\n\n\n// ========== MULTIMETHOD DISPATCHER ==========`);
    emitDispatcher(emit, mminfo);


    // TODO: compute additional info needed for emit
    let thunkInfo = mminfo.allNodes.reduce(
        (map, node) => map.set(node, computeThunksForNode(node, mminfo.options.arity, mminfo.options.async)),
        new Map<MMNode, ThunkInfo>()
    );


    emit(`\n\n\n// ========== THUNK SELECTOR ==========`);
    emitSelectorFunction(emit, mminfo, thunkInfo);


    emit(`\n\n\n// ========== THUNKS ==========`);
    thunkInfo.forEach(({source}) => emit(source));


    // TODO: buggy emit for isMatch and getCaptures below
    // - assumes predicate string is valid inside the literal single quotes put around it in the emit.
    // - SOLN: escape the predicate string properly!
    let identifiers = mminfo.allNodes.map(node => toIdentifierParts(node.exactPredicate));
    let isMatchLines = identifiers.map((identifier, i) => `var isMatchː${identifier} = toMatchFunction('${toNormalPredicate(mminfo.allNodes[i].exactPredicate)}');`);
    let getCapturesLines = identifiers
        .map((identifier, i) => `var getCapturesː${identifier} = toMatchFunction('${mminfo.allNodes[i].exactPredicate}');`)
        .filter((_, i) => parsePredicateSource(mminfo.allNodes[i].exactPredicate).captureNames.length > 0);
    let methodLines = mminfo.allNodes.reduce(
        (lines, n, i) => n.exactMethods.reduce(
            (lines, _, j) => lines.concat(`var methodː${identifiers[i]}${repeat('ᐟ', j)} = mminfo.allNodes[${i}].exactMethods[${j}];`),
            lines
        ),
        [] as string[]
    );

    // TODO: revise comment... terminology has changed
    // Generate the combined source code for the multimethod. This includes local variable declarations for
    // all predicates and methods, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of each multimethod call.
    emit(
        `// ========== ENVIRONMENT ==========`,
        `var toDiscriminant = mminfo.options.toDiscriminant;`,
        `var EMPTY_OBJECT = Object.freeze({});`,
        ...isMatchLines,
        ...getCapturesLines,
        ...methodLines,
    );


    // TODO: ...
    let source = allLines.join('\n');


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
function emitDispatcher(emit: Emitter, mminfo: MMInfo<MMNode>) {

    emitDispatchFunction(emit, mminfo.options.name, mminfo.options.arity, {
        TO_DISCRIMINANT: 'toDiscriminant',
        SELECT_THUNK: 'selectThunk', // TODO: temp testing... how to know this name?
        CONTINUE: 'CONTINUE',
        UNHANDLED_ERROR: 'unhandledError'
    });
}
