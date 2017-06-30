// TODO: review all comments and terminology in here...
// TODO: explain what decorators are here, or refer to docs elsewhere (and write them).
import {Predicate, toPredicate} from '../set-theory/predicates';





/**
 * A Rule represents a single behaviour within a multimethod. It consists of a predicate and a handler. The predicate
 * is a pattern that matches the set of discriminant values for which the method is applicable. The predicate also
 * determines the rule's specificity relative to other rules that are also applicable for a given discriminant. The
 * handler is a function that receives the multimethod's arguments, and implements the desired behaviour. Rules may be
 * either normal rules, or meta-rules.
 * TODO: explain normal/meta...
 */
export default class Rule {


    /**
     * Constructs a Rule instance.
     * @param {string} predicateSource - The source string for the rule's predicate.
     * @param {Function} handler - a function that implements the rule's behaviour.



TODO:... fix comment...



     *        It may be invoked when the RuleSet containing this rule is executed against an address and request. Each
     *        of the `handler` function's formal parameter names must match either a capture name from the pattern, or
     *        a builtin name such as `$req` or `$next`. Capture values and/or builtin values are passed as the actual
     *        parameters to the `handler` function upon invocation. The handler may return its result synchronously or
     *        asynchronously. An asynchronous handler must return a Promises/A+ instance whose eventual value holds
     *        the handler's response. Any non-CONTINUE (eventual) return value from `handler` is interpreted as a
     *        response. A `CONTINUE` (eventual) return value signifies that the handler declined to respond to the
     *        given request, even if the pattern matched the request's address.
     */
    constructor(predicateSource: string, method: Function) {
        this.predicate = toPredicate(predicateSource); // NB: may throw
        this.handler = method;
    }


    /** The predicate associated with this Rule instance, exactly as it was provided to the constructor. */
    predicate: Predicate;

    /** The handler associated with this Rule instance, exactly as it was provided to the constructor. */
    handler: Function;//TODO: type this better...

    // TODO: temp testing... formalise...
    chain?: Function[];
}
