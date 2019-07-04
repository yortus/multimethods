import {Options} from '../options';
import {debug, fatalError} from '../util';
import {checkMethods} from './check-methods';
import {listDiscontinuities} from './list-discontinuities';





// TODO: doc...
export function checkOptions(options: Options): void {

    // `name` must be either undefined, or conform to [A-Za-z$_][A-Za-z$_0-9]* (ie a simple JS indentifier).
    if (options.name !== undefined) {
        let isValid = typeof options.name === 'string';
        isValid = isValid && /[A-Za-z$_][A-Za-z$_0-9]*/.test(options.name);
        if (!isValid) return fatalError.INVALID_NAME_OPTION(options.name);
    }

    // `arity` must be either undefined, or else a positive integer.
    if (options.arity !== undefined) {
        let isValid = typeof options.arity === 'number';
        isValid = isFinite(options.arity) && options.arity > 0;
        isValid = isValid && Math.floor(options.arity) === options.arity;
        if (!isValid) return fatalError.INVALID_ARITY_OPTION(options.arity);
    }

    // `async` must be either undefined, or else a boolean.
    if (options.async !== undefined) {
        let isValid = typeof options.async === 'boolean';
        if (!isValid) return fatalError.INVALID_ASYNC_OPTION(options.async);
    }

    // `strict` must be either undefined, or else a boolean.
    if (options.strict !== undefined) {
        let isValid = typeof options.strict === 'boolean';
        if (!isValid) return fatalError.INVALID_STRICT_OPTION(options.strict);
    }

    // `toDiscriminant` must be either undefined, or else a function.
    if (options.discriminator !== undefined) {
        let isValid = typeof options.discriminator === 'function';
        if (!isValid) return fatalError.INVALID_DISCRIMINATOR_OPTION();
    }

    // `methods` must be either undefined, or else a methods hash. Delegate this check.
    if (options.methods !== undefined) {
        checkMethods(options.methods);
    }

    // `unreachable` must be either undefined, or else a function.
    if (options.unreachable !== undefined) {
        let isValid = typeof options.unreachable === 'function';
        if (!isValid) return fatalError.INVALID_UNREACHABLE_OPTION();
    }

    // Perform strict validation. If any problems are found:
    // - issue a fatal error if options.strict is true.
    // - otherwise issue debug messages if debug.enabled is true
    // TODO: other static checks...
    // - Function.length of methods+toDiscriminant must match arity
    // - method body must reference capture names of its predicate (relax if in chain?)
    // - no AsyncFunction methods if mm is declared sync
    let problems = listDiscontinuities(options.methods);
    if (options.strict) {
        if (problems.length > 0) return fatalError.STRICT_VALIDATION(problems);
    }
    else if (debug.enabled) {
        problems.forEach(problem => debug(`${debug.VALIDATE} %s`, problem));
    }
}
