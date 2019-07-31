import {Options, OptionsObject} from '../../../interface/options';
import {defaultDiscriminator, makeDefaultUnhandled} from './default-options';




// TODO: jsdoc...
export function makeCompleteOptions(options: Options): Required<OptionsObject> {
    options = typeof options === 'function' ? {discriminator: options} : {...options};
    let name = options.name || `Ɱ${++multimethodCounter}`;
    let discriminator = options.discriminator || defaultDiscriminator;
    let unhandled = options.unhandled || makeDefaultUnhandled(discriminator);
    let unreachable = options.unreachable || function alwaysReachable() { return false; };

    return {name, discriminator, unhandled, unreachable};
}




// TODO: doc...
let multimethodCounter = 0;
