// TODO: mock the console





import {expect} from 'chai';
import {Multimethod, meta, util} from 'multimethods';
// TODO: rename these tests in filename and describe() ? this is more about invoking the Multimethod, not constructing it...
// TODO: more multimethod tests? for other files?


// TODO: More coverage:
// - [ ] multiple non-decorator handlers for same pattern
// - [ ] multiple decorator handlers for same pattern
// - [ ] one decorator and some non-decorators for same pattern
// - [ ] decorators along ambiguous paths (same decorators on all paths)
// - [x] decorators along ambiguous paths (not same decorators on all paths) - c/d





// TODO: temp testing...
const UNHANDLED: any = {};





describe('Constructing a Multimethod instance', () => {

    let variants = [
        { name: 'all synchronous', val: immediateValue, err: immediateError },
        { name: 'all asynchronous', val: promisedValue, err: promisedError },
        { name: 'randomized sync/async', val: randomValue, err: randomError }
    ];

    variants.forEach(variant => describe(`(${variant.name})`, () => {
        let val = variant.val, err = variant.err;
        let ruleSet = {
            '/...': () => err('nothing matches!'),
            '/foo': () => val('foo'),
            '/bar': () => val('bar'),
            '/baz': () => val('baz'),
            '/*a*': meta(async (rq, _, next) => val(`---${await ifUnhandled(await next(), () => err('no downstream!'))}---`)),

            'a/*': () => val(`starts with 'a'`),
            '*/b': () => val(`ends with 'b'`),
            'a/b': () => val(`starts with 'a' AND ends with 'b'`),

            'c/*': () => val(`starts with 'c'`),
            '*/d': () => err(`don't end with 'd'!`),
            'c/d': () => val(UNHANDLED),

            'api/... #a': () => val(`fallback`),
            'api/... #b': () => val(`fallback`), // TODO: temp testing, remove this...
            'api/fo*o': () => val(UNHANDLED),
            'api/fo* #2': meta(async (rq, _, next) => val(`fo2-(${ifUnhandled(await next(rq), 'NONE')})`)),
            'api/fo* #1': meta(async (rq, _, next) => val(`fo1-(${ifUnhandled(await next(rq), 'NONE')})`)),
            'api/foo ': meta(async (rq, _, next) => val(`${ifUnhandled(await next(rq), 'NONE')}!`)),
            'api/foo': () => val('FOO'),
            'api/foot': () => val('FOOt'),
            'api/fooo': () => val('fooo'),
            'api/bar': () => val(UNHANDLED),

            'zzz/{...rest}': meta(async (rq, {rest}, next) => {
                return val(`${ifUnhandled(await next({address: rest.split('').reverse().join('')}), 'NONE')}`);
            }),
            'zzz/b*z': (rq) => val(`${rq.address}`),
            'zzz/./*': () => val('forty-two')
        };

        let tests = [
            `/foo ==> foo`,
            `/bar ==> ---bar---`,
            `/baz ==> ---baz---`,
            `/quux ==> ERROR: nothing matches!`,
            `quux ==> UNHANDLED`,
            `/qaax ==> ERROR: no downstream!`,
            `/a ==> ERROR: no downstream!`,
            `a ==> UNHANDLED`,
            `/ ==> ERROR: nothing matches!`,
            ` ==> UNHANDLED`,

            `a/foo ==> starts with 'a'`,
            `foo/b ==> ends with 'b'`,
            `a/b ==> starts with 'a' AND ends with 'b'`,

            `c/foo ==> starts with 'c'`,
            `foo/d ==> ERROR: don't end with 'd'!`,
            `c/d ==> ERROR: Multiple possible fallbacks...`,

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

        // TODO: doc...
//        configure({warnings: 'off'});
        let multimethod = new Multimethod({
            toDiscriminant: r => r.address,
            rules: ruleSet,
            unhandled: UNHANDLED
        });
//        configure({warnings: 'default'});

        tests.forEach(test => it(test, async () => {
            let address = test.split(' ==> ')[0];
            let request = {address};
            let expected = test.split(' ==> ')[1];
            if (expected === 'UNHANDLED') expected = <any> UNHANDLED;
            let actual: string;
            try {
                let res = multimethod(request);
                actual = util.isPromiseLike(res) ? await (res) : res;
            }
            catch (ex) {
                actual = 'ERROR: ' + ex.message;
                if (expected.slice(-3) === '...') {
                    actual = actual.slice(0, expected.length - 3) + '...';
                }
            }
            expect(actual).equals(expected);
        }));
    }));
});


// TODO: doc helper...
function ifUnhandled(lhs, rhs) {
    if (lhs !== UNHANDLED) return lhs;
    if (typeof rhs === 'function') rhs = rhs();
    return rhs;
}


// TODO: doc helpers...
function immediateValue(val) {
    return val;
}
function immediateError(msg): any {
    throw new Error(msg);
}


// TODO: doc helpers...
function promisedValue(val) {
    return new Promise(resolve => {
        setTimeout(() => resolve(val), 5);
    });
}
function promisedError(msg) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(msg)), 5);
    });
}


// TODO: doc helpers...
function randomValue(val) {
    let impls = [immediateValue, promisedValue];
    let impl = impls[Math.floor(Math.random() * impls.length)];
    return impl(val);
}
function randomError(msg) {
    let impls = [immediateError, promisedError];
    let impl = impls[Math.floor(Math.random() * impls.length)];
    return impl(msg);
}
