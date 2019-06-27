// import {expect} from 'chai';
// import {NEXT, create as MM, meta} from 'multimethods';
// import isPromiseLike from 'multimethods/util/is-promise-like';
// // TODO: rename these tests in filename and describe()?
// // - this is more about invoking the Multimethod, not constructing it...
// // TODO: more multimethod tests? for other files?


// // TODO: More coverage:
// // - [ ] multiple regular methods for same predicate
// // - [ ] multiple meta-methods for same predicate
// // - [ ] one meta- and several regular methods for same predicate
// // - [ ] meta-methods along ambiguous paths (same meta-methods on all paths)
// // - [x] meta-methods along ambiguous paths (not same meta-methods on all paths) - c/d





// describe('Constructing a Multimethod instance', () => {

//     // TODO: doc helpers...
//     const immediateValue = val => val;
//     const immediateError = msg => { throw new Error(msg); };
//     const promisedValue = val => new Promise(resolve => setTimeout(() => resolve(val), 5));
//     const promisedError = msg => new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), 5));
//     const randomValue = val => (Math.random() >= 0.5 ? immediateValue : promisedValue)(val);
//     const randomError = msg => (Math.random() >= 0.5 ? immediateError : promisedError)(msg);

//     let variants = [
//         { vname: 'all synchronous', async: false, val: immediateValue, err: immediateError },
//         { vname: 'all asynchronous', async: true, val: promisedValue, err: promisedError },
//         { vname: 'randomized sync/async', async: undefined, val: randomValue, err: randomError },
//     ];

//     variants.forEach(({vname, async, val, err}) => describe(`(${vname})`, () => {
//         let methods = {
//             '/**': () => err('nothing matches!'),
//             '/foo': () => val('foo'),
//             '/bar': () => val('bar'),
//             '/baz': () => val('baz'),
//             '/*a*': meta((rq, _, next) => {
//                     return calc([
//                         '---',
//                         calc(next(rq), rs => rs === NEXT ? err('no inner method!') : rs),
//                         '---',
//                     ], concat);
//             }),

//             'a/*': () => val(`starts with 'a'`),
//             '*/b': () => val(`ends with 'b'`),
//             'a/b': () => val(`starts with 'a' AND ends with 'b'`),

//             'c/*': () => val(`starts with 'c'`),
//             '*/d': () => err(`don't end with 'd'!`),
//             'c/d': () => val(NEXT),

//             'api/**': () => val(`fallback`),
//             'api/fo*o': () => val(NEXT),
//             'api/fo*': [
//                 meta((rq, _, next) => {
//                     return calc(['fo2-(', calc(next(rq), rs => rs === NEXT ? val('NONE') : rs), ')'], concat);
//                 }),
//                 meta((rq, _, next) => {
//                     return calc(['fo1-(', calc(next(rq), rs => rs === NEXT ? val('NONE') : rs), ')'], concat);
//                 }),
//             ],
//             'api/foo': [
//                 meta((rq, _, next) => calc([calc(next(rq), rs => rs === NEXT ? val('NONE') : rs), '!'], concat)),
//                 () => val('FOO'),
//             ],
//             'api/foot': rq => val(`FOOt${rq.address.length}`),
//             'api/fooo': () => val('fooo'),
//             'api/bar': () => val(NEXT),

//             'zz/z/{**rest}': meta((_, {rest}, next) => {
//                 let moddedReq = {address: rest.split('').reverse().join('')};
//                 return calc(next(moddedReq), rs => rs === NEXT ? val('NONE') : rs);
//             }),
//             'zz/z/b*z': (rq) => val(`${rq.address}`),
//             'zz/z/./*': () => val('forty-two'),

//             'CHAIN-{x}': [

//                 // Wrap subsequent results with ()
//                 meta((rq, {}, next) => calc(['(', next(rq), ')'], concat)),

//                 // Block any result that starts with '[32'
//                 meta((rq, {}, next) => calc(next(rq), rs => rs.startsWith('[32') ? err('blocked') : rs)),

