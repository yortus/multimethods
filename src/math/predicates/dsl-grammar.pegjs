// ----- NB: JS in this file is not transpiled, so use only ES5 syntax + runtime in here -----
{
    // Whitelisting is super-important here in the parser. Everything after this assumes a valid predicate.
    // TODO: must keep in sync with `./to-predicate.ts` and `./to-identifier-parts.ts`. Better way?
    function isWhitelisted(c) { return /^[a-zA-Z0-9_]$/.test(c) || ' /-.:<>@!'.indexOf(c) !== -1; }
}





Predicate
=   "∅"   !.                                        { return '∅'; }
/   elems:Element*   !.                             { return elems.join(''); }

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

Literal 'literal'
=   c:. &{ return isWhitelisted(c); }               { return c; }

IDENTIFIER
=   [a-z_$]i   [a-z0-9_$]i*                         { return text(); }
