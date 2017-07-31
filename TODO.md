## Todo - High Priority
- [ ] export a `Multimethod` type (or family thereof)
  - [ ] or not, it's just a straightforward function signature, nothing special added
- [ ] validation: can a method chain be empty? i.e., a predicate associated with 0 methods?
  - [ ] it might be useful if it effectively works like a no-op.
    - [ ] check if it indeed does work like this at present, or otherwise how it can be made to do so
    - [ ] example: routist @allow on a pattern (predicate) that exists only for permissions (ir has no handler)


## Todo - Medium Priority
- [ ] export an `extend` function that takes a MM and a method table and returns a new multimethod
  - [ ] use `super` in chains to control overriding behaviour w.r.t. original MM
  - [ ] makes a new method table from the two given ones and returns a new multimethod with the extended method table
  - [ ] original multimethod is unchanged
  - [ ] new multimethod gets same options as given one
  - [ ] method chains support explicit relative specificity with `'super'`
  - [ ] explicit method specificity is *required*, otherwise throws an 'ambiguous' error
  - [ ] add tests for all of above
- [ ] support even more special characters in predicates
- [ ] Address code quality in /src
  - [x] Rationalise file structure under /src
  - [x] Reasonable breakdown of functions
  - [ ] JSDoc comments for all exports
  - [ ] Descriptive inline comments so someone can understand the inner workings
- [ ] Write better README
  - [ ] TOC
  - [ ] Rationale / motivating example - problem, solution
  - [ ] Installing
  - [ ] Usage example
  - [ ] Further Details
    - [ ] predicates
    - [ ] options
    - [ ] method table: specificity, chains, CONTINUE, meta-methods, etc
- [ ] Improve unit test coverage
  - [ ] add basic tests for correct arg passing for variadic, nullary, unary, binary and ternary MMs
  - [ ] Early MM validation errors:
    - [ ] illegal chain (regular handlers before meta handlers)
    - [ ] ambiguous rules
    - [ ] arity mismatch
    - [ ] TODO: more checks...
  - [ ] MM dispatch results:
    - [ ] regular rules only
    - [ ] overlapping rules
    - [ ] catch-all meta rule
    - [ ] chain of regular rules
    - [ ] catch-all metarule chain
    - [ ] mixed chain
    - [ ] limited metarule
    - [ ] misc rules
    - [ ] TODO: more cases...
