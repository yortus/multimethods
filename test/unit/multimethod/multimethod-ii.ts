import {expect} from 'chai';
import {Multimethod, UnaryMultimethod, BinaryMultimethod, TernaryMultimethod, VariadicMultimethod, meta, UNHANDLED} from 'multimethods';





// TODO: ...
describe('MULTIMETHOD II: Constructing a Multimethod instance', () => {


    // Declare the test rule set.
    const ruleSet = {
        '/foo': (ctx, req) => 'foo',
        '/bar': (ctx, req) => 'bar',
        '/baz': (ctx, req) => 'baz',
        '/*a*': meta((ctx, req) => `---${ifUnhandled(ctx.next(req), 'NONE')}---`),

        'a/*': (ctx, req) => `starts with 'a'`,
        '*/b': (ctx, req) => `ends with 'b'`,
        'a/b': (ctx, req) => `starts with 'a' AND ends with 'b'`,

        'c/*': (ctx, req) => `starts with 'c'`,
        '*/d': (ctx, req) => `ends with 'd'`,
        'c/d': (ctx, req) => UNHANDLED,

        'api/... #a': (ctx, req) => `fallback`,
        'api/... #b': (ctx, req) => `fallback`,
        'api/fo*o': (ctx, req) => UNHANDLED,
        'api/fo* #2': meta((ctx, req) => `fo2-(${ifUnhandled(ctx.next(req), 'NONE')})`),
        'api/fo* #1': meta((ctx, req) => `fo1-(${ifUnhandled(ctx.next(req), 'NONE')})`),
        'api/foo ': meta((ctx, req) => `${ifUnhandled(ctx.next(req), 'NONE')}!`),
        'api/foo': (ctx, req) => 'FOO',
        'api/foot': (ctx, req) => 'FOOt',
        'api/fooo': (ctx, req) => 'fooo',
        'api/bar': (ctx, req) => UNHANDLED,

        'zzz/{...rest}': meta((ctx, req) => `${ifUnhandled(ctx.next({address: ctx.rest.split('').reverse().join('')}), 'NONE')}`),
        'zzz/b*z': (ctx, req) => `${req.address}`,
        'zzz/./*': (ctx, req) => 'forty-two'
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


    // Set up the tests.
    let ruleSetHandler = new UnaryMultimethod({
        toDiscriminant: r => r.address,
        rules: ruleSet
    });
    let addresses = tests.map(test => test.split(' ==> ')[0]);
    let requests = addresses.map(address => ({address}));
    let responses = tests.map(test => test.split(' ==> ')[1]);
    responses.forEach((res, i) => { if (res === 'UNHANDLED') responses[i] = <any> UNHANDLED; });


    // Loop over the tests.
    for (let i = 0; i < tests.length; ++i) {
        it(addresses[i], async () => {

            if (addresses[i] === '/quux') {
                debugger;
            }

            let res = ruleSetHandler(requests[i]);
            let actualResponse = await res;
            expect(actualResponse).equals(responses[i]);
        });
    }
});





// TODO: doc helper...
function ifUnhandled(lhs, rhs) {
    return lhs === UNHANDLED ? rhs : lhs;
}
