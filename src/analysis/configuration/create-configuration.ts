import {Options} from '../../options';
import {fatalError} from '../../util';
import {Configuration} from './configuration';
import {defaultDiscriminator} from './default-discriminator';




// TODO: doc...
export function createConfiguration(options: Options) {
    let name = options.name || `Ɱ${++multimethodCounter}`;
    let arity = options.arity;
    let async = options.async;
    let strict = options.strict || false;
    let discriminator = options.discriminator || defaultDiscriminator;
    let methods = getNormalisedMethods(options.methods);
    let unreachable = options.unreachable || alwaysReachable;
    let unhandled = options.unhandled || fatalError.UNHANDLED;
    return {name, arity, async, strict, discriminator, methods, unreachable, unhandled} as Configuration;
}




// TODO: doc...
function getNormalisedMethods(methods: Options['methods']) {
    methods = methods || {};
    let result = {} as Configuration['methods'];
    for (let predicate in methods) {
        if (!methods.hasOwnProperty(predicate)) continue;
        let chain = methods[predicate];
        if (!Array.isArray(chain)) chain = [chain];
        result[predicate] = chain;
    }
    return result;
}




// TODO: doc...
function alwaysReachable() {
    return false;
}




// TODO: doc...
let multimethodCounter = 0;
