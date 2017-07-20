import debug, {DISPATCH, EMIT} from '../util/debug';
import fatalError from '../util/fatal-error';
import * as sentinels from '../sentinels';
import emitDispatchFunction from './emit-dispatch-function';
import emitSelectorFunction from './emit-selector-function';
import repeat from '../util/string-repeat';
import isPromiseLike from '../util/is-promise-like';
import andThen from '../util/and-then';
import {MMInfo, MMNode} from '../analysis';
import {toMatchFunction, toNormalPredicate, parsePredicateSource} from '../math/predicates';
import emitThunkFunction from './emit-thunk-function';
import Emitter from './emitter';
import assign from '../util/object-assign';





// TODO: doc... shared env... these must be consistent across emit
const IS_PROMISE_LIKE = 'isPromiseLike';
const CONTINUE = 'CONTINUE';
const THUNK_SELECTOR_NAME = 'selectThunk';
const TO_DISCRIMINANT = 'toDiscriminant';
const EMPTY_OBJECT = 'EMPTY_OBJECT';
const UNHANDLED_ERROR = 'unhandledError';
const IS_MATCH_PREFIX = 'isMatchː';
const GET_CAPTURES_PREFIX = 'getCapturesː';
const METHOD_PREFIX = 'methodː';
const THUNK_PREFIX = 'thunkː';





/** TODO: doc... */
export default function emitAll(mminfo0: MMInfo<MMNode>) {
    let mminfo = augmentMMInfo(mminfo0);

    let allLines = [] as string[];
    let emit: Emitter = (...lines: string[]) => {
        lines.forEach(line => allLines.push(...line.split(/\n/)));
    };

    emit(`\n\n\n// ========== MULTIMETHOD DISPATCHER ==========`);
    emitDispatchFunction(emit, mminfo.options.name, mminfo.options.arity, {
        THUNK_SELECTOR_NAME,
        CONTINUE,
        TO_DISCRIMINANT,
        UNHANDLED_ERROR
    });


    emit(`\n\n\n// ========== THUNK SELECTOR ==========`);
    emitSelectorFunction(emit, mminfo, {
        THUNK_SELECTOR_NAME,
        IS_MATCH_PREFIX,
        THUNK_PREFIX
    });


    emit(`\n\n\n// ========== THUNKS ==========`);
    mminfo.allNodes.forEach(node => {
        node.methodSequence.forEach((_, i, seq) => {
            emitThunkFunction(emit, mminfo, seq, i, {
                IS_PROMISE_LIKE,
                CONTINUE,
                EMPTY_OBJECT,
                THUNK_PREFIX,
                GET_CAPTURES_PREFIX,
                METHOD_PREFIX
            });
        });
    });


    emit(`// ========== ENVIRONMENT ==========`);
    emit(`var ${TO_DISCRIMINANT} = mminfo.options.toDiscriminant;`);
    emit(`var ${IS_PROMISE_LIKE} = mminfo.isPromiseLike;`);
    emit(`var ${CONTINUE} = mminfo.CONTINUE;`);
    emit(`var ${EMPTY_OBJECT} = Object.freeze({});`);
    emit(`var ${UNHANDLED_ERROR} = mminfo.unhandledError;`);
    mminfo.allNodes.forEach((node, i) => {
        emit(`var ${IS_MATCH_PREFIX}${node.identifier} = mminfo.allNodes[${i}].isMatch;`);
        if (node.hasCaptures) {
            emit(`var ${GET_CAPTURES_PREFIX}${node.identifier} = mminfo.allNodes[${i}].getCaptures;`);
        }
        node.exactMethods.forEach((_, j) => {
            emit(`var ${METHOD_PREFIX}${node.identifier}${repeat('ᐟ', j)} = mminfo.allNodes[${i}].exactMethods[${j}];`);
        });
    });



    // TODO: revise comment... terminology has changed
    // Generate the combined source code for the multimethod. This includes local variable declarations for
    // all predicates and methods, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of each multimethod call.
    let source = allLines.join('\n');


// TODO: doc...
if (debug.enabled) {
    for (let line of allLines) debug(`${EMIT} %s`, line);
}


    // Evaluate the multimethod's entire source code to obtain the multimethod function. The use of eval here is safe.
    // There are no untrusted inputs substituted into the source. The client-provided methods can do anything (so may
    // be considered untrusted), but that has nothing to do with the use of 'eval' here, since they would need to be
    // called by the dispatcher whether or not eval was used. More importantly, the use of eval here allows for
    // multimethod dispatch code that is both more readable and more efficient, since it is tailored specifically
    // to the options of this multimethod, rather than having to be generalized for all possible cases.
    let mm = eval(`(function () { ${source}; return ${mminfo.options.name}; })`)() as Function;


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
}





// TODO: temp testing...
// function emitAll(source: string, mminfo: MMInfo<MMNode>) {

//     // TODO: experimental 'type canary' that causes build errors if things get renamed but emit relies on them having a certain name.
//     // do this for all/most identifiers relied on in emit?
//     const MMINFO = 'mminfo';
//     let x = {mminfo};
//     [MMINFO] as (keyof typeof x)[];
// }





function augmentMMInfo<T extends MMNode>(mminfo: MMInfo<T>) {
    let result = mminfo.addProps((node) => {
        let isMatch = toMatchFunction(toNormalPredicate(node.exactPredicate));
        let hasCaptures = parsePredicateSource(node.exactPredicate).captureNames.length > 0;
        let getCaptures = toMatchFunction(node.exactPredicate);

        return {isMatch, hasCaptures, getCaptures};
    });

    // TODO: NB!! keys here *must* match their refs in emit
    let extras = {CONTINUE: sentinels.CONTINUE, unhandledError: fatalError.UNHANDLED, isPromiseLike: isPromiseLike};
    return assign(result, extras) as typeof result & typeof extras;
}
