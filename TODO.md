## Decisions:
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

- [ ] TODO: Helper(s) to compose handlers manually
  - [ ] TODO: composing normal handlers...
  - [ ] TODO: coposing metarule handlers...
  - [ ] replaces tieBreakFn / moreSpecific - remove all refs in code
  - [ ] ambiguity is now an error - there is no tieBreak fn (apart from metarule vs rule)
  - [ ] remove predicate comment support - they were not really 'comments' since they affected semantics

- [ ] add option `debug: boolean`
  - [ ] replaces `trace` option. Remove that.
  - [ ] use npm `debug` module to sent all debug/trace messages
  - [ ] remove 'trace' code from executor function; replace with wrapper functions on all handlers when in debug mode
  - [ ] if `strictChecks===false` and `debug===true`, still do strict checks but just output to debug() and continue
- [ ] remove add() method. Multimethods are immutable.
  - [ ] document that multimethods are immutable and why. e.g. can emit fast code for them.
  - [ ] add note for future addition: export helper functions to 'add' multimethods to create a new multimethod
- [ ] rename UNHANDLED to FALLBACK or CASCADE.
  - [ ] doc/explain naming - this is an imperative return value of what MM should do next, not a declaration of what just happened in current handler.
  - [ ] add note for future addition: more sentinel return values for other builtin behaviours. Such as?
- [ ] improve error API & strong typing
- [ ] strictest TSC options in `/test` and `/extras`

- [ ] TODO: revise codegen
  - [ ] fix dispatchFunction (see TODOs on lines 56-57 of `generate-dispatch-function.ts`)
  - [ ] always output codegen in debug mode
  - [ ] investigate: can it be made more understandable/idiomatic?
    - [ ] TODO: findings & actions...
    - [ ] remove unnecessary .toStrings on predicates (which are simply strings at runtime, but tagged at compile-time)
  - [ ] inventigate: can the source 'stitching together' be made more template-like?
    - [ ] TODO: findings & actions...

- [ ] TODO: fix meta() function
  - [ ] should detect whether used as a wrapper function around a handler, or as a property decorator

- [ ] TODO: improve `fatalError.ts`
  - [ ] TODO: investigate alternatives... current form:   +ve = type-consistency   -ve = intellisense
  - [ ] remove dep on `util.format`

- [ ] max strictness in `tsconfig.json` for src, tests and extras
  - [ ] are there any new strictness flags to add?

- [ ] TODO: investigate `Multimethod instanceof Function` workaround for IE11


## Notes


ES6 features in use
- in source code
  - arrow functions
  - spread
  - computed properties
  - classes
  - Promise
  - Map
  - String#repeat()
  - Symbol.hasInstance()
  - Array.from

- in generated code
  - arrow functions
  - rest
  - spread


JS Environments that support ES6 as used:
- Node.js:  >= 6.5
- Chrome:   Last 9+ versions
- Firefox:  Last 9+ versions
- Edge:     Last 3+ versions
- Safari:   Last 2 versions
- iOS:      Last 2 versions
- IE:       Not supported



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
  





## Renaming and Reorganising
### To Dos
- Predicate: replace class with one or more branded strings and free functions
  - parsePredicate(s: string): Predicate
  - normalisePredicate(p: Predicate): NormalisedPredicate
  - ...
- Taxonomy...? - an Euler Diagram represented as a DAG whose nodes are Set instances, where a Set contains a predicate, links to supersets and subsets, and extra annotations

- Multimethod...?






### Set Theory, Logic & Math
- Predicate
- predicate notation (pattern / DSL)
- predicate normalisation
- predicate evaluation
- Set
- Euler Diagram
- intersection
- union
- subset
- superset
- universe of strings
- partition



type Predicate = string & { __predicateBrand: any }
type NormalisedPredicate = Predicate & { __normalisedPredicateBrand: any }

Predicate functions:
- parse(pred: Predicate): PredicateAST
- normalise(pred: Predicate): NormalisedPredicate
- toIdentifier(pred: Predicate): string
- getMembershipFunction(pred: Predicate): (s: string) => boolean
- getUnificationFunction(pred: Predicate): (s: string) => Captures
- equals(p: Predicate, q: Predicate): boolean
- intersect(p: Predicate, q: Predicate): Predicate[]; // or introduce 'or' operator in predicate DSL

Set functions:
- generate taxonomy from predicates
- annotate taxonomy








# Source Audit for terminology & naming
- [ ] /src/multimethod/impl/create-multimethod.ts
- [x] /src/multimethod/impl/disambiguate-routes.ts
- [x] /src/multimethod/impl/disambiguate-rules.ts
- [ ] /src/multimethod/impl/make-composite-method.ts
- [x] /src/multimethod/impl/rule.ts


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


- [x] move TODO list(s) to separate github issues
- [x] clean up README - just keep glossary, pattern info for now

- [x] use @types, remove typings

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



- [x] RuleSet: change to UNHANDLED sentinel value instead of null
- [x] RuleSet: allow UNHANDLED value to be specified as an option
- [ ] RuleSet: allow custom 'tiebreak' function to be specified as an option
- [ ] Transport: for 'file' responses, harden againt rel paths in address eg '../../../sys/passwords.txt'
- [ ] docs: some code comments are almost impossible to grasp (eg see comments in findAllRoutesThroughRuleSet). Need step-by-step explanations of concepts in separate .md file(s), code can refer reader to these docs for more explanation. Code comments should then be reduced to simpler statements.
- [ ] make runnable client-side
  - [ ] isolate/replace rule-set deps: node (assert, util)
  - [ ] isolate transport deps: node (http/s), node-static
- [ ] investigate N-way multiple dispatch
  - [ ] RuleSet becomes Dispatcher and ctor takes params for: ruleSet, arg->addr mapper(s), options
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
