import {MMInfo, MMNode} from '../analysis';
import Emitter, {EnvNames} from './emitter';
import {DispatchFunctionSubstitutions as Substs, dispatchFunctionTemplate} from './template-code';
import {transformTemplate} from './template-transforms';





// TODO: doc...
export default function emitDispatchFunction(emit: Emitter, mminfo: MMInfo<MMNode>, names: typeof EnvNames) {

    // TODO: temp testing...
    emitDispatchFunctionFromTemplate(emit, mminfo.config.name, mminfo.config.arity || 1, {
        IS_PROMISE_LIKE: names.IS_PROMISE_LIKE,
        CONTINUE: names.CONTINUE,
        ERROR_UNHANDLED: names.ERROR_UNHANDLED,
        ERROR_INVALID_RESULT: names.ERROR_INVALID_RESULT,
        TO_DISCRIMINANT: names.TO_DISCRIMINANT,
        SELECT_THUNK: names.SELECT_THUNK,
        ARITY: `${mminfo.config.arity || 1}`,
    });
}





// TODO: doc...
function emitDispatchFunctionFromTemplate(emit: Emitter, name: string, arity: number|undefined, env: Substs) {
    let source = transformTemplate(dispatchFunctionTemplate, name, arity, env);
    emit(source);
}
