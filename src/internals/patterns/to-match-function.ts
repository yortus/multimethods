import {debug} from '../util';
import {NormalisedPattern} from './normalised-pattern';
import {Pattern} from './pattern';




// TODO: revise comments (merge, remove 'internal', ...)
// /**
//  * Attempts to recognize the given string by matching it against this pattern. If the match is successful,
//  * an object is returned containing the name/value pairs for each named capture that unifies the string with this
//  * pattern. If the match fails, the return value is null.
//  * @param {string} string - the string to recognize.
//  * @returns {Object} null if the string is not recognized by the pattern. Otherwise, a hash of captured name/value
//  *          pairs that unify the string with this pattern.
//  */
/**
 * Internal function used to generate the Pattern#match method. Although RegExps may be used to implement the `match`
 * method for any pattern, we avoid using RegExps for a number of simpler kinds of pattern. This is because
 * pattern matching may be performed frequently, and possibly on critical paths. As such, the use of optimised `match`
 * implementations may result in substantial overall performance improvements in calling code.
 */
export function toMatchFunction(pattern: Pattern): MatchFunction {

    // TODO: temp testing... special case...
    if (pattern === '∅') return () => null;

    // TODO: temp testing... simple case... no alternation in pattern
    if (pattern.indexOf('|') === -1) return toMatchFunctionForOneAlternative(pattern);

    // TODO: temp testing...
    let patterns = NormalisedPattern(pattern).split('|');
    let matchFunctions = patterns.map(toMatchFunctionForOneAlternative);
    return s => {
        for (let match of matchFunctions) {
            let result = match(s);
            if (result !== null) return result;
        }
        return null;
    };
}




// TODO: doc...
function toMatchFunctionForOneAlternative(pattern: Pattern): MatchFunction {

    // TODO: temp testing...
    let normalisedPattern = NormalisedPattern(pattern);

    // Compute useful invariants for the given pattern.
    // These are used as precomputed values in the closures created below.
    const captureNames = getCaptureNames(pattern).filter(name => name !== '?');
    const firstCaptureName = captureNames[0];
    const literalChars = normalisedPattern.replace(/[*]/g, '');
    const literalCharCount = literalChars.length;

    // Characterise the given pattern using a simplified 'signature'.
    // E.g., '/foo/*.js' becomes 'lit*lit', and '/a{b}/{**rest}' becomes 'lit{*}lit{**}'
    let simplifiedPatternSignature = pattern
        .replace(/{[^*}]+}/g, '{*}')        // replace '{name}' with '{*}'
        .replace(/{\*\*[^}]+}/g, '{**}')    // replace '{**name}' with '{**}'
        .replace(/[^*{}]+/g, 'lit');        // replace contiguous sequences of literal characters with 'lit'

    // The switch block below picks out some simpler cases and provides specialized `match` methods for them.
    // The default case falls back to using a RegExp. Note that all but the default case below could be
    // commented out with no change in runtime behaviour. The additional cases are strictly for optimisation.
    switch (simplifiedPatternSignature) {
        case 'lit':
            return s => s === literalChars ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case '*':
            return s => containsSlash(s) ? null : SUCCESSFUL_MATCH_NO_CAPTURES;

        case '{*}':
            return s => containsSlash(s) ? null : {[firstCaptureName]: s};

        case '**':
            return _ => SUCCESSFUL_MATCH_NO_CAPTURES;

        case '{**}':
            return s => ({[firstCaptureName]: s});

        case 'lit*':
            return s => {
                if (!startsWith(s, literalChars)) return null;
                return containsSlash(s, literalCharCount) ? null : SUCCESSFUL_MATCH_NO_CAPTURES;
            };

        case 'lit{*}':
            return s => {
                if (!startsWith(s, literalChars)) return null;
                return containsSlash(s, literalCharCount) ? null : {[firstCaptureName]: s.slice(literalCharCount)};
            };

        case 'lit**':
            return s => startsWith(s, literalChars) ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case 'lit{**}':
            return s => startsWith(s, literalChars) ? {[firstCaptureName]: s.slice(literalCharCount)} : null;

        case '*lit':
            return s => {
                let litStart = s.length - literalCharCount;
                if (!endsWith(s, literalChars)) return null;
                return containsSlash(s, 0, litStart) ? null : SUCCESSFUL_MATCH_NO_CAPTURES;
            };

        case '{*}lit':
            return s => {
                let litStart = s.length - literalCharCount;
                if (!endsWith(s, literalChars)) return null;
                return containsSlash(s, 0, litStart) ? null : {[firstCaptureName]: s.slice(0, litStart)};
            };

        case '**lit':
            return s => endsWith(s, literalChars) ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case '{**}lit':
            return s => endsWith(s, literalChars) ? {[firstCaptureName]: s.slice(0, -literalCharCount)} : null;

        case 'lit*lit':
            let captureStart = normalisedPattern.indexOf('*');
            let startLit = normalisedPattern.slice(0, captureStart);
            let endLit = normalisedPattern.slice(captureStart + 1);
            return s => surroundedWith(s, startLit, endLit) ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        // TODO: consider implementing the following cases for a *marginal* performance boost
        //       (but there are diminishing returns over default RegExp soln as pattern complexity increases).
        case 'lit{cap}lit':
        case 'lit**lit':
        case 'lit{**}lit':

        default:
            debug(
                `${debug.DEOPT} Cannot optimise match function for pattern '%s' (%s)`,
                pattern,
                simplifiedPatternSignature
            );
            let regexp = makeRegExpForPattern(pattern);
            return s => {
                let matches = s.match(regexp);
                if (!matches) return null;
                return captureNames.reduce((hash, name, i) => (hash[name] = matches![i + 1], hash), {} as any);
            };
    }
}




