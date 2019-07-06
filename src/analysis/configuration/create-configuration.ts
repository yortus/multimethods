import {Options} from '../../options';
import {fatalError} from '../../util';
import {Configuration} from './configuration';
import {defaultDiscriminator} from './default-discriminator';




// TODO: doc...
export function createConfiguration(options: Options) {
    let name = options.name || `Ɱ${++multimethodCounter}`;
    let discriminator = options.discriminator || defaultDiscriminator;
    let unreachable = options.unreachable || alwaysReachable;
    let unhandled = options.unhandled || fatalError.UNHANDLED;
    return {name, discriminator, unreachable, unhandled} as Configuration;
}




// TODO: doc...
function alwaysReachable() {
    return false;
}




// TODO: doc...
let multimethodCounter = 0;
