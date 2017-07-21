import {CONTINUE} from '../sentinels';
import Emitter, {EmitEnvironment, EmitNode, createEmitter, EnvNames as names} from './emitter';
import emitDispatchFunction from './emit-dispatch-function';
import emitSelectorFunction from './emit-selector-function';
import emitThunkFunction from './emit-thunk-function';
import fatalError from '../util/fatal-error';
import isPromiseLike from '../util/is-promise-like';
import {MMInfo, MMNode} from '../analysis';
import repeat from '../util/string-repeat';
import {toMatchFunction, toNormalPredicate, parsePredicateSource} from '../math/predicates';





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
        const NODE_REF = `${names.ENV}.${names.ALL_NODES}[${i}]`;
        emit(`\n// -------------------- ${node.exactPredicate} --------------------`);
        emit(`var ${names.IS_MATCH}ː${node.identifier} = ${NODE_REF}.${names.IS_MATCH};`);
        if (node.hasCaptures) {
            emit(`var ${names.GET_CAPTURES}ː${node.identifier} = ${NODE_REF}.${names.GET_CAPTURES};`);
        }
        node.exactMethods.forEach((_, j) => {
            emit(`var ${names.METHOD}ː${node.identifier}${repeat('ᐟ', j)} = ${NODE_REF}.${names.EXACT_METHODS}[${j}];`);
        });
    });

    return emit;
}





// TODO: doc...
function createEmitEnvironment(mminfo: MMInfo<MMNode>): EmitEnvironment {
    let result = mminfo.addProps((node) => {
        let isMatch = toMatchFunction(toNormalPredicate(node.exactPredicate));
        let hasCaptures = parsePredicateSource(node.exactPredicate).captureNames.length > 0;
        let getCaptures = toMatchFunction(node.exactPredicate) as EmitNode['getCaptures'];
        return {isMatch, hasCaptures, getCaptures};
    }) as EmitEnvironment;
    result.isPromiseLike = isPromiseLike;
    result.CONTINUE = CONTINUE;
    result.unhandledError = fatalError.UNHANDLED;
    return result;
}





// TODO: doc...
function emitBanner(emit: Emitter, text: string) {
    let filler = text.replace(/./g, '=');
    emit(`\n\n/*====================${filler}====================*`);
    emit(` *                    ${text}                    *`);
    emit(` *====================${filler}====================*/`);
}
