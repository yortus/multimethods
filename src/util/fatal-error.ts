import debug, {FATAL} from './debug';
import {format} from 'util';  // TODO: ensure this node.js dep doesn't prevent clientside use (eg via webpack)
export default fatalError;





function fatalError(error: 'AMBIGUOUS_RULE_ORDER', ruleA: string, ruleB: string): never;
function fatalError(error: 'ARITY_MISMATCH'): never;
function fatalError(error: 'MISSING_CATCHALL'): never;
function fatalError(error: 'MISSING_INTERSECTIONS', intersections: string): never;
function fatalError(error: 'MULTIPLE_FALLBACKS_FROM', predicate: string, fallbacks: string): never;
function fatalError(error: 'MULTIPLE_PATHS_TO', predicate: string): never;
function fatalError(error: 'MIXED_CHAIN', predicate: string): never;
function fatalError(error: 'PREDICATE_SYNTAX', message: string): never;
function fatalError(error: 'UNHANDLED'): never;
function fatalError(error: keyof typeof messages, ...params: (string|number)[]): never {
    let message = format(messages[error], ...params);
    debug(`${FATAL} %s`, message);
    throw new MultimethodError(message);
}





export const messages = {
    'AMBIGUOUS_RULE_ORDER': `Ambiguous rule ordering - which is more specific of '%s' and '%s'?`,
    'ARITY_MISMATCH': `arity mismatch`, // TODO: improve diagnostic message
    'MISSING_CATCHALL': `Multimethod has no catch-all handler, so some calls may not be dispatchable. To resolve this problem, provide a handler for the predicate '...'.`,
    'MISSING_INTERSECTIONS': `Multimethod has ambiguities where some handlers overlap. To resolve this problem, provide handlers for these predicates: %s.`,
    'MIXED_CHAIN': `Chain for predicate '%s' has metahandler(s) to the right of regular handler(s). Metahandlers must be leftmost in the chain.`,
    'MULTIPLE_FALLBACKS_FROM': `Multiple possible fallbacks from '%s': %s`,
    'MULTIPLE_PATHS_TO': `Multiple paths to '%s' with different meta-rules`,
    'PREDICATE_SYNTAX': `Predicate syntax error: %s`,
    'UNHANDLED': `Multimethod dispatch failure: call was unhandled for the given arguments`,
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
