## Todo - High Priority
- [ ] support more special characters in predicates
  - [ ] switch globstar from `...`/`…` to `**`/`ᕯ`
  - [ ] initially: ':<>'
- [x] add a good default implementation for `toDiscriminant`
- [x] fix buggy emit for isMatch and getCaptures lines (see comment there in code)





## Todo - Medium Priority
- [x] tidy up the method/dispatcher instrumentation code
- [ ] support numeric discriminant matching for very fast dispatch scenarios (like my C++/C# MMs did)
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
- [ ] Improve unit test coverage
  - [ ] add basic tests for correct arg passing for variadic, nullary, unary, binary and ternary MMs



## Todo - Unassigned Priority
- [ ] new option `toType: Function` - if provided and no `toDiscriminant` given, the default `toDiscriminant` uses it
- [ ] new option `allowNulls` - mms should reject `null` args unless this is explicitly set to `true`
- [ ] support simplified MM creation: accept method table directly instead of inside `methods` prop.




## Decisions:
- [ ] Update predicate special character handling
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
      - [ ] TODO: change back to `**`? Pros: One less special char. Cons: Ambiguous?
      - [ ] Use single unicode 'letter' char for `**` : U+156F `ᕯ`
    - [ ] `{...}` wildcard/globstar named capture
  - [ ] TODO: Reserve the following characters for future use:
    - `( ) |`
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
    - [ ] EXPERIMENTS - valid identifier chars:
      - M `Ɱ` (U+04CE)
      - M `ϻ` (U+03FB)
      - / `Ⳇ` (U+2CC6)
      - \ `〵` (U+3035)
      - * `ӿ` (U+04FF)
      - ** `ᕯ` (U+156F)
      - : `ː` (U+02D0)
      - . `ˌ` (U+02CC)
      - < `ᐸ` (U+1438)
      - > `ᐳ` (U+1433)
      - ? `ॽ` (U+097D)
      - - `ￚ` (U+FFDA)
      - # `ꐚ` (U+A41A)
      - + `ᕀ` (U+1540)
      - ! `ǃ` (U+01C3)
      - | `ǀ` (U+01C0)
      - ^ `ᣔ` (U+18D4)
      - ~ `ᱻ` (U+1C7B)
      - @ `ဇ` (U+1007)
      - ' `ʼ` (U+02BC)
      - " `ˮ` (U+02EE)
      - ` `ˋ` (U+02CB)
      - \s `ˑ` *U+02D1) for space
      - % `ꕑ` (U+A551)   any better one?
      - , `ˏ` (U+02CF)   any better one?
      - ; `ꓼ` (U+A4FC)   any better one?
      - = `ꘌ` (U+A60C)   any better one?

      - none found for: `( ) [ ] { } &`
      -  `` (U+)
 
      - `/foo/b(ar|az)/quux`

      - `/foo/bᑕar|azᑐ/quux`
      - `/foo/bᒥar|az/quux`
      - `/foo/bᒪar|azᒧ/quux`
      - `/foo/bᒻar|azᒽ/quux`
      - `/foo/bᔪar|azᔨ/quux`
      - `/foo/bᕮar|azᕭ/quux`
      - `/foo/bᕳar|azᕲ/quux`
      - `/foo/bᖱar|azᖲ/quux`
      - `/foo/bᗕar|azᗒ/quux`
      - `/foo/bᗧar|azᗤ/quux`
      - `/foo/bᗭar|azᗪ/quux`
      - `/foo/bᗴar|azᗱ/quux`
      - `/foo/bᘳar|azᘰ/quux`
      - `/foo/bᢰar|azᢱ/quux`
      - `/foo/bᢱar|azᢰ/quux`
      - `/foo/bᐊar|azᐅ/quux`
      - `/foo/bᗏar|azᗌ/quux`
      - `/foo/bᕙar|azᕗ/quux`
      - `/foo/bᦷar|azᦡ/quux`
      - `/foo/b𐡋ar|az𐡐/quux` but the right bracket is double-width PITA U+10C23
      - `/foo/bꉔar|az𐰣/quux` but the right bracket is double-width PITA U+10C23
      - `/foo/bꀯar|az /quux` no matching RB :(


      - `(1 * (2 + 3)) / 4`
      - `ᐊ1 * ᐊ2 + 3ᐅᐅ / 4`


`ᑘ0FA4`
`ᑘ0FA4`

`ꡳ` (U+A873)
`𐩧` (U+10A67) bad handling in VSCode - double width
`𐰣` (U+10C23) "     "

  - [ ] Examples:

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



- [ ] export an `extend` function that takes a MM and a rules hash and returns a new multimethod
  - [ ] use `super` in chains to control overriding behaviour w.r.t. original MM








- [ ] remove add() method. Multimethods are immutable.
  - [x] remove add method
  - [ ] document that multimethods are immutable and why. e.g. can emit fast code for them.
  - [ ] add note for future addition: export helper functions to 'add' multimethods to create a new multimethod

- [ ] rename UNHANDLED
  - [x] rename to CONTINUE
  - [ ] doc/explain naming - this is an imperative return value of what MM should do next, not a declaration of what just happened in current handler.
  - [ ] add note for future addition: more sentinel return values for other builtin behaviours. Such as?
- [ ] improve error API & strong typing
- [ ] strictest TSC options in `/test` and `/extras`

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

- [ ] Add/revise tests
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

- [ ] TODO: fix meta() function
  - [ ] should detect whether used as a wrapper function around a handler, or as a property decorator

- [ ] TODO: improve `fatalError.ts`
  - [x] investigate alternatives... current form:   +ve = type-consistency   -ve = intellisense
  - [ ] remove dep on `util.format`

- [ ] max strictness in `tsconfig.json` for src, tests and extras
  - [ ] are there any new strictness flags to add?

- [ ] TODO: investigate `Multimethod instanceof Function` workaround for IE11


## Notes

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
  








# Other audits:
- [ ] consistent British English spelling
- [ ] consistent code style & quality
- [ ] functionality & test converage
- [ ] perforance & benchmarks
- [ ] all errors and warnings (eg validation, codegen, etc)


# To Do List
- [x] switch stricter tsconfig flags back on (eg strictNullChecks, noImplicitAny)
- [ ] Do some V8 profiling/analysis. list possible optimisations.
  - [x] indexOf (in make-match-method.js) takes ~30% of time - try rewriting
  - [x] the (unoptimizable) generator function housing the perf test loop takes ~20% of time (remove it)
  - [ ] do try this --> splitting selector function into multiple small functions (one per non-leaf node in taxonomy)
  - [ ] others?
- [ ] official logo - cactus in yellow box. c.f. 'JS' and 'then' logos
- [ ] enfore max line length <= 120 chars
- [ ] get rid of nasty TypeScript '!' non-null assertions in code
- [ ] get whole lib working in ES5 mode (currently there are runtime errors due to reliance on ES6 runtime features in source)
----------
- [ ] rename Pattern (class/type) to Predicate, and patternSource (arg/var) to pattern
  - [x] update all affected file/folder names
  - [ ] update all affected names of exports/imports/vars/functions
  - [ ] update all references in comments
  - [x] update all tests including test names
----------
- [ ] clarify terminology around executor/route/method/rule/tryRule/tryMetaRule
  - [x] *method* is a client-provided function that implements the behaviour associated with a rule
  - [x] *rule* is a client-provided predicate/method pair, a bunch of which comprise the behaviour of a multimethod
  - [ ] *lineage*???

- [ ] clarify terminology around pattern vs predicate
  - [x] *predicate* is a class/object for recognising specific strings, similar to a RexExp object but supports set analysis
  - [x] *predicate pattern* is the string/textual representation of a predicate, using a special DSL syntax
  - [ ] *predicate matching* - testing whether a predicate is true for a given string (and computing captures as well)
  - [ ] *predicate intersection* - TODO

- [ ] predicates: divide evaluation into two methods ('evaluate' and 'capture')?
- [ ] use arrow functions in executor template then downlevel them.
- [ ] arrange all src/multimethod files & exports more nicely
- [ ] rename 'route' in WithRoute to 'matchedRules'
- [ ] ensure codegen uses no ES6 features when emitES5 option is set
  - [ ] arrow functions
  - [ ] let/const
  - [x] rest/spread
  - [ ] builtins
  - [ ] other?
- [ ] provide a default UNHANDLED value in the library. Users can optionally override it in MM options
- [ ] replace all void 0 with undefined
- [ ] Use consistent British English spelling (-ise vs -ize)
- [x] README - remove TODO lists into separate files (or into github issue(s)?)

- [ ] Multimethod: get rid of refs to address, request, response (now discriminant, parameters/arguments, return value/result)
- [ ] Multimethod: conflicts... (tiebreak / disambiguate / ambiguity)
- [x] Multimethod: getDiscriminant --> toDiscriminant
- [x] Multimethod: address --> discriminant
- [x] ~~Multimethod: Rule --> Method~~
- [x] Multimethod: Rule#test --> Method#predicate
- [ ] Multimethod: decorator -> meta-rule
- [ ] Multimethod: Route --> MatchingMethods                    Path
- [ ] Multimethod: RouteHandler --> ShortlistHandler???         PathHandler
- [ ] Multimethod: RouteSelector --> ShortlistSelector          PathSelector
- [ ] Multimethod: makeRouteHandler --> makeShortlistHandler???
- [ ] Multimethod: makeRouteSelector --> makeShortlistSelector
- [ ] Multimethod: makeMultimethodHandler --> ???
- [ ] Multimethod: disambiguateRoutes --> ???                   disambiguatePaths
- [ ] Multimethod: disambiguateRules --> disambiguateMethods
precomputeCandidateListHandlers
precomputeCandidateListSelector


MethodChain
Cascade
MatchingMethods (precompute as optimisation)
Matches
DispatchList
CandidateList
Shortlist
MethodStack
MatchList (no good)
Contenders






- [ ] Multimethod: support any/all arities
- [ ] remove global 'warnings' option - should be a per-multimethod option (or have both? local override + fallback to global)
- [x] mockable log methods (warn, error) - unit tests can mock these
- [ ] Multimethod - fix up all terminology
  - [ ] src code props, vars, fns, exports, filenames, etc
  - [ ] src code comments
  - [ ] README - glossary, descriptions, etc

- [ ] revise/revamp action/decorator function validation
  - [x] MAIN AIM: to ensure patterns stay synced with their handlers, and error early if not, with opt-outs
  - [x] new file 'validate-handler-function.ts' replaces/based on  'util/get-function-parameter-names.ts' and tests
  - [x] >3 params is an error. 0-3 params is fine.
  - [x] names of first and third param are unchecked. Anything is fine for those.
  - [ ] second param, the `captures` param:
    - [x] if object destructuring is used, require 1:1 correspondence to captured names
    - [x] if object destructuring is used, either account for or don't support prop renaming (which??? depends how easy/hard)
    - [ ] if object destructuring is NOT used:
      - [ ] disallow under some 'strict checking' option?
      - [x] the name of the second param is unchecked. Anything is fine.
      - [x] if the pattern has named captures, then handler arity MUST be >= 2
      - [x] if the pattern has NO named captures, then arity < 2 is fine
  - [ ] provide a 'check handler signature' option (default=true) to multimethod constructor


- [ ] move TODO list(s) to separate github issues
- [ ] clean up README - just keep glossary, pattern info for now


- [ ] PatternMatchingFunction --> Multimethod
  - [x] define as class
    - [x] constructor returns a function
    - [x] overrides Symbol.hasInstance
    - [x] private tag to ensure instanceof TS narrowing works
    - [ ] unit tests detect hasInstance runtime support and mocha skip() tests if not supported
    - [ ] unit tests check TS narrowing works too thanks to _tag

- [ ] Multimethod dispatch
  - [ ] a rule is either (1) a test/action pair or (2) a test/decorator pair
  - [ ] action signature: `type action = (input, captures): Output | NO_MATCH | Promise<Output | NO_MATCH>`
  - [ ] decorator signature: `type decorator = (input, captures, next): Output | NO_MATCH | Promise<Output | NO_MATCH>`
  - [ ] `next` signature - allow for future expansion - complete control of downstream 'decoratee' execution

- [ ] Multimethod options
  - [ ] specify fixed arity (0=variadic) - this is used to generate efficient calls via eval
  - [ ] getDiscriminant is passed all args that are passed to Multimethod
  - [ ] allow for future expansion - two multimethod dispatch styles:
    1. [ ] discriminant is a string, and rule list is an objected keys by discriminant tests
    2. [ ] discriminant is a number, and rule list is an array. THINK: holey? how filled? how does test work?



- [ ] HTTP transport
  - change action signature: pass in an object containing both rawReq and rawRes, and return either nothing or a Promise<void> (or NO_MATCH)


- [ ] revise terminology for pattern-matching/dispatch (basically the RuleSet)
  - [x] Pattern.UNIVERSAL --> Pattern.ANY
  - RuleSet --> Dispatcher, PatternMatchingFunction
  - address --> string
  - request --> input or argument
  - respose --> output or result
  - UNHANDLED -> NO_MATCH ???
  - ??? -> discriminant
  - request --> ??? input $input in $in
  - response --> ??? result? output $output out $out
- [ ] still need `∅` pattern anywhere in /src?
- [ ] update pattern comments/docs
- [ ] update pattern (intersection) unit tests
- [ ] in RuleSet, what's involved in dropping the `address` parameter from handlers? check perf diff too...
- [ ] finalize taxonomy changes w.r.t. Pattern#intersect changes
- [ ] properly introduce RuleSet options, first option is strict/loose checking for all routes handled

- [ ] can bundling be implemented as a decorator? any advantage in doing that?
- [ ] List HTTP handler use cases
      - content (inline/mime and attachment/download)
      - json/data
      - bundles
      - redirect
      - POST/DELETE/PUT etc



- [ ] RuleSet: allow custom 'tiebreak' function to be specified as an option
- [ ] Transport: for 'file' responses, harden againt rel paths in address eg '../../../sys/passwords.txt'
- [ ] docs: some code comments are almost impossible to grasp (eg see comments in findAllRoutesThroughRuleSet). Need step-by-step explanations of concepts in separate .md file(s), code can refer reader to these docs for more explanation. Code comments should then be reduced to simpler statements.
- [ ] make runnable client-side
  - [ ] isolate/replace rule-set deps: node (assert, util)
  - [ ] isolate transport deps: node (http/s), node-static
- [ ] investigate N-way multiple dispatch
  - [ ] RuleSet becomes Dispatcher and ctor takes params for: ruleSet, arg->addr mapper(s), options










## Done
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
