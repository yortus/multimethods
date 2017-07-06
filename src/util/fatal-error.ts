import debug, {FATAL} from './debug';
import {format} from 'util';  // TODO: ensure this node.js dep doesn't prevent clientside use (eg via webpack)
export default fatalError;





function fatalError(error: 'ARITY_MISMATCH'): never;
function fatalError(error: 'DUPLICATE_PREDICATE', normalised: string, predicates: string): never;
function fatalError(error: 'MULTIPLE_FALLBACKS_FROM', predicate: string, fallbacks: string): never;
function fatalError(error: 'MULTIPLE_PATHS_TO', predicate: string): never;
function fatalError(error: 'MIXED_CHAIN', predicate: string): never;
function fatalError(error: 'PREDICATE_SYNTAX', message: string): never;
function fatalError(error: 'UNHANDLED'): never;
function fatalError(error: 'VALIDATION', problems: string): never;
function fatalError(error: keyof typeof messages, ...params: (string|number)[]): never {
    let message = format(messages[error], ...params);
    debug(`${FATAL} %s`, message);
    throw new MultimethodError(message);
}





export const messages = {
    'ARITY_MISMATCH': `arity mismatch`, // TODO: improve diagnostic message
    'DUPLICATE_PREDICATE': `The predicate '%s' is duplicated across multiple methods: %s. To resolve this, use a method chain.`,
    'MIXED_CHAIN': `Chain for predicate '%s' has metahandler(s) to the right of regular handler(s). Metahandlers must be leftmost in the chain.`,
    'MULTIPLE_FALLBACKS_FROM': `Multiple possible fallbacks from '%s': %s`,
    'MULTIPLE_PATHS_TO': `Multiple paths to '%s' with different meta-methods`,
    'PREDICATE_SYNTAX': `Predicate syntax error: %s`,
    'UNHANDLED': `Multimethod dispatch failure: call was unhandled for the given arguments`,
    'VALIDATION': `Multimethod validation failed. The following problems were found: %s`,
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
