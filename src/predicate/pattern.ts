import intersectPatterns from './intersect-patterns';
import makeMatchMethod, {MatchMethod} from './make-match-method';
import parsePattern from './pattern-parser';





/**
 * Holds a singleton instance for every normalized pattern that has been instantiated. Subsequent instantiations of the
 * same normalized pattern return the same singleton instance from this map. NB: This is declared before the Pattern
 * class to ensure it is has been initialized before the the static property initializer for ANY is run.
 */
const normalizedPatternCache = new Map<string, Pattern>();





/**
 * A pattern is a specific dialect of regular expression that recognizes a set of strings. Pattern syntax is restricted
 * to a small set of fit-for-purpose operators and literals. The limited syntax facilitates set operations on patterns,
 * such as intersection. Patterns are case-sensitive. Every pattern has a unique normalized form that recognizes the
 * same set of strings. Instances of normalized patterns are guaranteed to be singletons, so such patterns may be safely
 * compared using strict equality ('==='). Consult the documentation for details about the pattern DSL syntax.
 */
export default class Pattern {


    /**
     * Constructs or returns a Pattern instance. If `source` represents a normalized pattern, the corresponding
     * singleton instance of that normalized pattern will be returned. Otherwise, a new Pattern instance will be
     * constructed. Throws an error if `source` is not a valid pattern source string.
     * @param {string} source - the pattern specified as a pattern DSL string.
     */
    constructor(private source: string) {

        // Parse the source string to test its validity and to get syntax information. NB: may throw.
        let ast = parsePattern(source);

        // If the source is already normalized, return the singleton instance from the normalized pattern cache.
        if (source === ast.signature) {
            let instance = normalizedPatternCache.get(source);
            if (instance) return instance;

            // If not already cached, add this instance to the cache and proceed with construction.
            normalizedPatternCache.set(source, this);
        }

        // Initialize members.
        this.normalized = new Pattern(ast.signature); // NB: recursive.
        this.identifier = ast.identifier;
        this.captureNames = ast.captures.filter(capture => capture !== '?');
        this.comment = source.split('#')[1] || '';
        this.match = makeMatchMethod(source, ast);
    }


    /**
     * The normalized form of this pattern, which recognizes the same set of strings as this instance. Two patterns that
     * recognize the same set of strings are guaranteed to have the same normalized form.
     */
    normalized: Pattern;


    /**
     * A string that is visually similar to the normalized form of this pattern, but is a valid Identifier
     * as per the ECMAScript grammar (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-names-and-keywords).
     * Different normalized forms are guaranteed to have different identifiers.
     */
    identifier: string;


    /**
     * A array of strings whose elements correspond, in order, to the named captures in the pattern. For example, the
     * pattern '{...path}/*.{ext}' has the `captureNames` value ['path', 'ext'].
     */
    captureNames: string[];


    /** The text of the comment portion of the pattern source, or '' if there is no comment. */
    comment: string;


    /**
     * Attempts to recognize the given string by matching it against this pattern. If the match is successful, an object
     * is returned containing the name/value pairs for each named capture that unifies the string with this pattern. If
     * the match fails, the return value is null.
     * @param {string} string - the string to recognize.
     * @returns {Object} null if the string is not recognized by the pattern. Otherwise, a hash of captured name/value
     *          pairs that unify the string with this pattern.
     */
    match: MatchMethod;


    /**
     * Computes the intersection of `this` pattern and the `other` pattern. The intersection recognizes a string if and
     * only if that string is recognized by *both* the input patterns. Because the intersection cannot generally be
     * expressed as a single pattern, the result is given as an array of normalized patterns, as follows:
     * (1) An empty array - this means the input patterns are disjoint, i.e. there are no strings that are recognized by
     *     both input patterns. E.g., foo ∩ bar = []
     * (2) An array with one pattern - this means the intersection can be represented by the single pattern contained in
     *     the array. E.g. a* ∩ *b = [a*b]
     * (3) An array of multiple patterns - the array contains a list of mutually-disjoint patterns, the union of whose
     *     recognized strings are precisely those strings that are recognized by both input patterns.
     *     E.g. test.* ∩ *.js = [test.js, test.*.js]
     * @param {Pattern} other - a pattern instance. May or may not be normalized.
     * @returns {Pattern[]} - an array of normalized patterns representing the intersection of the input patterns.
     */
    intersect(other: Pattern): Pattern[] {
        let patternSources = intersectPatterns(this.normalized.toString(), other.normalized.toString());
        return patternSources.map(src => new Pattern(src));
    }


    /** Returns the source string with which this instance was constructed. */
    toString() { return this.source; }


    /** A singleton pattern that recognises *all* strings. */
    static ANY = new Pattern('…');
}
