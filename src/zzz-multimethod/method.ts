// TODO: review all comments and terminology in here...
// TODO: explain what decorators are here, or refer to docs elsewhere (and write them).
import Pattern from '../pattern';
import checkConsequentSignature from './check-consequent-signature';





/**
 * A Method represents a single behaviour within a multimethod. It consists of a predicate and a consequent. The
 * predicate is a pattern that matches the set of discriminant values for which the method is applicable, and determines
 * the method's specificity relative to other applicable methods. The consequent is a function that receives the
 * multimethod's arguments and implements the desired behaviour. Methods may be either actions or decorators.
 */
export default class Method {


    /**
     * Constructs a Method instance.
     * @param {string} patternSource - The source string for the method's predicate pattern.
     * @param {Function} consequent - a function providing processing logic for producing a reponse from a given request.



TODO:... fix comment...



     *        It may be invoked when the RuleSet containing this rule is executed against an address and request. Each
     *        of the `handler` function's formal parameter names must match either a capture name from the pattern, or
     *        a builtin name such as `$req` or `$next`. Capture values and/or builtin values are passed as the actual
     *        parameters to the `handler` function upon invocation. The handler may return its result synchronously or
     *        asynchronously. An asynchronous handler must return a Promises/A+ instance whose eventual value holds
     *        the handler's response. Any non-UNHANDLED (eventual) return value from `handler` is interpreted as a
     *        response. An `UNHANDLED` (eventual) return value signifies that the handler declined to respond to the
     *        given request, even if the pattern matched the request's address.
     */
    constructor(patternSource: string, consequent: Function) {

        // Construct the pattern instance, and assign the pattern and handler properties.
        let pattern = this.predicate = new Pattern(patternSource); // NB: may throw
        this.consequent = consequent;

// TODO: temp testing...
        checkConsequentSignature(consequent, pattern);
        this.isDecorator = consequent.length === 3;
    }


    /** The pattern associated with this Method instance. */
    predicate: Pattern;


    /** The handler associated with this Method instance, exactly as it was provided to the constructor. */
    consequent: Function;//TODO: type this better...


    /** Indicates whether the consequent function represents a decorator. Decorators have a '$next' formal parameter */
    isDecorator: boolean;
}
