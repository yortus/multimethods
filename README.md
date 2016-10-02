# Multimethods

## Multimethods
- immutable
- no this?
- comprise a list of 'methods', each method is a {predicate: consequent} pair
- In a method, the predicate is a pattern, and the consequent is a function
- predicate/pattern extensions: binary tree format... TODO WIP
- predicates form a taxonomy according to their specificity (the subset of discriminants they 'contain')
- a method can be an 'ordinary' method, or a decorator (a method with special semantics to call/control 'downstream' methods)
- a multimethod may be variadic or fixed arity (for optimisation only)
- a multimethod may be closed or open (can add methods after construction or not) (also for optimisation only?)

- each MM call generates a discriminant, according to the 'toDiscriminant()' function supplied to the ctor (default to toString()?)
- discriminant is matched against all method predicates


## Multimethod Options (chainable)
- checked or strict: no conflicts, capture matching (when to check?)
- open (default): new methods may be added at any time
- closed: only a single set of methods is accepted
- sealed or frozen or final: instead of closed?
- sync: all methods are assumed to return their result
- async: all methods are assumed to return a promise of their result
- mixed sync/async (default): each method may return either its result or a promise of its result
- unary: all methods are assumed to be unary. Affects method signature. Mainly for ptimisation.
- binary: all methods are assumed to be binary. Affects method signature. Mainly for optimisation.
- variadic (default): each method may take any number of parameters. Affects method signature.
- discriminate: function
- methods: dictionary of predicate/consequent pairs
- eager or lazy?


## pros/cons for custom UNHANDLED value
- CON: builtin handlers don't know which UNHANDLED to use - can't assume the default one will work
- CON: if the default HANDLER always works in addition to a user-defd one, then checking for UNHANDLED value becomes more complicated
- PRO: why? use case? Can decide that undefined means UNHANLDED, or null, or false or falsy.


## The Pattern DSL

A valid pattern string conforms to the following rules:
- Patterns are case-sensitive.
- A pattern consists of an alternating sequence of captures and literals.
- A literal consists of one or more adjacent characters from the set `[A-Za-z0-9 /._-]`.
- Literals must exactly match a corresponding portion of an address.
- A capture represents an operator that matches zero or more characters of an address.
- There are two types of captures: globstars and wildcards.
- A globstar greedily matches zero or more adjacent characters in an address.
- A wildcard greedily matches zero or more adjacent characters in an address, but cannot match `/`.
- Captures may be named or anonymous. Named captures return their correspoding capture values in the result of a call to `Pattern#match`.
- An anonymous globstar is designated with `...` or `…`.
- A named globstar is designated with `{...id}` where id is a valid JS identifier.
- An anonymous wildcard is designated with `*`.
- A named wildcard is designated with `{id}` where id is a valid JS identifier.
- Two captures may not occupy adjacent positions in a pattern.
- Patterns may have trailing whitespace, which is removed.
- Whitespace consists of spaces and/or comments.
- A comment begins with `#` and continues to the end of the string.
- The special pattern `∅` is permitted. It represents a pattern that matches no addresses.


## Pattern DSL Examples

- `'/foo'` matches only the literal address `'/foo'` and nothing else
- `'/foo/*'` matches `'/foo/bar'` and `'/foo/'` but not `'/foo'` or `'/foo/bar/baz'`
- `'/foo...'` (or `'/foo…'`) matches `'/foo'`, `'/foo/bar'` and `'/foo/bar/baz'`
- `'{...path}/{name}.{ext}` matches `'/api/foo/bar.html'` with `{path: '/api/foo', name: 'bar', ext: 'baz' }`
- `'*{...path}'` is invalid (two adjacent captures)
- `'...'` (or `'…'`) matches all addresses
- `'*'` matches all addresses that do not contain `'/'`
- `'∅'` matches no addresses


## Glossary

**Address:** A string designating the specific resource being requested. Part of a Request.

**Rule:** A condition and action in the form of a Pattern/Handler pair.

**Rule Set:** TODO...

**Pattern:** A concise regex-like representation that matches a particular set of Addresses.

**[Pattern] Signature:** TODO...

**Handler:** TODO... A procedure for generating the Response for a particular Request.... capture names as params... $req, $next...

**Decorator:** A special Rule... TODO

**Priority:** TODO...

**Route:** TODO: ??? An ordered list of Rules that all match an Address.

**Request:** A logical representation... TODO

**Response:** A logical representation... TODO

**Transport:** TODO... listens; maps btw physical<-->logical rq/rs representations

**Router:** TODO... Disptcher. Computes the Route(s?) to a given Address. Needs a set of Rules.
