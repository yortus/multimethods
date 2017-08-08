import * as fatalError from '../../util/fatal-error';
import ALL from './all';
import NONE from './none';
import NormalPredicate from './normal-predicate';





// TODO: this is handling both NormalPredicate and SimplePredicate - phase out SimplePredicate support...
// TODO: schedule clear cache on next tick
//       - do it on every call
//       - in a cross-platform way
//       - never queue up more that one scheduled callback





// TODO: doc... does *not* work with alternation in either `sub` or `sup`. Use intersect() for that.
export default function isSubsetOf(sub: NormalPredicate, sup: NormalPredicate) {

    // Shortcut a few simple cases.
    if (sub === sup) return true;
    if (sub === NONE || sup === ALL) return true;
    if (sub === ALL || sup === NONE) return false;

    // TODO: can't do these... need full intersection, but intersection deps on this, so would be circular ref...
    if (sub.indexOf('|') !== -1 || sup.indexOf('|') !== -1) {
        return fatalError.PREDICATE_SYNTAX(`isSubsetOf: unsupported alternation operator '|' in predicate.`);
    }

    // Obtain a regex that tests for subsets of the given `sup`, and memoise it.
    let regex = REGEX_CACHE.get(sup);
    if (!regex) {
        regex = makeSubsetRecogniser(sup);
        REGEX_CACHE.set(sup, regex);
    }

    // Determine if `sub` is a subset using the regex.
    return regex.test(sub);
}





/*
 * Returns a regex that matches all normalised predicates that are proper or improper
 * subsets of the specified normalised predicate, and rejects everything else.
 */
function makeSubsetRecogniser(predicate: NormalPredicate) {
    let regexSource = '';
    for (let i = 0; i < predicate.length; ++i) {
        let c = predicate.charAt(i);
        if (c === '*' && i + 1 < predicate.length && predicate.charAt(i + 1) === '*') {
            c = '**';
            ++i;
        }

        let fragment = c;
        if (c === '*') {
            fragment = '((?!\\*\\*)[^\\/ᕯ])*';
        }
        else if (c === '**' || c === 'ᕯ') {
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
}





// TODO: doc...
const REGEX_CACHE = new Map<NormalPredicate, RegExp>();
