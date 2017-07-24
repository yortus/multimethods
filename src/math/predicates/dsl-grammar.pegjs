




Predicate
=   elems:Element*   !.
    {
        // NB: This isn't downleveled, so only use ES5 in here...
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

Literal 'literal'
=   c:[a-zA-Z0-9_]                                  { return [c, c, null]; }
/   c:" "                                           { return [c, 'ˑ', null]; }  // (U+02D1)
/   c:"/"                                           { return [c, 'Ⳇ', null]; }  // (U+2CC6)
/   c:"-"                                           { return [c, 'ￚ', null]; }  // (U+FFDA)
/   c:"."                                           { return [c, 'ˌ', null]; }  // (U+02CC)

IDENTIFIER
=   [a-z_$]i   [a-z0-9_$]i*                         { return text(); }
