import {fatalError} from '../util';
import MultimethodOptions from './multimethod-options';





// TODO!... more normalisation / validation / defaults
export default function normaliseOptions(options?: Partial<MultimethodOptions>, staticArity?: MultimethodOptions['arity']): MultimethodOptions {

    // Ensure the options object exists, even if it is empty.
    options = options || {};

    // TODO: review all these defaults. ESP. toDiscriminant!!
    let arity = options.arity !== undefined ? options.arity : staticArity !== undefined ? staticArity : 'variadic';
    let timing = options.timing || 'mixed';
    let toDiscriminant = options.toDiscriminant || ((...args: any[]) => args.map(arg => (arg || '').toString()).join(''));
    let unhandled = options.hasOwnProperty('unhandled') ? options.unhandled : {}; // TODO: export a lib-defined UNHANDLED const
    let rules = options.rules || {};
    let emitES5 = options.emitES5 === true;
    let moreSpecific = options.moreSpecific || (() => undefined);
    let trace = options.trace === true;
    let strictChecks = options.strictChecks === true;

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
        emitES5,
        moreSpecific,
        trace,
        strictChecks
    };
}





// TODO: ...
function validateArity(arity: MultimethodOptions['arity'], staticArity?: MultimethodOptions['arity']) {

    // If *both* static and runtime arities are given, they must match.
    if (staticArity !== undefined && arity !== undefined && staticArity !== arity) {
        return fatalError('ARITY_MISMATCH');
    }
}





function validateRules(rules: MultimethodOptions['rules']) {
    Object.keys(rules).forEach(_ => {
        // TODO: anything to validate?
    });
}
