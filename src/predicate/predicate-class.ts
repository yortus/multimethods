// TODO: temp testing, import specifically what's needed here
import * as branded from './branded';





/**
 * Singleton instance holding every normalized predicate that has been instantiated. Subsequent instantiations of the
 * same normalized predicate return the same singleton instance from this map. NB: This is declared before the Predicate
 * class to ensure it is has been initialized before the the static property initialiser for Predicate.ANY is run.
 */
const normalizedPredicateCache = new Map<string, PredicateClass>();





/**
 * A predicate is a dialect of regular expression that recognizes a particular set of strings. Predicate syntax is restricted
 * to a small set of fit-for-purpose operators and literals. The limited syntax facilitates set operations on predicates,
 * such as intersection. Predicates are case-sensitive. Every predicate has a unique normalized form that recognizes the
 * same set of strings. Instances of normalized predicates are guaranteed to be singletons, so such predicates may be safely
 * compared using strict equality ('==='). Consult the documentation for details about the predicate pattern syntax.
 */
export default class PredicateClass {


    /**
     * Constructs or returns a Predicate instance. If `pattern` represents a normalized predicate, the corresponding
     * singleton instance of that normalized predicate will be returned. Otherwise, a new Predicate instance will be
     * constructed. Throws an error if `pattern` is not a valid predicate pattern string.
     * @param {string} pattern - the predicate specified as a pattern string.
     */
    constructor(private pattern: string) {

        // Parse the predicate pattern to test its validity and to get syntax information. NB: may throw.
        let ast = branded.parse(pattern);

        // If the pattern is already normalized, return the singleton instance from the normalized predicate cache.
        if (pattern === ast.signature) {
            let instance = normalizedPredicateCache.get(pattern);
            if (instance) return instance;

            // If not already cached, add this instance to the cache and proceed with construction.
            normalizedPredicateCache.set(pattern, this);
        }

        // Initialize members.
        this.normalized = new PredicateClass(ast.signature); // NB: recursive.
        this.identifier = ast.identifier;
        this.captureNames = ast.captures.filter(capture => capture !== '?');
        this.comment = pattern.split('#')[1] || '';
        this.match = branded.makeMatchFunction(pattern, ast);
    }


    /**
     * The normalized form of this predicate, which recognizes the same set of strings as this instance. Two predicates that
     * recognize the same set of strings are guaranteed to have the same normalized form.
     */
    normalized: PredicateClass;


    /**
     * A string that is visually similar to the normalized form of this predicate, but is a valid Identifier
     * as per the ECMAScript grammar (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-names-and-keywords).
     * Different normalized forms are guaranteed to have different identifiers.
     */
    identifier: string;


    /**
     * A array of strings whose elements correspond, in order, to the named captures in the predicate. For example, the
     * predicate pattern '{...path}/*.{ext}' has the `captureNames` value ['path', 'ext'].
     */
    captureNames: string[];


    /** The text of the comment portion of the predicate pattern, or '' if there is no comment. */
    comment: string;


    /**
     * Attempts to recognize the given string by matching it against this predicate. If the match is successful, an object
     * is returned containing the name/value pairs for each named capture that unifies the string with this predicate. If
     * the match fails, the return value is null.
     * @param {string} string - the string to recognize.
     * @returns {Object} null if the string is not recognized by the predicate. Otherwise, a hash of captured name/value
     *          pairs that unify the string with this predicate.
     */
    match: (string: string) => {[captureName: string]: string} | null;


    /**
     * Computes the intersection of `this` predicate and the `other` predicate. The intersection recognizes a
     * string if and only if that string is recognized by *both* the input predicates. Because intersections
     * cannot in general be expressed as a single predicate, the result is given as an array of normalized
     * predicates, to be interpreted as follows:
     * (1) An empty array. This means the input predicates are disjoint.
     *     That is, there are no strings that are recognized by both input predicates.
     *     Example: 'foo' ∩ 'bar' = []
     * (2) An array with one element. This means the intersection may be represented
     *     by a single predicate, whose normalized form is contained in the array.
     *     Example: 'a*' ∩ '*b' = ['a*b']
     * (3) An array with multiple elements. The array contains a list of mutually disjoint predicates, the union
     *     of whose recognized strings are precisely those strings that are recognized by both of the input predicates.
     *     Example: 'test.*' ∩ '*.js' = ['test.js', 'test.*.js']
     * @param {Predicate} other - a predicate instance. May or may not be normalized.
     * @returns {Predicate[]} - an array of normalized predicates representing the intersection of the input predicates.
     */
    intersect(other: PredicateClass): PredicateClass[] {
        let intersections = branded.intersect(this.toString() as branded.Predicate, other.toString() as branded.Predicate);
        return intersections.map(pattern => new PredicateClass(pattern));
    }


    /** Returns the pattern string with which this instance was constructed. */
    toString() { return this.pattern; }


    /** A singleton predicate that recognises *all* strings. */
    static ANY = new PredicateClass(branded.ANY);
}
