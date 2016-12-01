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
- [ ] switch stricter tsconfig flags back on (eg strictNullChecks, noImplicitAny)
- [ ] Do some V8 profiling/analysis. list possible optiisations.
- [ ] official logo - cactus in yellow box. c.f. 'JS' and 'then' logos
----------
- [ ] clarify terminology around executor/method/rule/tryRule/tryMetaRule
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
