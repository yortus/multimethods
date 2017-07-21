import debug, {DISPATCH} from '../util/debug';
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
import {EmitEnvironment, EmitNode, createEmitter} from './emitter';





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
    let mminfo = createEmitEnvironment(mminfo0);
    let emit = createEmitter(mminfo);

    // TODO: revise comment... terminology has changed
    // Generate the combined source code for the multimethod. This includes local variable declarations for
    // all predicates and methods, as well as the interdependent function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of each multimethod call.
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
    emit(`var ${IS_PROMISE_LIKE} = env.isPromiseLike;`);
    emit(`var ${CONTINUE} = env.CONTINUE;`);
    emit(`var ${UNHANDLED_ERROR} = env.unhandledError;`);
    emit(`var ${TO_DISCRIMINANT} = env.options.toDiscriminant;`);
    emit(`var ${EMPTY_OBJECT} = Object.freeze({});`);
    mminfo.allNodes.forEach((node, i) => {
        emit(`var ${IS_MATCH_PREFIX}${node.identifier} = env.allNodes[${i}].isMatch;`);
        if (node.hasCaptures) {
            emit(`var ${GET_CAPTURES_PREFIX}${node.identifier} = env.allNodes[${i}].getCaptures;`);
        }
        node.exactMethods.forEach((_, j) => {
            emit(`var ${METHOD_PREFIX}${node.identifier}${repeat('ᐟ', j)} = env.allNodes[${i}].exactMethods[${j}];`);
        });
    });


    let mm = emit.build();




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





function createEmitEnvironment(mminfo: MMInfo<MMNode>): EmitEnvironment {
    let result = mminfo.addProps((node) => {
        let isMatch = toMatchFunction(toNormalPredicate(node.exactPredicate));
        let hasCaptures = parsePredicateSource(node.exactPredicate).captureNames.length > 0;
        let getCaptures = toMatchFunction(node.exactPredicate) as EmitNode['getCaptures'];
        return {isMatch, hasCaptures, getCaptures};
    }) as EmitEnvironment;
    result.isPromiseLike = isPromiseLike;
    result.CONTINUE = sentinels.CONTINUE;
    result.unhandledError = fatalError.UNHANDLED;
    return result;
}
