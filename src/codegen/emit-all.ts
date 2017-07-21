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
import Emitter, {EmitEnvironment, EmitNode, createEmitter, EnvNames as names} from './emitter';





/** TODO: doc... */
export default function emitAll(mminfo: MMInfo<MMNode>) {
    let env = createEmitEnvironment(mminfo);
    let emit = createEmitter(env);
    
    // Generate the combined source code for the multimethod. This includes local variable declarations for
    // all predicates and methods, as well as the interdependent thunk function declarations that perform
    // the cascading, and possibly asynchronous, evaluation of each multimethod call.
    emitBanner(emit, 'MULTIMETHOD DISPATCHER');
    emitDispatchFunction(emit, env.options.name, env.options.arity, names);

    emitBanner(emit, 'THUNK SELECTOR');
    emitSelectorFunction(emit, env, names);

    emitBanner(emit, 'THUNKS');
    env.allNodes.forEach(node => {
        emit(`\n// -------------------- ${node.exactPredicate} --------------------`);
        node.methodSequence.forEach((_, i, seq) => {
            emitThunkFunction(emit, env, seq, i, names);
        });
    });

    emitBanner(emit, 'ENVIRONMENT');
    emit(`var ${names.IS_PROMISE_LIKE} = ${names.ENV}.${names.IS_PROMISE_LIKE};`);
    emit(`var ${names.CONTINUE} = ${names.ENV}.${names.CONTINUE};`);
    emit(`var ${names.UNHANDLED_ERROR} = ${names.ENV}.${names.UNHANDLED_ERROR};`);
    emit(`var ${names.TO_DISCRIMINANT} = ${names.ENV}.${names.OPTIONS}.${names.TO_DISCRIMINANT};`);
    emit(`var ${names.EMPTY_OBJECT} = Object.freeze({});`);
    env.allNodes.forEach((node, i) => {
        emit(`\n// -------------------- ${node.exactPredicate} --------------------`);
        emit(`var ${names.IS_MATCH}ː${node.identifier} = ${names.ENV}.${names.ALL_NODES}[${i}].${names.IS_MATCH};`);
        if (node.hasCaptures) {
            emit(`var ${names.GET_CAPTURES}ː${node.identifier} = ${names.ENV}.${names.ALL_NODES}[${i}].${names.GET_CAPTURES};`);
        }
        node.exactMethods.forEach((_, j) => {
            emit(`var ${names.METHOD}ː${node.identifier}${repeat('ᐟ', j)} = ${names.ENV}.${names.ALL_NODES}[${i}].${names.EXACT_METHODS}[${j}];`);
        });
    });


    let mm = emit.build();




// TODO: temp testing... neaten/improve emit of wrapper?
if (debug.enabled) {
    let mmname = env.options.name;
    let oldmm = mm;
    mm = function _dispatch(...args: any[]) {
        debug(`${DISPATCH} |-->| ${mmname}   discriminant='%s'   args=%o`, env.options.toDiscriminant(...args), args);
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





function emitBanner(emit: Emitter, text: string) {
    let filler = text.replace(/./g, '=');
    emit(`\n\n/*====================${filler}====================*`);
    emit(` *                    ${text}                    *`);
    emit(` *====================${filler}====================*/`);
}
