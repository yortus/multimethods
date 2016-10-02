import * as assert from 'assert';
import {OldMultimethod, UNHANDLED, util} from 'multimethods';
// TODO: perf testing... write this up properly.





// RESULTS:
// ====================================================================================================================
// DATE         MACHINE     RESULT                                                              NOTES
// --------------------------------------------------------------------------------------------------------------------
// 2016-08-22   LAJESTIC    Dispatched 1000000 requests in 1.52 seconds    (~667000 req/sec)    After switching from ES5 + asyncawait to ES6 + async/await (although no async routes here!?) Commit: 4789506
// 2016-08-22   LAJESTIC    Dispatched 1000000 requests in 1.172 seconds   (~853000 req/sec)    New baseline (haven't run this for quite a while). Commit: 1385eb5

// 2016-03-05   LAJESTIC    Dispatched 1000000 requests in 0.748 seconds   (~1337000 req/sec)   After adding async handler support (ie handlers may return Promises)
// 2016-02-26   LAJESTIC    Dispatched 1000000 requests in 0.669 seconds   (~1495000 req/sec)   After project restructure, but no significant codegen diff from prev
// 2016-02-25   LAJESTIC    Dispatched 1000000 requests in 0.826 seconds   (~1211000 req/sec)   More % time spent executing compiled routes
// 2016-02-25   LAJESTIC    Dispatched 1000 requests in 0.015 seconds      (~67000 req/sec)     More % time spent executing route setup
// ====================================================================================================================





// Declare test configuration.
const COUNT = 1000000;


// Declare the test rule set.
const ruleSet = {
    '/foo': () => 'foo',
    '/bar': () => 'bar',
    '/baz': () => 'baz',
    '/*a*': ($req, _, $next) => `---${ifUnhandled($next($req), 'NONE')}---`,

    'a/*': () => `starts with 'a'`,
    '*/b': () => `ends with 'b'`,
    'a/b': () => `starts with 'a' AND ends with 'b'`,

    'c/*': () => `starts with 'c'`,
    '*/d': () => `ends with 'd'`,
    'c/d': () => UNHANDLED,

    'api/... #a': () => `fallback`,
    'api/... #b': () => `fallback`,
    'api/fo*o': () => UNHANDLED,
    'api/fo* #2': ($req, _, $next) => `fo2-(${ifUnhandled($next($req), 'NONE')})`,
    'api/fo* #1': ($req, _, $next) => `fo1-(${ifUnhandled($next($req), 'NONE')})`,
    'api/foo ': ($req, _, $next) => `${ifUnhandled($next($req), 'NONE')}!`,
    'api/foo': () => 'FOO',
    'api/foot': () => 'FOOt',
    'api/fooo': () => 'fooo',
    'api/bar': () => UNHANDLED,

    'zzz/{...rest}': (_, {rest}, $next) => `${ifUnhandled($next({address: rest.split('').reverse().join('')}), 'NONE')}`,
    'zzz/b*z': ($req) => `${$req.address}`,
    'zzz/./*': () => 'forty-two'
};


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

    `zzz/baz ==> zab`,
    `zzz/booz ==> zoob`,
    `zzz/looz ==> NONE`,
    `zzz/./{whatever} ==> forty-two`
];


// TODO: ...
(async () => {

    // Set up the tests.
    console.log(`Running perf test: basic routing...`);
    let ruleSetHandler = new OldMultimethod<string>({toDiscriminant: r => r.address}, ruleSet);
    let addresses = tests.map(test => test.split(' ==> ')[0]);
    let requests = addresses.map(address => ({address}));
    let responses = tests.map(test => test.split(' ==> ')[1]);
    responses.forEach((res, i) => { if (res === 'UNHANDLED') responses[i] = <any> UNHANDLED; });


    // Start timer.
    let start = new Date().getTime();


    // Loop over the tests.
    for (let i = 0; i < COUNT; ++i) {
        let index = Math.floor(Math.random() * tests.length);
        let res = ruleSetHandler(requests[index]);
        let actualResponse = util.isPromiseLike(res) ? await (res) : res;
        assert.equal(actualResponse, responses[index]);
    }


    // Stop timer.
    let stop = new Date().getTime();


    // Output performance results.
    let sec = (stop - start) / 1000;
    let rate = Math.round(0.001 * COUNT / sec) * 1000;
    console.log(`Dispatched ${COUNT} requests in ${sec} seconds   (~${rate} req/sec)`);
})().catch(console.log);


// TODO: doc helper...
function ifUnhandled(lhs, rhs) {
    return lhs === UNHANDLED ? rhs : lhs;
}