- [ ] investigate and fix UMD errors when compression is enabled in uglifyjs.
- [ ] support numeric discriminant matching for very fast dispatch scenarios (like my C++/C# MMs did)


## Todo - Unassigned Priority
- [ ] new option `toType: Function` - if provided and no `toDiscriminant` given, the default `toDiscriminant` uses it
- [ ] new option `allowNulls` - mms should reject `null` args unless this is explicitly set to `true`
- [ ] support simplified MM creation: accept method table directly instead of inside `methods` prop.
- [ ] validation: check for unrecognised options
- [ ] strict mode: if fixed arity, check number of arguments passed to discriminant is correct
- [ ] review fatalError module again: 1. don't use ALL_CAPS, how best to export? c.f. TypeScript internals...
- [ ] add sticky copyright comment at top of multimethods.min.js
- [ ] test in real IE11 browser
- [ ] get rid of nasty TypeScript '!' non-null assertions in code
- [ ] Use consistent British English spelling (-ise vs -ize)
- [ ] docs/comments/tests: get rid of refs to address, request, response (now discriminant, parameters/arguments, return value/result)
- [ ] Multimethod - fix up all terminology
  - [ ] src code props, vars, fns, exports, filenames, etc
  - [ ] src code comments
  - [ ] README - glossary, descriptions, etc
- [ ] revise/revamp method function validation
  - [ ] MAIN AIM: to ensure predicate captures stay synced with their methods, and error early if not, with opt-outs
  - [ ] validate method function.length.
  - [ ] the `captures` param:
    - [ ] if object destructuring is used, require 1:1 correspondence to captured names
    - [ ] if object destructuring is used, either account for or don't support prop renaming (which??? depends how easy/hard)
    - [ ] if object destructuring is NOT used:
      - [ ] disallow under some 'strict checking' option?
      - [ ] if the pattern has named captures, then method length must include the `captures` param
      - [ ] if the pattern has NO named captures, then method length must exclude the `captures` param
- [ ] move TODO list(s) to separate github issues
- [ ] Multimethods are immutable.
  - [ ] document that multimethods are immutable and why. e.g. can emit fast code for them.
  - [ ] check code - ensure no mutating operations on multimethods
- [ ] doc/explain CONTINUE - this is an imperative return value of what MM should do next, not a declaration of what just happened in current handler.
- [ ] Fix terminology in code and comments
  - [ ] executor --> implementation, behaviour, case, effective handler, override, overload, subfunction, method, form, shape, mode
  - [ ] no such thing as a metarule, only a meta-handler
  - [x] UNHANDLED --> CONTINUE
  - [ ] dispatch
  - [ ] selector
  - [ ] executor
  - [ ] next --> forward/fwd
  - [ ] rule
  - [ ] predicate (rename from `pattern` in code/codegen/comments)
  - [ ] regular handler (rename from `method` in code/codegen/comments)
  - [ ] meta handler (rename from `method` in code/codegen/comments)
  - [ ] ruleset
- [ ] TODO: fix meta() function
  - [ ] should detect whether used as a wrapper function around a handler, or as a property decorator
- [ ] remove dep on `util.format` in `fatal-error.ts`


# Audits to do:
- [ ] consistent British English spelling
- [ ] consistent code style & quality
- [ ] functionality & test converage
- [ ] perforance & benchmarks
- [ ] all errors and warnings (eg validation, codegen, etc)


## Notes on future support for predicate symbols/operators/literals
- [ ] use URI ref: https://tools.ietf.org/html/rfc3986
- [ ] TODO: char pool yet to classify:

  - [ ] unallocated: `% ^ < > | ! $ ' " ( ) + , ;`
                        was:
                        - [ ] URI reserved chars: `: ? # [ ] @ ! $ & ' ( ) + , ; =`
                        - [ ] Others: `% ^ ~ < > " |`

- [ ] support predicate 'type' indicators - eg binary predicates like `*100*10`, and maybe more future ones
- [ ] treat the following as literal match characters:
  - [ ] `a-z A-Z 0-9 _ . - /`  (already supported)
  - [ ] `~` (unreserved in URIs - so may commonly appear in URLs)
  - [ ] `: ? = & #` (commonly appear in URIs as delimiters)
  - [ ] `[ ] @` (also used in some URI schemes according to RFC3986#1.1.2)
  - [ ] `+` is this always unescaped to space? The RFC lists it as a reserved demiliter
- [ ] TODO: revise whether to treat the following as literal match characters. List pros/cons
  - [ ] <space> (already supported)
- [ ] TODO: Implement the following operators:
  - [ ] `*` wildcard
  - [ ] `...` globstar
    - [x] TODO: change back to `**`? Pros: One less special char. Cons: Ambiguous?
    - [x] Use single unicode 'letter' char for `**` : U+156F `ᕯ`
  - [ ] `{...}` wildcard/globstar named capture
- [x] TODO: Reserve the following characters for future use:
  - [x] `( ) |`
  - [ ] TODO: union/or: `|`?
  - [ ] TODO: alternatives `(abc|def|123)`
  - [ ] TODO: zero or one `(abc?)`
  - [ ] TODO: escape sequence `('$30?!')` or `("it's")` or `(u0213)` or `my( )site` (literal space)

  - [ ] general reserve: ``    
  
- [ ] TODO: Reserve the following characters to be always illegal in predicates (unless escaped):
  - [ ] doc why to have this:
    - [ ] so client have a few special characters for augmenting predicates for their own use. They can safely manipulate/strip out these chars knowing they cannot possibly be part of the predicate
    - [ ] for safely putting other props in same hash as rules, eg `$toDiscriminant` or similar
  - [ ] TODO: `$ ; < >`

- [ ] TODO: Support escape sequences for any character as follows:
  - [ ] TODO: ...

- [ ] TODO: special rules for spaces?

- [ ] TODO: check out unicode 'VAI' for many interesting symbol-like characters eg: `ꗬ ꗈ ꕹ ꕤ ꕢ ꖜ ꗷ ꗤ`

- [ ] TODO: doc use of special chars in emitted MM code
  - [ ] `ᐟ` (U+141F) to differentiate otherwise-equivalent identifiers
  - [ ] `ː` (U+02D0) to visually separate parts of an identifier
  - [ ] SUPPORT ADDED ALREADY - valid identifier chars:
    - M `Ɱ` U+04CE
    - \s `ˑ` U+02D1 (for space)
    - * `ӿ` U+04FF
    - ** `ᕯ` U+156F
    - / `Ⳇ` U+2CC6
    - - `ￚ` U+FFDA
    - . `ˌ` U+02CC
    - : `ː` U+02D0
    - < `ᐸ` U+1438
    - > `ᐳ` U+1433
    - @ `ဇ` U+1007
  - [ ] CONSIDER FUTURE SUPPORT - valid identifier chars:
    - \ `〵` U+3035
    - ? `ॽ` U+097D
    - # `ꐚ` U+A41A
    - + `ᕀ` U+1540
    - ! `ǃ` U+01C3
    - | `ǀ` U+01C0
    - ^ `ᣔ` U+18D4
    - ~ `ᱻ` U+1C7B
    - ' `ʼ` U+02BC
    - " `ˮ` U+02EE
    - ` `ˋ` U+02CB
    - % `ꕑ` U+A551   any better one?
    - , `ˏ` U+02CF   any better one?
    - ; `ꓼ` U+A4FC   any better one?
    - = `ꘌ` U+A60C   any better one?

    - none found for: `( ) [ ] { } &`
 
`/foo/b(ar|az)/quux` <-- real parentheses
`/foo/bᑕar|azᑐ/quux`
`/foo/bᒥar|az/quux`
`/foo/bᒪar|azᒧ/quux`
`/foo/bᒻar|azᒽ/quux`
`/foo/bᔪar|azᔨ/quux`
`/foo/bᕮar|azᕭ/quux`
`/foo/bᕳar|azᕲ/quux`
`/foo/bᖱar|azᖲ/quux`
`/foo/bᗕar|azᗒ/quux`
`/foo/bᗧar|azᗤ/quux`
`/foo/bᗭar|azᗪ/quux`
`/foo/bᗴar|azᗱ/quux`
`/foo/bᘳar|azᘰ/quux`
`/foo/bᢰar|azᢱ/quux`
`/foo/bᢱar|azᢰ/quux`
`/foo/bᐊar|azᐅ/quux`
`/foo/bᗏar|azᗌ/quux`
`/foo/bᕙar|azᕗ/quux`
`/foo/bᦷar|azᦡ/quux`
`/foo/bꀯar|azꡳ /quux` <-- not too bad?
`/foo/b𐡋ar|az𐡐/quux` but the right bracket is double-width PITA U+10C23
`/foo/bꉔar|az𐰣/quux` but the right bracket is double-width PITA U+10C23

`(1 * (2 + 3)) / 4`
`ᐊ1 * ᐊ2 + 3ᐅᐅ / 4`
`ꀯ1 * ꀯ2 + 3ꡳꡳ / 4`

`ᑘ0FA4`
`ᑘ0FA4`

`𐩧` (U+10A67) bad handling in VSCode - double width
`𐰣` (U+10C23) "     "

```
i have spaces
i( )have( )spaces
i[ ]have[ ]spaces
i+have+spaces

literal [+] sign
it(')s about time
it[']s about time
GET http://blah.com
GET [ ] http://blah.com
GET+http://blah.com
http://app.co[#]some-id
http://app.co/things?item=t[[100]]
(ab*c|a*bc)def
```


Predicate Special Chars:
- Literal Match:
  - `/ ? ; : @ & = + $ ,`
  - `- _ .`

- Reserve for operators:
  - ```* ... { } | [ ] ! ^ ( ) \ ~ ` ```

- Questionable
  - Unicode char literals
  - Unicode escape sequences
  - `< > " '`
  - whitespace: `\s \t \r \n`  etc
  - `#`     used for URL fragments
  - `%`     used for encoding

- Likely operators to be added to predicate syntax:
  union
  mega-sep
  mega-glob
  list of alternatives
  not


## Capturing syntax review ideas

NB: general idea is to decouple named captures from wildcard/globstar operators

```ts

// NB: syntax highlighting would make any of these more acceptable. Write a vscode extension?
var routes = {
    // The basic predicate with no captures
    '/employees/*/bank-accts/*': staticFiles('path'),

    // 'capture' operator, both as prefix and postfix, using various delimiters: <>, {}, ::, "", [], __
    // prefix: clearly states that we are naming the next thing, esp if 'the next thing' is long
    // postfix: keeps emphasis on the predicate, names are appended and sorta de-emphasised
    '/employees/<empId>*/bank-accts/<acctId>*': staticFiles('path'),
    '/employees/*<empId>/bank-accts/*<acctId>': staticFiles('path'),
    '/employees/{empId}*/bank-accts/{acctId}*': staticFiles('path'),
    '/employees/*{empId}/bank-accts/*{acctId}': staticFiles('path'),
    '/employees/:empId:*/bank-accts/:acctId:*': staticFiles('path'),
    '/employees/*:empId:/bank-accts/*:acctId:': staticFiles('path'),
    '/employees/"empId"*/bank-accts/"acctId"*': staticFiles('path'),
    '/employees/*"empId"/bank-accts/*"acctId"': staticFiles('path'),
    '/employees/[empId]*/bank-accts/[acctId]*': staticFiles('path'),
    '/employees/*[empId]/bank-accts/*[acctId]': staticFiles('path'),
    '/employees/_empId_*/bank-accts/_acctId_*': staticFiles('path'),
    '/employees/*_empId_/bank-accts/*_acctId_': staticFiles('path'),

    // better or worse to allow non-significant whitespace?
    '/ employees / *<empId> / bank-accts / *<acctId>': staticFiles('path'),
    '/ employees / empId:* / bank-accts / acctId:*': staticFiles('path'),
    '/ employees / *:empId / bank-accts / *:acctId': staticFiles('path'),
    '/employees/ *:empId /bank-accts/ *:acctId': staticFiles('path'),
    '/employees/ (*:empId) /bank-accts/ (*:acctId)': staticFiles('path'),

    // 'capture' operator with implicit closing delimiter
    '/employees/(*:empId)/bank-accts/(*:acctId)': staticFiles('path'),  // ends because of closing parens
    '/employees/*:empId/bank-accts/*:acctId': staticFiles('path'),      // ends after last alphanum (ie, the next '/')

    // Same ideas, different predicate...
    '/(c*t)<word>': staticFiles('path'), // postfix with both delimiters...
    '/(c*t){word}': staticFiles('path'),
    '/(c*t):word:': staticFiles('path'),
    '/(c*t)"word"': staticFiles('path'),
    '/(c*t)[word]': staticFiles('path'),

    '/(c*t):word': staticFiles('path'), // fine, unambiguous - : matches single preceding thing
    '/(c*t:word)': staticFiles('path'), // sorta ok, but need rules about how much of preceding thing gets captured
    '/c*t:word': staticFiles('path'),   // as above, but less clear: Would the '/' be captured or not? Intuition: no it wouldn't.

    '/word:(c*t)': staticFiles('path'), // prefix instead...
    '/(word:c*t)': staticFiles('path'),
    '/word:c*t': staticFiles('path'),
    '/[word]c*t': staticFiles('path'),

    // Positional captures - no names here - they should be documented elsewhere (but then they might get out of sync with predicate)
    '/employees/{*}/bank-accts/{*}': staticFiles('path'),
    '/{c*t}': staticFiles('path'),
    '/employees/[*]/bank-accts/[*]': staticFiles('path'),
    '/[c*t]': staticFiles('path'),
    '/employees/*^1/bank-accts/*^2': staticFiles('path'),
    '/(c*t)^1': staticFiles('path'),
    '/employees/*¹/bank-accts/*²': staticFiles('path'),
    '/(c*t)¹': staticFiles('path'),
    '/employees/*ᵉᵐᵖⁱᵈ/bank-accts/*ᵃᶜᶜᵗⁱᵈ': staticFiles('path'), // fun fact: all latin letters except 'q' have lowercase superscript forms in unicode.
    '/(c*t)ʷᵒʳᵈ': staticFiles('path'),
}

```





## Done
- [x] implement `async: false` option properly, with tests
  - [x] assert method result is not promise-like in thunks (strict mode)
  - [x] document strict vs non-strict behaviour (extra checks vs trusts you to conform to options you specified)
  - [x] add tests
- [x] implement `async: true` option properly, with tests
  - [x] assert method result is promise-like in thunks (strict mode)
  - [x] assert that method does not synchronously throw
  - [x] document strict vs non-strict behaviour (extra checks vs trusts you to conform to options you specified)
  - [x] document reliance on global `Promise.resolve(...)` when `{strict: true, async: true}` and a method throws
  - [x] add tests
- [x] use `Ɱ0`, `Ɱ1`, etc for mm funcion names
- [x] support more special characters in predicates
  - [x] switch globstar from `...`/`…` to `**`/`ᕯ`
  - [x] don't allow `ᕯ` in Predicate or NormalPredicate (use `**`). It should only appear in `identifier`
  - [x] ensure predicate chars are whitelisted, not blacklisted, to avoid potential regex exploits
  - [x] add support initially for: `:<>`
  - [x] remove all refs to `∅` in codebase and tests and mds
- [x] add a good default implementation for `toDiscriminant`
- [x] fix buggy emit for isMatch and getCaptures lines (see comment there in code)
- [x] tidy up the method/dispatcher instrumentation code
- [x] `multimethods.min.js`: test that the bundle actually works the same in a browser
- [x] ensure UMD file is working in Chrome, Firefox and Edge
- [x] override mm's `toString()` to give mm source code, and remove EMIT debug logging
- [x] build system: use webpack to create a UMD file of the library (eg so can use in browser)
  - [x] get it working
  - [x] minify the bundle
  - [x] rename dist dirs: `release` --> `commonjs`, `bundle` --> `umd`
  - [x] do all in single build step (fix npm scripts)
- [x] build system: integrate tslint
- [x] TODO: revise codegen
  - [x] move all `isMatch`, `getCaptures`, and `callHandler` vars to one place at the end of emit
  - [x] fix dispatchFunction (see TODOs on lines 56-57 of `generate-dispatch-function.ts`)
  - [x] always output codegen in debug mode
  - [x] investigate: can it be made more understandable/idiomatic?
    - [x] remove unnecessary .toStrings on predicates (which are simply strings at runtime, but tagged at compile-time)
  - [x] investigate: can the source 'stitching together' be made more template-like?
- [x] do proper emit for the dispatch function - currently it is hardcoded to unary arity.
  - [x] put it through same emit steps as executor template function
  - [x] make a templates dir and put templates in there?
- [x] add option `strictChecks: boolean`
  - [x] add note for future addition: this option *may* be expanded to allow for specific strict checks
  - [x] current uses of `util.warn` become errors *iff* strictChecks is true, else no error/warning issued.
  - [x] remove all `warn`-related stuff from codebase
- [x] add an `fatalError.ts` file listing all possible errors with a short code and a description with {0} holes
  - [x] use these codes when throwing errors (via helper)
  - [x] improve the 'MM contains conflicts' error message. i.e., what does it mean? How to fix it?
    - [x] MM has no catch-all handler, so some calls may no be dispatchable. To resolve this problem, define a handler for the predicate '...'
    - [x] MM has ambiguities, so some calls may not be dispatchable. To resolve this problem, define handlers for the predicates(s) ${...}
- [x] split unit tests from perf work.
  - [x] perf moves to `/extras/bench`, call with `npm run bench`
  - [x] simplify under dirs `/test`
- [x] emit to `/dist/release`, `/dist/test`, `/dist/extras`
- [x] Ensure runtime support for ES5 envs without perf loss
  - [x] remove `emitES5` option
  - [x] Don't use ES6 libs in `/src` (but can use them in `/test` and `/extras`)
  - [x] Downlevel ES6 language features `/src` (but not in `/test` and `/extras`)
  - [x] Ensure 'templates' contain no ES6 to begin with, to avoid surprise behaviour with 'macro' subtitutions
    - [x] carefully audit all generated code for possible ES6 usage:
      - [x] arrow functions
      - [x] rest/spread
      - [x] ES6 runtime - Promise, Symbol, string functions, etc
      - [x] other - check&whitelist every line to rule out anything missed above
    - [x] EXCEPTIONS (supported even in IE11):
      - [x] let/const
      - [x] Map & Set basic usage
      - [x] Object.setPrototypeOf
  - [x] ensure benchmarks have not suffered
- [x] UNHANDLED --> FALLBACK
  - [x] export the default FALLBACK sentinel value
  - [x] replace refs everywhere
  - [x] fix 'unhandled' option
  - [x] explain in README what FALLBACK sentinel means (imperative, not declarative)
  - [x] what happens when last handler returns FALLBACK?
    - [x] FALLBACK should not be observable to clients; it is an internal dispatch imperative
    - [x] throw an unhandled dispatch error (new case in `fatalErrors.ts`)
- [x] TODO: Helper(s) to compose handlers manually
  - [x] permit listing regular handlers in an array ('chain')
  - [x] permit listing metahandlers in an array ('chain')
  - [x] permit mixing metahandlers and regular handlers in an array ('chain')
    - [x] implement special ordering laws and validate them
  - [x] ambiguity is now an error - there is no tieBreak fn (apart from metarule vs rule)
    - [x] remove all references to `tiebreak` and `moreSpecific` function in code/comments
    - [x] simplify code that previously used tiebreak stuff, if/where possible
  - [x] remove predicate comment support - they were not really 'comments' since they affected semantics
  - [x] enforce 'meta-handlers before regular-handlers in chains' convention. Early error if not.
    - [x] explain in docs that this simplifies reading of chains as having left-to-right execution order
- [x] revise FALLBACK
  - [x] change to CONTINUE
  - [x] don't allow overriding; remove from MMOptions (check this will work with routist first)
- [x] add `debug` logging using the `debug` module
  - [x] replaces `trace` option. Remove that.
  - [x] use npm `debug` module to sent all debug/trace messages
    - [x] why not events? ANS: They are node.js-specific.
  - [x] remove 'trace' code from executor function; replace with wrapper functions on all handlers when in debug mode
  - [x] turn `strictChecks` checks into debug warnings and remove `strictChecks` option
- [x] export a `validate(mm): void` function that does strict checking and throws a list of errors on failure
  - [x] remove the `strictChecks` option
  - [x] move what were the strict checks into the validate function
- [x] SKIPPED: Use/support ES6 `class` syntax for defining multimethods
  - [x] SKIPPED: MM = static class, you call the constructor, not an instance
    - [x] SKIPPED: prevent instantiation
    - [x] SKIPPED: allow calling the class ctor like a function (no `new`)
      - [x] is this even permitted with ES6 classes? Ans: NO





## Done (older)
- [x] switch stricter tsconfig flags back on (eg strictNullChecks, noImplicitAny)
- [x] Do some V8 profiling/analysis. list possible optimisations.
  - [x] indexOf (in make-match-method.js) takes ~30% of time - try rewriting
  - [x] the (unoptimizable) generator function housing the perf test loop takes ~20% of time (remove it)
  - [-] do try this --> splitting selector function into multiple small functions (one per non-leaf node in taxonomy)
  - [x] others?
- [x] official logo - cactus in yellow box. c.f. 'JS' and 'then' logos
- [x] enfore max line length <= 120 chars
- [x] get whole lib working in ES5 mode (currently there are runtime errors due to reliance on ES6 runtime features in source)
- [x] rename Pattern (class/type) to Predicate, and patternSource (arg/var) to pattern
  - [x] update all affected file/folder names
  - [x] update all affected names of exports/imports/vars/functions
  - [x] update all references in comments
  - [x] update all tests including test names
- [x] predicates: divide evaluation into two methods ('evaluate' and 'capture')?
- [x] use arrow functions in executor template then downlevel them.
- [x] arrange all src/multimethod files & exports more nicely
- [-] rename 'route' in WithRoute to 'matchedRules'
- [x] ensure codegen uses no ES6 features when emitES5 option is set
  - [x] arrow functions
  - [x] let/const
  - [x] rest/spread
  - [x] builtins
  - [x] other?
- [x] provide a default UNHANDLED value in the library.
  - [-] Users can optionally override it in MM options
- [x] replace all void 0 with undefined
- [x] README - remove TODO lists into separate files (or into github issue(s)?)
- [x] Multimethod: conflicts... (tiebreak / disambiguate / ambiguity)
- [x] Multimethod: getDiscriminant --> toDiscriminant
- [x] Multimethod: address --> discriminant
- [x] ~~Multimethod: Rule --> Method~~
- [x] Multimethod: Rule#test --> Method#predicate
- [x] Multimethod: support any/all arities
- [x] remove global 'warnings' option - should be a per-multimethod option (or have both? local override + fallback to global)
- [x] mockable log methods (warn, error) - unit tests can mock these
- [x] Multimethod options
  - [x] specify fixed arity (0=variadic) - this is used to generate efficient calls via eval
  - [x] getDiscriminant is passed all args that are passed to Multimethod
- [x] RuleSet: change to UNHANDLED sentinel value instead of null
- [x] RuleSet: allow UNHANDLED value to be specified as an option
- [x] transpile to /dist or /built directory and npmignore src/
- [x] more pegjs to devDeps and make PEG compilation a build step
- [x] change {...rest} to {**rest} / {…rest} for consistency?
- [x] change ** to ...?
- [x] rename Taxonomy --> TxonomyNode? Need to make clear each instance fundamentally represents a node, and a bunch of them form a graph
- [x] decouple address from Request
- [x] add Pattern#intersect, update all call sites (just make-taxonomy)
- [x] create Taxonomy class and/or add /src/taxonomy/index.ts
- [x] improve taxonomy test coverage
- [x] asyncify Handler#execute
- [x] still need `isPromise`? If not, remove it :( Otherwise find a use for it.
- [x] add npmignore
- [x] use @types, remove typings
