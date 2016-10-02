// TODO: remove these tests...



// import {expect} from 'chai';
// import {util} from 'multimethods';


// describe(`Identifying a function's formal parameters`, () => {

//     let tests = [
//         `function () {} ==> `,
//         `function (a) {} ==> a`,
//         `function (foo,    bar,baz) {} ==> foo,bar,baz`,
//         `function (aAA, bBb) {} ==> aAA,bBb`,
//         `function fn() {} ==> `,
//         `function fn(a) {} ==> a`,
//         `function fn(foo,    bar,baz) {} ==> foo,bar,baz`,
//         `function fn(aAA, bBb) {} ==> aAA,bBb`,
//         `[REST_PARAMS] function (aAA, bBb, ...rest) {} ==> aAA,bBb`,
//         `function \n\n\n   (   foo\n, bar/*,baz*/) {} ==> foo,bar`,
//         `function (foo) { return function (bar) {}; } ==> foo`,
//         `[DEFAULT_PARAMS] function (foo = 'foo', bar) {} ==> ERROR: getFunctionParameters...`,
//         `[DEFAULT_PARAMS] function (foo='foo', bar     =      99) {} ==> ERROR: getFunctionParameters...`,
//         `[DEFAULT_PARAMS] function (foo = 'foo', bar = 99) {} ==> ERROR: getFunctionParameters...`,
//         `[DEFAULT_PARAMS] function (foo, bar = {foo:'bar'}) {} ==> ERROR: getFunctionParameters...`,
//         `[DESTUCTURING] function loop({ start=0, end=-1, step=1 }) {} ==> ERROR: getFunctionParameters...`,
//         `() => {} ==> `,
//         `() => null ==> `,
//         `(a) => {} ==> a`,
//         `(a) => Date ==> a`,
//         `foo => {} ==> foo`,
//         `foo => Date ==> foo`,
//         `(foo,    bar,baz) => {} ==> foo,bar,baz`,
//         `(aAA, bBb) => {} ==> aAA,bBb`,
//         `[REST_PARAMS] (aAA, bBb, ...rest) => {} ==> aAA,bBb`,
//         `(\n   foo\n, bar/*,baz*/) => {} ==> foo,bar`,
//         `(foo) => { return function (bar) {}; } ==> foo`,
//         `Date => { return function (bar) {}; } ==> Date`,
//         `foo => bar => null ==> foo`,
//         `[DEFAULT_PARAMS] (foo = 'foo', bar) => {} ==> ERROR: getFunctionParameters...`,
//         `[DEFAULT_PARAMS] (foo='foo', bar     =      99) => {} ==> ERROR: getFunctionParameters...`,
//         `[DEFAULT_PARAMS] (foo = 'foo', bar = 99) => {} ==> ERROR: getFunctionParameters...`,
//         `[DEFAULT_PARAMS] (foo, bar = {foo:'bar'}) => {} ==> ERROR: getFunctionParameters...`,
//         `[DESTUCTURING] ({ start=0, end=-1, step=1 }) => {} ==> ERROR: getFunctionParameters...`,
//         `function* () {} ==> `,
//         `function* (a) {} ==> a`,
//         `function  * (foo,    bar,baz) {} ==> foo,bar,baz`,
//         `function* (aAA, bBb) {} ==> aAA,bBb`,
//         `function *fn() {} ==> `,
//         `function  *fn(a) {} ==> a`,
//         `function* fn(foo,    bar,baz) {} ==> foo,bar,baz`,
//         `function * fn(aAA, bBb) {} ==> aAA,bBb`,
//         `[ASYNC] async function fn(foo,   bar) {} ==> foo,bar`,
//         `[ASYNC_ARROW] async (foo,   bar) => {} ==> foo,bar`
//     ];

//     // Detect runtime support for ES6/ES7 features. Disable tests that target unsupported features.
//     let has = {REST_PARAMS: true, DEFAULT_PARAMS: true, DESTUCTURING: true, ASYNC: true, ASYNC_ARROW: true};
//     try { eval(`(function (...rest) {})`); } catch (ex) { has.REST_PARAMS = false; }
//     try { eval(`(function (foo = 'foo') {})`); } catch (ex) { has.DEFAULT_PARAMS = false; }
//     try { eval(`(function ({ x=1, y=2 }) {})`); } catch (ex) { has.DESTUCTURING = false; }
//     try { eval(`(async function (foo) {})`); } catch (ex) { has.ASYNC = false; }
//     try { eval(`(async (foo) => {})`); } catch (ex) { has.ASYNC_ARROW = false; }
//     tests = tests
//         .map(test => test.split('] ').map(s => s.replace(/^\[/, '')))
//         .filter(parts => parts.length === 1 || has[parts[0]])
//         .map(parts => parts[parts.length - 1]);

//     tests.forEach(test => {
//         it(JSON.stringify(test).slice(1, -1), () => {
//             let funcSource = test.split(' ==> ')[0];
//             let rhs = test.split(' ==> ')[1];
//             let actualParamNames, expectedParamNames;
//             try {
//                 let func = eval(`(${funcSource})`);
//                 actualParamNames = util.getFunctionParameterNames(func);
//                 expectedParamNames = rhs ? rhs.split(',') : [];
//             }
//             catch (ex) {
//                 actualParamNames = 'ERROR: ' + ex.message;
//                 expectedParamNames = rhs;
//                 if (expectedParamNames.slice(-3) === '...') {
//                     actualParamNames = actualParamNames.slice(0, expectedParamNames.length - 3) + '...';
//                 }
//             }
//             expect(actualParamNames).deep.equal(expectedParamNames);
//         });
//     });
// });
