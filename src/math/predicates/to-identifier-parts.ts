import Predicate from './predicate';
import toNormalPredicate from './to-normal-predicate';





// TODO: doc... all permitted chars in predicates are *whilelisted* for safety.
//              additionally, they must all have a unique equivalent identifier char.





// TODO: revise old comment below...
// /**
//  * A string that is visually similar to the normalized form of this predicate, but is a valid `IdentifierPart*`
//  * as per the ECMAScript grammar (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-names-and-keywords).
//  * Different normalized forms are guaranteed to have different return values from this function.
//  */
export default function toIdentifierParts(predicate: Predicate): string {
    let p = toNormalPredicate(predicate) as string;
    Object.keys(MAPPINGS).forEach((sym: keyof typeof MAPPINGS) => {
        while (p.indexOf(sym) !== -1) {
            p = p.replace(sym, MAPPINGS[sym]);
        }
    });
    return p;
}





// TODO: doc...
const MAPPINGS = {
    '∅': 'Ø', // U+00D8
    '|': 'ǀ', // U+01C0
    '**': 'ᕯ', // U+156F -- must come before '*'
    '*': 'ӿ', // U+04FF

    ' ': 'ˑ', // U+02D1 (literal space char)
    '/': 'Ⳇ', // U+2CC6
    '-': 'ￚ', // U+FFDA
    '.': 'ˌ', // U+02CC
    ':': 'ː', // U+02D0
    '<': 'ᐸ', // U+1438
    '>': 'ᐳ', // U+1433
    '@': 'ဇ', // U+1007
};





// TODO: move this to to-predicate and use it to ensure no unexpected chars creep into predicates...
// function isWhitelisted(c: string) {
//     if (/^[A-Za-z0-9]$/.test(c)) return true;
//     return Object.keys(MAPPINGS).indexOf(c) !== -1;
// }
