import Predicate from '../predicate';
import {MultimethodError} from '../util';
import MultimethodOptions from './multimethod-options';





// TODO!... more normalisation / validation / defaults
export default function normaliseOptions(options?: Partial<MultimethodOptions>, staticArity?: MultimethodOptions['arity']): MultimethodOptions {

    // Ensure the options object exists, even if it is empty.
    options = options || {};

    // TODO: review all these defaults. ESP. toDiscriminant!!
    let arity = options.arity !== undefined ? options.arity : staticArity !== undefined ? staticArity : 'variadic';
    let timing = options.timing || 'mixed';
    let toDiscriminant = options.toDiscriminant || ((...args: any[]) => args.map(arg => (arg || '').toString()).join(''));
    let unhandled = options.unhandled || {}; // TODO: export a lib-defined UNHANDLED const
    let rules = options.rules || {};
    let emitES5 = options.emitES5 === true;

    // TODO: more validation, eg signatures of given rules, legal arity, legal timing, legal discriminant, etc
    validateArity(arity, staticArity);
    validateRules(rules);

    // TODO: ...
    return {
        arity,
        timing,
        toDiscriminant,
        unhandled,
        rules,
        emitES5
    };
}





// TODO: ...
function validateArity(arity: MultimethodOptions['arity'], staticArity?: MultimethodOptions['arity']) {

    // If *both* static and runtime arities are given, they must match.
    if (staticArity !== undefined && arity !== undefined && staticArity !== arity) {
        throw new MultimethodError(`arity mismatch`); // TODO: improve diagnostic message
    }
}





// TODO: ...
function validateRules(rules: MultimethodOptions['rules']) {

    // TODO: ensure no pattern has a capture called 'next'
    Object.keys(rules).forEach(src => {
        let predicate = new Predicate(src);
        if (predicate.captureNames.indexOf('next') === -1) return;
        throw new MultimethodError(`Predicate '${predicate}' uses reserved name 'next'`);
    });

}
