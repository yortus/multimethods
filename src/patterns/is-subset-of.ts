import {memoise} from '../util';
import {ALL} from './all';
import {NONE} from './none';
import {NormalisedPattern} from './normalised-pattern';




// TODO: schedule clear cache on next tick
//       - do it on every call
//       - in a cross-platform way
//       - never queue up more that one scheduled callback




// TODO: doc... does *not* work with alternation in either `sub` or `sup`. Use intersect() for that.
export function isSubsetOf(sub: NormalisedPattern, sup: NormalisedPattern): boolean {

    // Shortcuts for a few identity cases.
    if (sub === sup) return true;
    if (sub === NONE || sup === ALL) return true;
    if (sub === ALL || sup === NONE) return false;

    // Solutions for cases involving alternation, based on these invariants that arise from normalised pattern syntax:
    // - if `sub` is an alternation, then `sub` ⊂ `sup` iff for every alternative `x` of `sub`, `x` ⊂ `sup`.
    // - if `sup` is an alternation, then `sub` ⊂ `sup` iff there is an alternative `y` of `sup` such that `sub` ⊂ `y`.
    if (sub.indexOf('|') !== -1) {
        let alts = sub.split('|') as NormalisedPattern[];
        return alts.every(alt => isSubsetOf(alt, sup));
    }
    if (sup.indexOf('|') !== -1) {
        let alts = sup.split('|') as NormalisedPattern[];
        return alts.some(alt => isSubsetOf(sub, alt));
    }

    // Obtain a regex that tests for subsets of the given `sup`.
    let regex = makeSubsetRecogniser(sup);

    // Determine if `sub` is a subset using the regex.
    return regex.test(sub);
}




/*
 * Returns a regex that matches all normalised patterns that are proper or improper subsets of the specified
 * normalised pattern, and rejects everything else. Assumes `pattern` contains no alternations.
 */
let makeSubsetRecogniser: (pattern: NormalisedPattern) => RegExp;
makeSubsetRecogniser = memoise((pattern: NormalisedPattern) => {
    let regexSource = '';
    for (let i = 0; i < pattern.length; ++i) {
        let c = pattern.charAt(i);
        if (c === '*' && i + 1 < pattern.length && pattern.charAt(i + 1) === '*') {
            c = '**';
            ++i;
        }

        let fragment = c;
        if (c === '*') {
            fragment = '((?!\\*\\*)[^\\/])*';
        }
        else if (c === '**') {
            fragment = '.*';
        }
        else if (' /._-'.indexOf(c) !== -1) {
            // These chars need escaping in a regex
            // TODO: make this list exhaustive, or escape everything...
            fragment = `\\${c}`;
        }

        regexSource += fragment;
    }
    return new RegExp(`^${regexSource}$`);
});
