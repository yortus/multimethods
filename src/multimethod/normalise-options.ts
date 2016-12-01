import {MultimethodError} from '../util';
import MultimethodOptions from './multimethod-options';





// TODO!... more normalisation / validation / defaults
export default function normaliseOptions(options?: Partial<MultimethodOptions>, staticArity?: number | 'variadic'): MultimethodOptions {

    // Ensure the options object exists, even if it is empty.
    options = options || {};

    // If *both* static and runtime arities are given, they must match.
    if (typeof staticArity === 'number' && typeof options.arity === 'number' && staticArity !== options.arity) {
        throw new MultimethodError(`arity mismatch`); // TODO: improve diagnostic message
    }

    // TODO: more validation, eg signatures of given rules, legal arity, legal timing, legal discriminant, etc

    // TODO: review all these defaults. ESP. toDiscriminant!!
    const arity = typeof options.arity === 'number' ? options.arity : staticArity;
    const timing = options.timing || 'mixed';
    let toDiscriminant = options.toDiscriminant || ((...args: any[]) => args.map(arg => (arg || '').toString()).join(''));
    let unhandled = options.unhandled || {}; // TODO: export a lib-defined UNHANDLED const
    let rules = options.rules || {};
    let emitES5 = options.emitES5 === true;

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
