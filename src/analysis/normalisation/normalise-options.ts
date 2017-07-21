import defaultDiscriminator from './default-discriminator';
import normaliseMethods from './normalise-methods';
import NormalOptions from './normal-options';
import Options from '../../options';





// TODO: ...
export default function normaliseOptions(options: Options) {
    let name = options.name || `MM${++multimethodCounter}`;
    let arity = options.arity;
    let async = options.async;
    let strict = options.strict || false;
    let toDiscriminant = options.toDiscriminant || defaultDiscriminator;
    let methods = normaliseMethods(options.methods);

    return {name, arity, async, strict, toDiscriminant, methods} as NormalOptions;
}





// TODO: doc...
let multimethodCounter = 0;
