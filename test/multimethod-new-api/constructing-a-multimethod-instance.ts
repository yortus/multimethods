import {expect} from 'chai';
import {isPromiseLike} from 'multimethods/internals/util';

import {Multimethod, next} from 'multimethods';
// import defaultDiscrininator from 'multimethods/analysis/configuration/default-discriminator';


// TODO: rename these tests in filename and describe()?
// - this is more about invoking the Multimethod, not constructing it...
// TODO: more multimethod tests? for other files?


// TODO: More coverage:
// - [ ] multiple regular methods for same pattern
// - [ ] multiple decorators for same pattern
// - [ ] one decorator and several regular methods for same pattern
// - [ ] decorators along ambiguous paths (same decorators on all paths)
// - [x] decorators along ambiguous paths (not same decorators on all paths) - c/d





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

        // TODO: doc...
        let multimethod = Multimethod({
            discriminator: (r: any) => val(r.address),
            unhandled: () => { throw UNHANDLED; },
        }).extend({
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
            'api/foot': (_, rq) => val(`FOOt${rq.address.length}`),
            'api/fooo': () => val('fooo'),
            'api/bar': () => val(next),

            'zz/z/b*z': (_, rq) => val(`${rq.address}`),
            'zz/z/./*': () => val('forty-two'),

            'CHAIN-{x}': [

                // Return x!x! only if x ends with 'b' , otherwise skip
                ({x}) => val((x!.endsWith('b') ? (x + '!').repeat(2) : next)),

                // Return xxx only if x has length 2, otherwise skip
                ({x}) => val(x!.length === 2 ? x!.repeat(3) : next),

                // Return the string reversed
                ({x}) => val(x!.split('').reverse().join('')),
            ],
        }).decorate({
            '/*a*': (_, method, [rq]) => calc([
                '---',
                calc(() => method(rq), (rs, er) => er === UNHANDLED ? err('no inner method!') : rs),
                '---',
            ], concat),

            'api/fo*': [
                (_, method, [rq]) => calc([
                    'fo2-(',
                    calc(() => method(rq), (rs, er) => er === UNHANDLED ? val('NONE') : rs),
                    ')',
                ], concat),
                (_, method, [rq]) => calc([
                    'fo1-(',
                    calc(() => method(rq), (rs, er) => er === UNHANDLED ? val('NONE') : rs),
                    ')',
                ], concat),
            ],
            'api/foo': [
                (_, method, [rq]) => calc([
                    calc(() => method(rq), (rs, er) => er === UNHANDLED ? val('NONE') : rs),
                    '!',
                ], concat),
                'super' as const,
            ],

            'zz/z/{**rest}'({rest}, method) {
                let moddedReq = {address: rest!.split('').reverse().join('')};
                return calc(() => method(moddedReq), (rs, er) => er === UNHANDLED ? val('NONE') : rs);
            },

            'CHAIN-{x}': [

                // Wrap subsequent results with ()
                (_, method, [rq]) => calc(['(', method(rq), ')'], concat),

                // Block any result that starts with '[32'
                (_, method, [rq]) => calc(method(rq), rs => rs.startsWith('[32') ? err('blocked') : rs),

                // Wrap subsequent results with []
                (_, method, [rq]) => calc(['[', method(rq), ']'], concat),

                'super' as const,
            ],
        });

        let tests = [
            `/foo ==> foo`,
            `/bar ==> ---bar---`,
            `/baz ==> ---baz---`,
            `/quux ==> ERROR: nothing matches!`,
            `quux ==> ERROR: Unhandled`,
            `/qaax ==> ERROR: no inner method!`,
            `/a ==> ERROR: no inner method!`,
            `a ==> ERROR: Unhandled`,
            `/ ==> ERROR: nothing matches!`,
            ` ==> ERROR: Unhandled`,

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
function calc(arg: any, cb: (res: any, err: any) => any) {
    if (typeof arg === 'function') {
        try {
            let res = arg();
            if (!isPromiseLike(res)) return cb(res, null);
            return res.then(res => cb(res, null), err => cb(null, err));
        }
        catch (err) {
            return cb(null, err);
        }
    }
    else if (Array.isArray(arg)) {
        if (!arg.some(isPromiseLike)) return cb(arg, null);
        return Promise.all(arg.map(el => Promise.resolve(el))).then(rs => cb(rs, null));
    }
    else {
        return isPromiseLike(arg) ? arg.then(res => cb(res, null)) : cb(arg, null);
    }
}
function concat(strs: string[]) {
    return strs.join('');
}




// TODO: temp testing...
const UNHANDLED = new Error('Unhandled');
