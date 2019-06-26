import {expect} from 'chai';
import isPromiseLike from 'multimethods/util/is-promise-like';

import {Multimethod, next} from 'multimethods';
// import defaultDiscrininator from 'multimethods/analysis/configuration/default-discriminator';


// TODO: rename these tests in filename and describe()?
// - this is more about invoking the Multimethod, not constructing it...
// TODO: more multimethod tests? for other files?


// TODO: More coverage:
// - [ ] multiple regular methods for same predicate
// - [ ] multiple meta-methods for same predicate
// - [ ] one meta- and several regular methods for same predicate
// - [ ] meta-methods along ambiguous paths (same meta-methods on all paths)
// - [x] meta-methods along ambiguous paths (not same meta-methods on all paths) - c/d





describe('Constructing a Multimethod instance', () => {

    // TODO: doc helpers...
    const immediateValue = val => val;
    const immediateError = msg => { throw new Error(msg); };
    const promisedValue = val => new Promise(resolve => setTimeout(() => resolve(val), 5));
    const promisedError = msg => new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), 5));
    const randomValue = val => (Math.random() >= 0.5 ? immediateValue : promisedValue)(val);
    const randomError = msg => (Math.random() >= 0.5 ? immediateError : promisedError)(msg);

    let variants = [
        { vname: 'all synchronous', async: false, val: immediateValue, err: immediateError },
        { vname: 'all asynchronous', async: true, val: promisedValue, err: promisedError },
        { vname: 'randomized sync/async', async: undefined, val: randomValue, err: randomError },
    ];

    variants.forEach(({vname, async, val, err}) => describe(`(${vname})`, () => {
        let methods = {
            '/**': () => err('nothing matches!'),
            '/foo': () => val('foo'),
            '/bar': () => val('bar'),
            '/baz': () => val('baz'),

            'a/*': () => val(`starts with 'a'`),
            '*/b': () => val(`ends with 'b'`),
            'a/b': () => val(`starts with 'a' AND ends with 'b'`),

            'c/*': () => val(`starts with 'c'`),
            '*/d': () => err(`don't end with 'd'!`),
            'c/d': () => val(next),

            'api/**': () => val(`fallback`),
            'api/fo*o': () => val(next),
            'api/foo': [
                () => val('FOO'),
            ],
            'api/foot': rq => val(`FOOt${rq.address.length}`),
            'api/fooo': () => val('fooo'),
            'api/bar': () => val(next),

            'zz/z/b*z': (rq) => val(`${rq.address}`),
            'zz/z/./*': () => val('forty-two'),

            'CHAIN-{x}': [

                // Return x!x! only if x ends with 'b' , otherwise skip
                function () { return val((this.pattern.x.endsWith('b') ? (this.pattern.x + '!').repeat(2) : next)); },

                // Return xxx only if x has length 2, otherwise skip
                function () { return val(this.pattern.x.length === 2 ? this.pattern.x.repeat(3) : next); },

                // Return the string reversed
                function () { return val(this.pattern.x.split('').reverse().join('')); },
            ] as Array<(this: any) => any>,
        };

        let decorators = {
            '/*a*': (m, [rq]) => {
                    return calc([
                        '---',
                        calc(m(rq), rs => rs === next ? err('no downstream!') : rs),
                        '---',
                    ], concat);
            },

            'api/fo*': [
                (m, [rq]) => {
                    return calc(['fo2-(', calc(m(rq), rs => rs === next ? val('NONE') : rs), ')'], concat);
                },
                (m, [rq]) => {
                    return calc(['fo1-(', calc(m(rq), rs => rs === next ? val('NONE') : rs), ')'], concat);
                },
            ],
            'api/foo': [
                (m, [rq]) => calc([calc(m(rq), rs => rs === next ? val('NONE') : rs), '!'], concat),
                'super' as const,
            ],

            'zz/z/{**rest}': (m, _, {pattern}) => {
                let moddedReq = {address: pattern.rest.split('').reverse().join('')};
                return calc(m(moddedReq), rs => rs === next ? val('NONE') : rs);
            },

            'CHAIN-{x}': [

                // Wrap subsequent results with ()
                (m, [rq]) => calc(['(', m(rq), ')'], concat),

                // Block any result that starts with '[32'
                (m, [rq]) => calc(m(rq), rs => rs.startsWith('[32') ? err('blocked') : rs),

                // Wrap subsequent results with []
                (m, [rq]) => calc(['[', m(rq), ']'], concat),

                'super' as const,
            ],
        };

        let tests = [
            `/foo ==> foo`,
            `/bar ==> ---bar---`,
            `/baz ==> ---baz---`,
            `/quux ==> ERROR: nothing matches!`,
            `quux ==> ERROR: Multimethod dispatch failure...`,
            `/qaax ==> ERROR: no downstream!`,
            `/a ==> ERROR: no downstream!`,
            `a ==> ERROR: Multimethod dispatch failure...`,
            `/ ==> ERROR: nothing matches!`,
            ` ==> ERROR: Multimethod dispatch failure...`,

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
            `api/foot ==> fo2-(fo1-(FOOt8))`,
            `api/bar ==> fallback`,

            `zz/z/baz ==> zab`,
            `zz/z/booz ==> zoob`,
            `zz/z/looz ==> NONE`,
            `zz/z/./{whatever} ==> forty-two`,

            `CHAIN-a ==> ([a])`,
            `CHAIN-ab ==> ([ab!ab!])`,
            `CHAIN-abc ==> ([cba])`,
            `CHAIN-1 ==> ([1])`,
            `CHAIN-12 ==> ([121212])`,
            `CHAIN-123 ==> ERROR: blocked`,
            `CHAIN-abc123 ==> ERROR: blocked`,
            `CHAIN-a1b2c3 ==> ([3c2b1a])`,
        ];

        // TODO: doc...
        let multimethod = Multimethod((r: any) => val(r.address)).extend(methods).decorate(decorators);

        tests.forEach(test => it(test, async () => {
            let address = test.split(' ==> ')[0];
            let request = {address};
            let expected = test.split(' ==> ')[1];
            let actual: string;
            try {
                let res = multimethod(request) as string | Promise<string>;
                if (async === false) expect(res).to.not.satisfy(isPromiseLike);
                if (async === true) expect(res).to.satisfy(isPromiseLike);
                actual = isPromiseLike(res) ? await (res) : res;
            }
            catch (ex) {
                actual = 'ERROR: ' +  ex.message;
                if (expected.slice(-3) === '...') {
                    actual = actual.slice(0, expected.length - 3) + '...';
                }
            }
            expect(actual).equals(expected);
        }));
    }));
});





// TODO: doc helpers...
function calc(arg: any, cb: (arg: any) => any) {
    if (Array.isArray(arg)) {
        if (!arg.some(isPromiseLike)) return cb(arg);
        return Promise.all(arg.map(el => Promise.resolve(el))).then(cb);
    }
    return isPromiseLike(arg) ? arg.then(cb) : cb(arg);
}
function concat(strs: string[]) {
    return strs.join('');
}
