import {eliminateDeadCode} from './eliminate-dead-code';
import Emitter from './emitter';
import * as environment from './eval-environment';
import * as placeholders from './eval-placeholders';
import {getNormalisedFunctionSource} from './get-normalised-function-source';
import {makeParameterList} from './make-parameter-list';
import {replaceAll} from './replace-all';





// TODO: doc...
export default function emitDispatcher(emit: Emitter) {

    // TODO: temp testing...
    let source = getNormalisedFunctionSource(dispatcherTemplate);
    let replacements: Partial<Record<keyof typeof placeholders, string | boolean>> = {
        __MM_NAME__: emit.env.config.name,
        __MM_ARITY__: String(emit.env.config.arity || 1),
        __MM_PARAMS__: makeParameterList(emit.env.config.arity || 1),
    };
    source = replaceAll(source, replacements);
    source = eliminateDeadCode(source);
    emit(source);
}




// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
const dispatcherTemplate = function __MM_NAME__(__MM_PARAMS__: any) {

    // TODO: explain - template source can only include constructs that are supported by all target runtimes. So no ES6.
    // tslint:disable: no-shadowed-variable
    // tslint:disable: no-var-keyword
    // tslint:disable: only-arrow-functions

    var args = arguments.length <= __MM_ARITY__ ? false as const : copyArray(arguments);
    var disc: string | Promise<string> = args ? discriminator.apply(undefined, args) : discriminator(__MM_PARAMS__);

    if (typeof disc === 'string') {
        var thunk = selectThunk(disc);
        var res = thunk(disc, __MM_PARAMS__, args);
    }
    else {
        var res: unknown = disc.then(function (disc) {
            var thunk = selectThunk(disc);
            return thunk(disc, __MM_PARAMS__, args);
        });
    }
    return res;
};




const {copyArray, discriminator, selectThunk} = environment;
const {__MM_ARITY__} = placeholders;
