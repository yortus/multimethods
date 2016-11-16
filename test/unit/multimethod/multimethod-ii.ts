import {expect} from 'chai';
import {Multimethod, UnaryMultimethod, BinaryMultimethod, TernaryMultimethod, VariadicMultimethod, meta} from 'multimethods';





// TODO: ...
describe('MULTIMETHOD II: Constructing a Multimethod instance', () => {

    // TODO: temp testing...
    const UNHANDLED: any = {};    


    // Declare the test rule set.
    const ruleSet = {
        '/foo': () => 'foo',
        '/bar': () => 'bar',
        '/baz': () => 'baz',
        '/*a*': meta(({next}, req) => `---${ifUnhandled(next(req), 'NONE')}---`),

        'a/*': () => `starts with 'a'`,
        '*/b': () => `ends with 'b'`,
        'a/b': () => `starts with 'a' AND ends with 'b'`,

        'c/*': () => `starts with 'c'`,
        '*/d': () => `ends with 'd'`,
        'c/d': () => UNHANDLED,

        'api/... #a': (_, req) => `fallback`,
        'api/... #b': (_, req) => `fallback`,
        'api/fo*o': (_, req) => UNHANDLED,
        'api/fo* #2': meta(({next}, req) => `fo2-(${ifUnhandled(next(req), 'NONE')})`),
        'api/fo* #1': meta(({next}, req) => `fo1-(${ifUnhandled(next(req), 'NONE')})`),
        'api/foo ': meta((ctx, req) => `${ifUnhandled(ctx.next(req), 'NONE')}!`),
        'api/foo': () => 'FOO',
        'api/foot': () => 'FOOt',
        'api/fooo': () => 'fooo',
        'api/bar': () => UNHANDLED,

        'zzz/{...rest}': meta(({next, rest}, req) => `${ifUnhandled(next({address: rest.split('').reverse().join('')}), 'NONE')}`),
        'zzz/b*z': (_, req) => `${req.address}`,
        'zzz/./*': (_, req) => 'forty-two'
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
    let mm = new UnaryMultimethod({
        toDiscriminant: r => r.address,
        rules: ruleSet,
        unhandled: UNHANDLED
    });
    let addresses = tests.map(test => test.split(' ==> ')[0]);
    let requests = addresses.map(address => ({address}));
    let responses = tests.map(test => test.split(' ==> ')[1]);
    responses.forEach((res, i) => { if (res === 'UNHANDLED') responses[i] = UNHANDLED; });


    // Loop over the tests.
    for (let i = 0; i < tests.length; ++i) {
        it(addresses[i], async () => {
            let res = mm(requests[i]);
            let actualResponse = await res;
            expect(actualResponse).equals(responses[i]);
        });
    }





    // TODO: doc helper...
    function ifUnhandled(lhs, rhs) {
        return lhs === UNHANDLED ? rhs : lhs;
    }
});





