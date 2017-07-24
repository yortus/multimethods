// tslint:disable:max-line-length
import * as assert from 'assert';
import {CONTINUE, create as MM, meta} from 'multimethods';
// TODO: perf testing... write this up properly.





// RESULTS:
// ====================================================================================================================
// DATE         MACHINE     RESULT                                                              NOTES
// --------------------------------------------------------------------------------------------------------------------
// 2017-07-22   LAJESTIC    Dispatched 1000000 requests in 0.741 seconds   (~1350000 req/sec)   general perf checkback after many commits.
// 2017-06-26   LAJESTIC    Dispatched 1000000 requests in 0.763 seconds   (~1311000 req/sec)   now emits proper dispatch function (with arity adjustments, etc).
// 2017-06-14   LAJESTIC    Dispatched 1000000 requests in 0.782 seconds   (~1279000 req/sec)   adjustments after making MMs throw if final result is CONTINUE.
// 2017-06-14   LAJESTIC    Dispatched 1000000 requests in 0.76 seconds    (~1316000 req/sec)   Target is now ES5 (was ES6). Codegen changed accordingly.
// 2017-06-13   LAJESTIC    Dispatched 1000000 requests in 0.803 seconds   (~1245000 req/sec)   Various (minor) tweaks after coming back to project.

// 2016-12-02   LAJESTIC    Dispatched 1000000 requests in 0.789 seconds   (~1267000 req/sec)   more tweaks of string functions (surroundedWith). NB: diminishing returns.
// 2016-12-01   LAJESTIC    Dispatched 1000000 requests in 0.812 seconds   (~1232000 req/sec)   more tweaks of string functions (startsWith, endsWith, containsSlash)
// 2016-12-01   LAJESTIC    Dispatched 1000000 requests in 0.898 seconds   (~1114000 req/sec)   after some profile-based optimisations (eg removing useless deopted IIAFE below, adding custom indexOf fn)

// 2016-11-26   LAJESTIC    Dispatched 1000000 requests in 1.625 seconds   (~615000 req/sec)    setting option arity=1
// 2016-11-26   LAJESTIC    Dispatched 1000000 requests in 4.25 seconds    (~235000 req/sec)    After rewrite of MM API, options, and codegen, with no optimising options set

// 2016-08-22   LAJESTIC    Dispatched 1000000 requests in 1.52 seconds    (~667000 req/sec)    After switching from ES5 + asyncawait to ES6 + async/await (although no async routes here!?) Commit: 4789506
// 2016-08-22   LAJESTIC    Dispatched 1000000 requests in 1.172 seconds   (~853000 req/sec)    New baseline (haven't run this for quite a while). Commit: 1385eb5

// 2016-03-05   LAJESTIC    Dispatched 1000000 requests in 0.748 seconds   (~1337000 req/sec)   After adding async method support (ie methods may return Promises)
// 2016-02-26   LAJESTIC    Dispatched 1000000 requests in 0.669 seconds   (~1495000 req/sec)   After project restructure, but no significant codegen diff from prev
// 2016-02-25   LAJESTIC    Dispatched 1000000 requests in 0.826 seconds   (~1211000 req/sec)   More % time spent executing compiled routes
// 2016-02-25   LAJESTIC    Dispatched 1000 requests in 0.015 seconds      (~67000 req/sec)     More % time spent executing route setup
// ====================================================================================================================





// Declare test configuration.
const COUNT = 1000000;


// Declare the test multimethod
const mm = MM({
    toDiscriminant: (r: {address: string}) => r.address,
    methods: {
        '**': () => 'UNHANDLED',
        '/foo': () => 'foo',
        '/bar': () => 'bar',
        '/baz': () => 'baz',
        '/*a*': meta(($req, _, next) => `---${ifUnhandled(next($req), 'NONE')}---`),

        'a/*': () => `starts with 'a'`,
        '*/b': () => `ends with 'b'`,
        'a/b': () => `starts with 'a' AND ends with 'b'`,

        'c/*': () => `starts with 'c'`,
        '*/d': () => `ends with 'd'`,
        'c/d': () => CONTINUE,

        'api/**': [() => `fallback`, () => `fallback`],
        'api/fo*o': () => CONTINUE,
        'api/fo*': [
            meta(($req, _, next) => `fo2-(${ifUnhandled(next($req), 'NONE')})`),
            meta(($req, _, next) => `fo1-(${ifUnhandled(next($req), 'NONE')})`),
        ],
        'api/foo': [
            meta(($req, _, next) => `${ifUnhandled(next($req), 'NONE')}!`),
            () => 'FOO',
        ],
        'api/foot': () => 'FOOt',
        'api/fooo': () => 'fooo',
        'api/bar': () => CONTINUE,

        // NB: V8 profiling shows the native string functions show up heavy in the perf profile (i.e. more than MM infrastructure!)
        'zz/z/{**rest}': meta((_, {rest}, next) => `${ifUnhandled(next({address: rest.split('').reverse().join('')}), 'NONE')}`),
        'zz/z/b*z': ($req) => `${$req.address}`,
        'zz/z/./*': () => 'forty-two',
    },
    arity: 1,
    async: false,
    strict: false,
});


// Encode a battery of requests with their expected responses.
const tests = [
    `/foo ==> foo`,
    `/bar ==> ---bar---`,
    `/baz ==> ---baz---`,
    `/quux ==> UNHANDLED`,
    `/qaax ==> ---NONE---`,
    `/a ==> ---NONE---`,
    `/ ==> UNHANDLED`,

    `a/foo ==> starts with 'a'`,
    `foo/b ==> ends with 'b'`,
    `a/b ==> starts with 'a' AND ends with 'b'`,

    `c/foo ==> starts with 'c'`,
    `foo/d ==> ends with 'd'`,

    `api/ ==> fallback`,
    `api/foo ==> fo2-(fo1-(FOO!))`,
    `api/fooo ==> fo2-(fo1-(fooo))`,
    `api/foooo ==> fo2-(fo1-(NONE))`,
    `api/foooot ==> fo2-(fo1-(NONE))`,
    `api/foot ==> fo2-(fo1-(FOOt))`,
    `api/bar ==> fallback`,

    `zz/z/baz ==> zab`,
    `zz/z/booz ==> zoob`,
    `zz/z/looz ==> NONE`,
    `zz/z/./{whatever} ==> forty-two`,
];


// TODO: ...
// TODO: was... (async () => {

// Set up the tests.
// tslint:disable:no-console
console.log(`Running perf test: basic routing...`);
let addresses = tests.map(test => test.split(' ==> ')[0]);
let requests = addresses.map(address => ({address}));
let responses = tests.map(test => test.split(' ==> ')[1]);

// Start timer.
let start = new Date().getTime();

// Loop over the tests.
for (let i = 0; i < COUNT; ++i) {
    let index = Math.floor(Math.random() * tests.length);
    let res = mm(requests[index]);
    let actualResponse = res;
    assert.equal(actualResponse, responses[index]);
}

// Stop timer.
let stop = new Date().getTime();

// Output performance results.
let sec = (stop - start) / 1000;
let rate = Math.round(0.001 * COUNT / sec) * 1000;
console.log(`Dispatched ${COUNT} requests in ${sec} seconds   (~${rate} req/sec)`);

// TODO: was... })().catch(console.log);


// TODO: doc helper...
function ifUnhandled(lhs, rhs) {
    return lhs === CONTINUE ? rhs : lhs;
}
