// TODO: review all comments and terminology in here...
// TODO: explain what decorators are here, or refer to docs elsewhere (and write them).
import Pattern from '../pattern';
//import checkConsequentSignature from './check-consequent-signature';





/**
 * A Rule represents a single behaviour within a multimethod. It consists of a predicate and a method. The predicate
 * is a pattern that matches the set of discriminant values for which the method is applicable. The predicate also
 * determines the rule's specificity relative to other rules that are also applicable for a given discriminant. The
 * method is a function that receives the multimethod's arguments, and implements the desired behaviour. Rules may be
 * either normal rules, or meta-rules.
 * TODO: explain normal/meta...
 */
export default class Rule {


    /**
     * Constructs a Rule instance.
     * @param {string} patternSource - The source string for the rule's predicate pattern.
     * @param {Function} method - a function that implements the rule's behaviour.



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
    constructor(patternSource: string, method: Function) {

        // Construct the pattern instance, and assign the pattern and method properties.
        let pattern = this.predicate = new Pattern(patternSource); // NB: may throw
        //this.name = pattern.identifier;
        this.method = method;

// TODO: temp testing... will we (can we?) still check sig at runtime?
        //checkConsequentSignature(method, pattern);
        this.isMetaRule = method[IS_META] === true;
    }


    /** A name for the rule. Defaults to the value of the pattern's `identifier` property. */
    //name: string;


    /** The pattern associated with this Method instance. */
    predicate: Pattern;


    /** The handler associated with this Method instance, exactly as it was provided to the constructor. */
    method: Function;//TODO: type this better...


    /** Indicates whether the consequent function represents a decorator. Decorators have a '$next' formal parameter */
    isMetaRule: boolean;
}





// TODO: copypasta with index.ts. Factor out this const into a symbol in its own file
const IS_META = '__meta';
