import {MMInfo, MMNode} from '../analysis';
import * as predicates from '../math/predicates';





// TODO: doc...
export default interface Emitter {
    env: EmitEnvironment;
    (...lines: string[]): void;
    generate(): Function;
}





// TODO: doc...
export interface EmitEnvironment extends MMInfo<EmitNode> {
    unhandled: (discriminant: string) => unknown;
}





// TODO: doc...
export interface EmitNode extends MMNode {
    isMatch: (discriminant: string) => {} | null;
    hasPatternBindings: boolean;
    getPatternBindings: (discriminant: string) => {[bindingName: string]: string};
}





// TODO: doc...
export function createEmitter(env: EmitEnvironment) {
    let allLines = [] as string[];

    function emit(...args: string[]) {
        args.forEach(lines => {
            lines.split('\n').forEach(line => {
                allLines.push(line);
            });
        });
    }

    let result = emit as Emitter;
    result.env = env;
    result.generate = () => evalMultimethodFromSource(env, allLines.join('\n'));
    return result;
}





// TODO: doc...
function evalMultimethodFromSource(mminfo: EmitEnvironment, source: string) {

    // Static sanity check that the names and structures assumed in emitted code match those statically declared in the
    // EmitEnvironment var. A mismatch could arise for instance if IDE-based rename/refactor tools are used to change
    // property names, etc. Such tools won't pick up the references in emitted code, which would lead to ReferenceError
    // exceptions at runtime when the emitted code is evaluated. The following statements don't do anything, but they
    // will cause static checking errors if refactorings have occured, and they indicate which names/structures assumed
    // in the emitted code will need to be updated to agree with the refactored code.
    // const globProps = {env};
    // const {...envProps} = env;
    // const {...cfgProps} = env.config;
    // const {...nodeProps} = env.allNodes[0];
    // tslint:disable:no-unused-expression
    // [EnvNames.ENV] as Array<keyof typeof globProps>;
    // [EnvNames.UNHANDLED] as Array<keyof typeof envProps>;
    // [EnvNames.CONFIG] as Array<keyof typeof envProps>;
    // [EnvNames.ALL_NODES] as Array<keyof typeof envProps>;
    // [EnvNames.DISCRIMINATOR] as Array<keyof typeof cfgProps>;
    // [EnvNames.IS_MATCH] as Array<keyof typeof nodeProps>;
    // [EnvNames.GET_PATTERN_BINDINGS] as Array<keyof typeof nodeProps>;
    // [EnvNames.EXACT_METHODS] as Array<keyof typeof nodeProps>;
    // tslint:enable:no-unused-expression

    // Evaluate the multimethod's entire source code to obtain the multimethod function. The use of eval here is safe.
    // There are no untrusted inputs substituted into the source. The client-provided methods can do anything (so may
    // be considered untrusted), but that has nothing to do with the use of 'eval' here, since they would need to be
    // called by the dispatcher whether or not eval was used. More importantly, the use of eval here allows for
    // multimethod dispatch code that is both more readable and more efficient, since it is tailored specifically
    // to the configuration of this multimethod, rather than having to be generalized for all possible cases.
    // tslint:disable-next-line:no-eval
    let mm = eval(`(${source})`)(mminfo, predicates);

    // TODO: was... let mm = eval(`(function () { ${source}; return ${mminfo.config.name}; })`)() as Function;
    mm.toString = () => source;
    return mm;
}





// TODO: doc... assumed names...
//              define each once and ref multiple times. These must be consistently named throughout emitted code
export enum EnvNames {

    // UNHANDLED = 'unhandled',
    // DISCRIMINATOR = 'discriminator',
    // EMPTY_OBJECT = 'emptyObject',
    // COPY_ARRAY = 'copyArray',
    SELECT_THUNK = 'selectThunk',


//    ENV = 'env',
    CONFIG = 'config',
    ALL_NODES = 'allNodes',
    IS_MATCH = 'isMatch',
    GET_PATTERN_BINDINGS = 'getPatternBindings',
    EXACT_METHODS = 'exactMethods',
    THUNK = 'thunk',
    METHOD = 'method',
}
