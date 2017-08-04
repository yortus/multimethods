// ----- NB: JS in this file is not transpiled, so use only ES5 syntax + runtime in here -----
{
    // TODO: must keep in sync with `./to-predicate.ts`. Better way? Pass this in via options?
    function isWhitelisted(c) { return ' /-.:<>@'.indexOf(c) !== -1; }
}





Predicate
=   "∅"   !.   { return '∅'; }
/   elems:Element*   !.
    {
        var signature = elems.join('');

        // Return the 'AST'
        return signature;
    }

Element
=   Selector
/   Globstar
/   Wildcard
/   Literal

Selector
=   "|"												{ return '|'; }

Globstar 'globstar'
=   ("**")   !("*" / "{")                           { return '**'; }
/   "{**"   id:IDENTIFIER   "}"   !("*" / "{")      { return '**'; }

Wildcard 'wildcard'
=   "*"   !("*" / "{")                              { return '*'; }
/   "{"   id:IDENTIFIER   "}"   !("*" / "{")        { return '*'; }

Literal 'literal' // NB: Ensure all valid literal chars are whitelisted here. No blacklists!
=   c:[a-zA-Z0-9_]                                  { return c; }
/   c:. &{ return isWhitelisted(c); }               { return c; }

IDENTIFIER
=   [a-z_$]i   [a-z0-9_$]i*                         { return text(); }
