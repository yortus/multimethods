import debug, {FATAL} from './debug';
import {format} from 'util';  // TODO: ensure this node.js dep doesn't prevent clientside use (eg via webpack)





namespace fatalError {

    export function DUPLICATE_PREDICATE(normalised: string, predicates: string) {
        let fmt = `The predicate '%s' is duplicated across multiple methods: %s. To resolve this, use a method chain.`;
        return error(format(fmt, normalised, predicates));
    }

    export function INVALID_ARITY_OPTION(value: any) {
        let fmt = `Expected a positive integer or undefined value for options.arity, but found %j.`;
        return error(format(fmt, value));
    }

    export function INVALID_ASYNC_OPTION(value: any) {
        let fmt = `Expected a boolean or undefined value for options.async, but found %j.`;
        return error(format(fmt, value));
    }

    export function INVALID_STRICT_OPTION(value: any) {
        let fmt = `Expected a boolean or undefined value for options.strict, but found %j.`;
        return error(format(fmt, value));
    }

    export function INVALID_TO_DISCRIMINANT_OPTION() {
        let fmt = `Expected a function or undefined value for options.toDiscriminant.`;
        return error(format(fmt));
    }

    export function MIXED_CHAIN(predicate: string) {
        let fmt = `Chain for predicate '%s' has meta-method(s) to the right of regular method(s). Meta-methods must be leftmost in the chain.`;
        return error(format(fmt, predicate));
    }

    export function MULTIPLE_FALLBACKS_FROM(predicate: string, fallbacks: string) {
        let fmt = `Multiple possible fallbacks from '%s': %s`;
        return error(format(fmt, predicate, fallbacks));
    }

    export function MULTIPLE_PATHS_TO(predicate: string) {
        let fmt = `Multiple paths to '%s' with different meta-methods`;
        return error(format(fmt, predicate));
    }

    export function PREDICATE_SYNTAX(message: string) {
        let fmt = `Predicate syntax error: %s`;
        return error(format(fmt, message));
    }

    export function UNHANDLED() {
        let fmt = `Multimethod dispatch failure: call was unhandled for the given arguments`;
        return error(format(fmt));
    }

    export function STRICT_VALIDATION(problems: string[]) {
        let fmt = `Strict validation failed. The following problems were found: %s`;
        return error(format(fmt, '\n' + problems.map((p, i) => `${i + 1}. ${p}`).join('\n')));
    }
}
export default fatalError;





function error(message: string): never {
    debug(`${FATAL} %s`, message);
    throw new MultimethodError(message);
}





// TODO: doc...
class MultimethodError extends Error {

    constructor(message: string) {
        super(message);

        // Workaround for ES5.
        // See https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
        Object.setPrototypeOf(this, MultimethodError.prototype);
    }
}





declare global {
    interface Object {
        setPrototypeOf(o: any, proto: object | null): any;
    }
}
