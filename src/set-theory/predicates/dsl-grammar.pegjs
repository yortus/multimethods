




Predicate
=   elems:Element*   !.
    {
        let signature = elems.map(elem => elem[0]).join('');
        let identifier = elems.map(elem => elem[1]).join('');
        let captures = elems.map(elem => elem[2]).filter(elem => !!elem);
        return { signature, identifier, captures };
    }

Element
=   Globstar
/   Wildcard
/   Literal

Globstar 'globstar'
=   ("..." / "…")   !("*" / "..." / "…" / "{")                          { return ['…', '﹍', '?']; } // (U+FE4D)
/   ("{..." / "{…")   id:IDENTIFIER   "}"   !("*" / "..." / "…" / "{")  { return ['…', '﹍', id]; }

Wildcard 'wildcard'
=   "*"   !("*" / "..." / "…" / "{")                                    { return ['*', 'ᕽ', '?']; } // (U+157D)
/   "{"   id:IDENTIFIER   "}"   !("*" / "..." / "…" / "{")              { return ['*', 'ᕽ', id]; }

Literal 'literal'
=   c:[a-zA-Z0-9_]                                                      { return [c, c, null]; }
/   c:" "                                                               { return [c, 'ㆍ', null]; }  // (U+318D)
/   c:"/"                                                               { return [c, 'Ⳇ', null]; }  // (U+FF89)
/   c:"-"                                                               { return [c, 'ￚ', null]; }  // (U+FFDA)
/   c:"."                                                               { return [c, 'ˌ', null]; }  // (U+02CC)

IDENTIFIER
=   [a-z_$]i   [a-z0-9_$]i*                                             { return text(); }
