import {PatternAST} from './pattern-parser';





/** Internal function used to generate the Pattern#match method. */
export default function makeMatchMethod(patternSource: string, patternAST: PatternAST): MatchMethod {

    // Gather information about the pattern to be matched. The closures below close over these variables.
    let captureNames = patternAST.captures.filter(capture => capture !== '?');
    let firstCaptureName = captureNames[0];
    let literalChars = patternAST.signature.replace(/[*…]/g, '');
    let literalCharCount = literalChars.length;

    // Construct the match method, using optimizations where possible. Pattern matching may be done frequently, possibly
    // on a critical path. For simpler patterns, we can avoid the overhead of using a RegExp. The switch block below
    // picks out some simpler cases and provides specialized match methods for them. The default case falls back to
    // using a RegExp. Note that all but the default case below could be commented out with no change in runtime
    // behaviour. The additional cases are strictly optimizations.
    let simplifiedPatternSignature = patternSource
        .replace(/{[^.}]+}/g, 'ᕽ')      // replace '{name}' with 'ᕽ'
        .replace(/{\.+[^}]+}/g, '﹍')    // replace '{...name}' with '﹍'
        .replace(/{…[^}]+}/g, '﹍')      // replace '{…name}' with '﹍'
        .replace(/\.\.\./g, '…')          // replace '...' with '…'
        .replace(/[^*…ᕽ﹍]+/g, 'lit')    // replace contiguous sequences of literal characters with 'lit'
        .replace(/ᕽ/g, '{cap}')         // replace named wildcard captures with '{cap}'
        .replace(/﹍/g, '{...cap}');     // replace named globstar captures with '{...cap}'
    switch (simplifiedPatternSignature) {
        case 'lit':
            return s => s === literalChars ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case '*':
            return s => s.indexOf('/') === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case '{cap}':
            return s => s.indexOf('/') === -1 ? {[firstCaptureName]: s} : null;

        case '…':
            return _s => SUCCESSFUL_MATCH_NO_CAPTURES;

        case '{...cap}':
            return s => ({[firstCaptureName]: s});

        case 'lit*':
            return s => {
                if (s.indexOf(literalChars) !== 0) return null;
                return s.indexOf('/', literalCharCount) === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };

        case 'lit{cap}':
            return s => {
                if (s.indexOf(literalChars) !== 0) return null;
                return s.indexOf('/', literalCharCount) === -1 ? {[firstCaptureName]: s.slice(literalCharCount)} : null;
            };

        case 'lit…':
            return s => s.indexOf(literalChars) === 0 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case 'lit{...cap}':
            return s => s.indexOf(literalChars) === 0 ? {[firstCaptureName]: s.slice(literalCharCount)} : null;

        case '*lit':
            return s => {
                let litStart = s.length - literalCharCount;
                if (litStart < 0) return null;
                if (s.indexOf(literalChars, litStart) !== litStart) return null;
                return s.lastIndexOf('/', litStart - 1) === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };

        case '{cap}lit':
            return s => {
                let litStart = s.length - literalCharCount;
                if (litStart < 0) return null;
                if (s.indexOf(literalChars, litStart) !== litStart) return null;
                return s.lastIndexOf('/', litStart - 1) === -1 ? {[firstCaptureName]: s.slice(0, litStart)} : null;
            };

        case '…lit':
            return s => {
                let litStart = s.length - literalCharCount;
                if (litStart < 0) return null;
                return s.indexOf(literalChars, litStart) === litStart ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };

        case '{...cap}lit':
            return s => {
                let litStart = s.length - literalCharCount;
                if (litStart < 0) return null;
                return s.indexOf(literalChars, litStart) === litStart ? {[firstCaptureName]: s.slice(0, litStart)} : null;
            };

        default:
            let regexp = makeRegExpForPattern(patternAST);
            return s => {
                let matches = s.match(regexp);
                if (!matches) return null;
                return captureNames.reduce((hash, name, i) => (hash[name] = matches![i + 1], hash), {} as any);
            };
    }
}





/** Describes the signature of the Pattern#match method. */
export type MatchMethod = (string: string) => {[captureName: string]: string} | null;





/**
 * Constructs a regular expression that matches all strings recognized by the given pattern. Each
 * named globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
 */
function makeRegExpForPattern(patternAST: PatternAST) {
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
