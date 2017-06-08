import {MultimethodError} from '../util';
import MultimethodOptions from './multimethod-options';
import {parsePredicatePattern} from '../set-theory/predicates';
import Rule from './rule';





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
    let moreSpecific = options.moreSpecific || tieBreakFn;
    let trace = options.trace === true;

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
        trace
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
        let captureNames = parsePredicatePattern(src).captureNames;
        if (captureNames.indexOf('next') === -1) return;
        throw new MultimethodError(`Predicate '${src}' uses reserved name 'next'`);
    });
}





/** Default implementation for returning the more-specific of the two given rules. */
function tieBreakFn(a: Rule, b: Rule): Rule | undefined {

    // All else being equal, localeCompare of pattern comments provides the rule order (comes before == more specific).
    let aComment = parsePredicatePattern(a.predicate.toString()).comment;
    let bComment = parsePredicatePattern(b.predicate.toString()).comment;
    if (aComment.localeCompare(bComment) < 0) return a;
    if (bComment.localeCompare(aComment) < 0) return b;

    // TODO: explain...
    return undefined;
}
