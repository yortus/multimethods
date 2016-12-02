// TODO: review all comments in this file for accurate terminology
import {PredicatePatternAST} from './predicate-pattern-parser';





/** Internal function used to generate the Predicate#match method. */
export default function makeMatchMethod(predicatePattern: string, predicatePatternAST: PredicatePatternAST): MatchMethod {

    // Gather information about the pattern to be matched. The closures below close over these variables.
    let captureNames = predicatePatternAST.captures.filter(capture => capture !== '?');
    let firstCaptureName = captureNames[0];
    let literalChars = predicatePatternAST.signature.replace(/[*…]/g, '');
    let literalCharCount = literalChars.length;

    // Construct the match method, using optimizations where possible. Pattern matching may be done frequently, possibly
    // on a critical path. For simpler patterns, we can avoid the overhead of using a RegExp. The switch block below
    // picks out some simpler cases and provides specialized match methods for them. The default case falls back to
    // using a RegExp. Note that all but the default case below could be commented out with no change in runtime
    // behaviour. The additional cases are strictly optimizations.
    let simplifiedPatternSignature = predicatePattern
        .replace(/[ ]*\#.*$/g, '')      // strip trailing whitespace
        .replace(/{[^.}]+}/g, 'ᕽ')      // replace '{name}' with 'ᕽ'
        .replace(/{\.+[^}]+}/g, '﹍')    // replace '{...name}' with '﹍'
        .replace(/{…[^}]+}/g, '﹍')      // replace '{…name}' with '﹍'
        .replace(/\.\.\./g, '…')          // replace '...' with '…'
        .replace(/[^*…ᕽ﹍]+/g, 'lit')    // replace contiguous sequences of literal characters with 'lit'
        .replace(/ᕽ/g, '{cap}')         // replace named wildcard captures with '{cap}'
        .replace(/﹍/g, '{…cap}');     // replace named globstar captures with '{...cap}'
    switch (simplifiedPatternSignature) {
        case 'lit':
            return s => s === literalChars ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case '*':
            return s => containsSlash(s) ? null : SUCCESSFUL_MATCH_NO_CAPTURES;

        case '{cap}':
            return s => containsSlash(s) ? null : {[firstCaptureName]: s};

        case '…':
            return _s => SUCCESSFUL_MATCH_NO_CAPTURES;

        case '{…cap}':
            return s => ({[firstCaptureName]: s});

        case 'lit*':
            return s => {
                if (!startsWith(s, literalChars)) return null;
                return containsSlash(s, literalCharCount) ? null : SUCCESSFUL_MATCH_NO_CAPTURES;
            };

        case 'lit{cap}':
            return s => {
                if (!startsWith(s, literalChars)) return null;
                return containsSlash(s, literalCharCount) ? null : {[firstCaptureName]: s.slice(literalCharCount)};
            };

        case 'lit…':
            return s => startsWith(s, literalChars) ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case 'lit{…cap}':
            return s => startsWith(s, literalChars) ? {[firstCaptureName]: s.slice(literalCharCount)} : null;

        case '*lit':
            return s => {
                let litStart = s.length - literalCharCount;
                if (!endsWith(s, literalChars)) return null;
                return containsSlash(s, 0, litStart) ? null : SUCCESSFUL_MATCH_NO_CAPTURES;
            };

        case '{cap}lit':
            return s => {
                let litStart = s.length - literalCharCount;
                if (!endsWith(s, literalChars)) return null;
                return containsSlash(s, 0, litStart) ? null : {[firstCaptureName]: s.slice(0, litStart)};
            };

        case '…lit':
            return s => endsWith(s, literalChars) ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case '{…cap}lit':
            return s => endsWith(s, literalChars) ? {[firstCaptureName]: s.slice(0, -literalCharCount)} : null;

        case 'lit*lit':
            let captureStart = predicatePatternAST.signature.indexOf('*');
            let startLit = predicatePatternAST.signature.slice(0, captureStart);
            let endLit = predicatePatternAST.signature.slice(captureStart + 1);
            return s => surroundedWith(s, startLit, endLit) ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        // TODO: consider implementing the following cases for a *marginal* performance boost
        //       (but there are diminishing returns over default RegExp soln as pattern complexity increases).
        case 'lit{cap}lit':
        case 'lit…lit':
        case 'lit{…cap}lit':

        default:
            // TODO: alert on match functions that don't get optimised... either remove this or formalise it as a warning...
            //       - probably remove, since 'optimisations' are fardly possible beyond the simpler cases already handled above (i.e. there are diminishing returns)
            console.log(`=====>   NOT OPTIMISED   ${simplifiedPatternSignature}   ('${predicatePattern}')`);

            let regexp = makeRegExpForPattern(predicatePatternAST);
            return s => {
                let matches = s.match(regexp);
                if (!matches) return null;
                return captureNames.reduce((hash, name, i) => (hash[name] = matches![i + 1], hash), {} as any);
            };
    }
}





/** Describes the signature of the Predicate#match method. */
export type MatchMethod = (string: string) => {[captureName: string]: string} | null;





/**
 * Constructs a regular expression that matches all strings recognized by the given pattern. Each
 * named globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
 */
function makeRegExpForPattern(patternAST: PredicatePatternAST) {
    let captureIndex = 0;
    let re = patternAST.signature.split('').map(c => {
        if (c === '*') {
            let isAnonymous = patternAST.captures[captureIndex++] === '?';
            return isAnonymous ? '[^\\/]*' : '([^\\/]*)';
        }
        if (c === '…') {
            let isAnonymous = patternAST.captures[captureIndex++] === '?';
            return isAnonymous ? '.*' : '(.*)';
        }
        if (' /._-'.indexOf(c) !== -1) {
            return `\\${c}`;
        }
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}





// A singleton match result that may be returned in all cases of a successful match with no named
// captures. This reduces the number of cases where calls to match() functions create new heap objects.
const SUCCESSFUL_MATCH_NO_CAPTURES = <{[captureName: string]: string}> {};
Object.freeze(SUCCESSFUL_MATCH_NO_CAPTURES);





// TODO: V8 profiling proves calling these is faster than equivalent calls to the native string#indexOf in V8!!!
// TODO: leave this here? If so, try further opts, write it up properly
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
