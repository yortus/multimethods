import {MMInfo, MMNode} from '../analysis';
import Emitter, {EnvNames} from './emitter';
import {DispatchFunctionSubstitutions, dispatchFunctionTemplate} from './template-code';
import {transformTemplate} from './template-transforms';





// TODO: doc...
export default function emitDispatchFunction(emit: Emitter, mminfo: MMInfo<MMNode>, names: typeof EnvNames) {

    // TODO: temp testing...
    emitDispatchFunctionFromTemplate(emit, mminfo.options.name, mminfo.options.arity, {
        CONTINUE: names.CONTINUE,
        ERROR_UNHANDLED: names.ERROR_UNHANDLED,
        ERROR_INVALID_RESULT: names.ERROR_INVALID_RESULT,
        TO_DISCRIMINANT: names.TO_DISCRIMINANT,
        SELECT_THUNK: names.SELECT_THUNK,
        IS_ASYNC_RESULT_REQUIRED: mminfo.options.strict && mminfo.options.async === true
    });
}





// TODO: doc...
function emitDispatchFunctionFromTemplate(emit: Emitter, name: string, arity: number|undefined, env: DispatchFunctionSubstitutions) {
    let source = transformTemplate(dispatchFunctionTemplate, name, arity, env);
    emit(source);
}