/** The signature of the Pattern#match method. */
export type MatchFunction = (_: string) => {[captureName: string]: string} | null;




/**
 * Constructs a regular expression that matches all strings recognized by the given pattern.
 * Each named globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
 */
function makeRegExpForPattern(pattern: Pattern) {
    let signature = NormalisedPattern(pattern);
    let captureNames = getCaptureNames(pattern);
    let captureIndex = 0;
    let re = signature.replace(/\*\*/g, 'ᕯ').split('').map(c => {
        if (c === '*') {
            let isAnonymous = captureNames[captureIndex++] === '?';
            return isAnonymous ? '[^\\/]*' : '([^\\/]*)';
        }
        if (c === 'ᕯ') {
            let isAnonymous = captureNames[captureIndex++] === '?';
            return isAnonymous ? '[\\s\\S]*' : '([\\s\\S]*)';
        }
        if (' /._-'.indexOf(c) !== -1) { // NB: these ones must be escaped in the regex.
            return `\\${c}`;
        }
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}




/**
 * Returns an array of strings whose elements correspond, in order, to the captures in the pattern. Each element
 * holds the name of its corresponding capture, or '?' if the corresponding capture is anonymous (i.e. '*' or '**').
 * For example, for the pattern '{**path}/*.{ext}', the return value would be['path', '?', 'ext'].
 */
function getCaptureNames(pattern: Pattern): string[] {
    let p = pattern as string;
    p = p.replace(/\{\*\*/g, '{');
    p = p.replace(/\*\*/g, '{}');
    p = p.replace(/\*/g, '{}');

    let result = [] as string[];
    p = p.replace(/\{([^}]*)\}/g, (_, name) => (result.push(name || '?'), '')); // TODO: '?' --> undefined
    return result;
}




// A singleton match result that may be returned in all cases of a successful match with no named
// captures. This reduces the number of cases where calls to match() functions create new heap objects.
const SUCCESSFUL_MATCH_NO_CAPTURES = Object.freeze({}) as {[captureName: string]: string};




// Some string utility functions used within `match` implementations. V8 profiling has shown that calling
// these is faster than using equivalent calls to the native string#indexOf (at least on the V8 engine).
// Having these here also means we don't depend on anything beyond ES5 for string manipulation.
function containsSlash(s: string, from = 0, to = s.length) {
    for (let i = from; i < to; ++i) {
        if (s[i] === '/') return true;
    }
    return false;
}
function startsWith(s: string, searchString: string) {
    let len = searchString.length;
    if (len > s.length) return false;
    for (let i = 0; i < len; ++i) {
        if (s[i] !== searchString[i]) return false;
    }
    return true;
}
function endsWith(s: string, searchstring: string) {
    let len1 = s.length;
    let len2 = searchstring.length;
    if (len2 > len1) return false;
    for (let i = len1 - len2, j = 0; i < len1; ++i, ++j) {
        if (s[i] !== searchstring[j]) return false;
    }
    return true;
}
function surroundedWith(s: string, startString: string, endString: string) {
    let len1 = startString.length;
    let len2 = endString.length;
    for (let i = 0, j = 0; j < len1; ++i, ++j) {
        if (s[i] !== startString[j]) return false;
    }
    for (let i = s.length - len2, j = 0; j < len2; ++i, ++j) {
        if (s[i] !== endString[j]) return false;
    }
    return true;
}
