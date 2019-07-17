
<!-- <img width="64px" height="64px" src="./extras/multimethods-logo.png" alt="Logo" /> -->
![Multimethods](./extras/multimethods-title.png)


## Design Goals
- fast dispatch with minimal runtime overhead
- strong typing
- support MMs of any arity, including variadic
- support sync and async use cases
- Mathematically sound dispatch semantics
- Straight-forward 'obvious' usage and API
- Configurability plus sensible defaults
- Good diagnostics
- Highly interoperable with other libs and code


## Future Work
- the `strictChecks` option may be changed to `true | false | { <specific checks...> }`
- diagnostics: early detection of potential runtime error on NEXT when multiple possible fallbacks exist
- generator MMs - iterable functions ala ES6 generators, but with MM dispatch
- 'adding' two multimethods to get a new multimethod


## Multimethods
- immutable
- no this?
- comprise a list of 'rules', each rule is a {predicate: method} pair
- rules are either normal rules or meta-rules
- In a rule, the predicate is a pattern, and the method is a function
- predicate/pattern extensions: binary tree format... TODO WIP
- predicates form a taxonomy according to their specificity (the subset of discriminants they 'contain')
- a rule can be an 'ordinary' rule, or a metarule (whose method has special semantics to call/control 'downstream' methods)
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


## The NEXT sentinel
- When a handler returns `NEXT` (or a `Promise` thereof), it instructs the library to call the next-best matching handler for the same inputs. And so on until either a handler returns a non-`NEXT` value (which becomes the return value of the MM call), or the last matching handler returns `NEXT`, which causes an 'unhandled' error to be thrown.
- lib provides a default for this, which is exported as `NEXT`
- clients can provide their own `NEXT` value via MM options


## Strict mode (`options.strict`)
### `strict: false` behaviour (default)
- method results are not checked:
  - for `async: false`, undefined behaviour if any method returns a promise
  - for `async: true`, undefined behaviour if any method returns a non-promise or throws
### `strict: true` behaviour
- method results are checked:
  - for `async: false`, if result is a promise, throws an error
  - for `async: true`, if result is a non-promise (including if it throws), multimethod returns a rejected promise
    - NB: this relies on runtime support for `Promise.resolve()`, where `Promise` is globally defined


## Handlers
- regular handlers (functions)
- metahandlers (specially marked functions)
- chains of handlers (arrays)
  - may be all regular, all meta, or a mix
  - if mixed, all metahandlers must be contiguous and leftmost in the chain array. This restriction is to simplify understanding dispatch of chains. It means that the handlers will execute in left-to-right order across the chain array. I.e. in a chain:
    - (a) the metahandlers are all less specific than the regular handlers (so leftmost executes first)
    - (b) the metahandlers are increasing order of specificity from left-to-right (so leftmost executes first)
    - (c) the regular handlers are decreasing order of specificity from left-to-right (so leftmost executes first)


## Compatibility
- TL;DR: Node.js 6+, recent browsers, IE11
- Assumes environment supports ES5
- some ES6 runtime things are used, but only if supported by IE11 (Map, Set, WeakMap)
- One thing won't work in IE11: Multimethod instanceof Function 



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
- An anonymous globstar is designated with `**`.
- A named globstar is designated with `{**id}` where id is a valid JS identifier.
- An anonymous wildcard is designated with `*`.
- A named wildcard is designated with `{id}` where id is a valid JS identifier.
- Two captures may not occupy adjacent positions in a pattern.
- Patterns may have trailing whitespace, which is removed. (TODO: not any more? check tests)
- Whitespace consists of spaces and/or comments. (TODO: not any more? check tests)
- TODO: a|b alternatives syntax
#### Deprecated/removed:
- A comment begins with `#` and continues to the end of the string.
- The special pattern `∅` is permitted. It represents a pattern that matches no addresses. (TODO: re-instated? check tests)


## Pattern DSL Examples

- `/foo` matches only the literal address `/foo` and nothing else
- `/foo/*` matches `/foo/bar` and `/foo/` but not `/foo` or `/foo/bar/baz`
- `/foo**` matches `/foo`, `/foo/bar` and `/foo/bar/baz`
- `{**path}/{name}.{ext}` matches `/api/foo/bar.html` with `{path: '/api/foo', name: 'bar', ext: 'baz' }`
- `*{**path}` is invalid (two adjacent captures)
- `**` matches all addresses
- `*` matches all addresses that do not contain `/`
- `` matches only the empty string


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
