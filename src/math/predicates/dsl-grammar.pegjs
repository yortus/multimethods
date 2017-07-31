{
    // TODO: doc... all permitted chars in predicates are *whilelisted* for safety.
    //              additionally, they must all have a unique equivalent identifier char.

    // Maps from whitelisted literal chars to their identifier equivalents.
    // NB: each identifier char must have a unique mapping from a literal char.
    var literalChars = {
        ' ': 'ˑ', // U+02D1 (literal space char)
        '/': 'Ⳇ', // U+2CC6
        '-': 'ￚ', // U+FFDA
        '.': 'ˌ', // U+02CC
        ':': 'ː', // U+02D0
        '<': 'ᐸ', // U+1438
        '>': 'ᐳ', // U+1433
        '@': 'ဇ', // U+1007

        // NB: *DON'T* add the following chars here... They are reserved for future operators:
        // `| ( )`
    };
}





Predicate
=   elems:Element*   !.
    {
        // NB: This JS isn't transpiled, so only use ES5 in here...
        var captures = elems.map(function (elem) { return elem[2]; }).filter(function (c) { return !!c; });
        return {
            signature: elems.map(function (elem) { return elem[0]; }).join(''),
            identifier: elems.map(function (elem) { return elem[1]; }).join(''),
            captures: captures,
            captureNames: captures.filter(function (c) { return c !== '?'; })
        };
    }

Element
=   Globstar
/   Wildcard
/   Literal

Globstar 'globstar'
=   ("**")   !("*" / "{")                           { return ['**', 'ᕯ', '?']; } // (U+156F)
/   "{**"   id:IDENTIFIER   "}"   !("*" / "{")      { return ['**', 'ᕯ', id]; }

Wildcard 'wildcard'
=   "*"   !("*" / "{")                              { return ['*', 'ӿ', '?']; } // (U+04FF)
/   "{"   id:IDENTIFIER   "}"   !("*" / "{")        { return ['*', 'ӿ', id]; }

Literal 'literal' // NB: Ensure all valid literal chars are whitelisted here. No blacklists!
=   c:[a-zA-Z0-9_]                                  { return [c, c, null]; }
/   c:. &{ return c in literalChars; }              { return [c, literalChars[c], null]; }

IDENTIFIER
=   [a-z_$]i   [a-z0-9_$]i*                         { return text(); }