//                 // Wrap subsequent results with []
//                 meta((rq, {}, next) => calc(['[', next(rq), ']'], concat)),

//                 // Return x!x! only if x ends with 'b' , otherwise skip
//                 (_, {x}) => val(x.endsWith('b') ? (x + '!').repeat(2) : NEXT),

//                 // Return xxx only if x has length 2, otherwise skip
//                 (_, {x}) => val(x.length === 2 ? x.repeat(3) : NEXT),

//                 // Return the string reversed
//                 (_, {x}) => val(x.split('').reverse().join('')),
//             ],
//         };

//         let tests = [
//             `/foo ==> foo`,
//             `/bar ==> ---bar---`,
//             `/baz ==> ---baz---`,
//             `/quux ==> ERROR: nothing matches!`,
//             `quux ==> ERROR: Multimethod dispatch failure...`,
//             `/qaax ==> ERROR: no inner method!`,
//             `/a ==> ERROR: no inner method!`,
//             `a ==> ERROR: Multimethod dispatch failure...`,
//             `/ ==> ERROR: nothing matches!`,
//             ` ==> ERROR: Multimethod dispatch failure...`,

//             `a/foo ==> starts with 'a'`,
//             `foo/b ==> ends with 'b'`,
//             `a/b ==> starts with 'a' AND ends with 'b'`,

//             `c/foo ==> starts with 'c'`,
//             `foo/d ==> ERROR: don't end with 'd'!`,
//             `c/d ==> ERROR: Multiple possible fallbacks...`,

//             `api/ ==> fallback`,
//             `api/foo ==> fo2-(fo1-(FOO!))`,
//             `api/fooo ==> fo2-(fo1-(fooo))`,
//             `api/foooo ==> fo2-(fo1-(NONE))`,
//             `api/foooot ==> fo2-(fo1-(NONE))`,
//             `api/foot ==> fo2-(fo1-(FOOt8))`,
//             `api/bar ==> fallback`,

//             `zz/z/baz ==> zab`,
//             `zz/z/booz ==> zoob`,
//             `zz/z/looz ==> NONE`,
//             `zz/z/./{whatever} ==> forty-two`,

//             `CHAIN-a ==> ([a])`,
//             `CHAIN-ab ==> ([ab!ab!])`,
//             `CHAIN-abc ==> ([cba])`,
//             `CHAIN-1 ==> ([1])`,
//             `CHAIN-12 ==> ([121212])`,
//             `CHAIN-123 ==> ERROR: blocked`,
//             `CHAIN-abc123 ==> ERROR: blocked`,
//             `CHAIN-a1b2c3 ==> ([3c2b1a])`,
//         ];

//         // TODO: doc...
//         let multimethod = MM({
//             arity: 1,
//             discriminator: (r: any) => val(r.address),
//             async,
//             methods,
//         });

//         tests.forEach(test => it(test, async () => {
//             let address = test.split(' ==> ')[0];
//             let request = {address};
//             let expected = test.split(' ==> ')[1];
//             let actual: string;
//             try {
//                 let res = multimethod(request) as string | Promise<string>;
//                 if (async === false) expect(res).to.not.satisfy(isPromiseLike);
//                 if (async === true) expect(res).to.satisfy(isPromiseLike);
//                 actual = isPromiseLike(res) ? await (res) : res;
//             }
//             catch (ex) {
//                 actual = 'ERROR: ' +  ex.message;
//                 if (expected.slice(-3) === '...') {
//                     actual = actual.slice(0, expected.length - 3) + '...';
//                 }
//             }
//             expect(actual).equals(expected);
//         }));
//     }));
// });





// // TODO: doc helpers...
// function calc(arg: any, cb: (arg: any) => any) {
//     if (Array.isArray(arg)) {
//         if (!arg.some(isPromiseLike)) return cb(arg);
//         return Promise.all(arg.map(el => Promise.resolve(el))).then(cb);
//     }
//     return isPromiseLike(arg) ? arg.then(cb) : cb(arg);
// }
// function concat(strs: string[]) {
//     return strs.join('');
// }
