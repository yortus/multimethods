import {expect} from 'chai';
import {Method, configure} from 'multimethods';





// TODO: add some asynchronous cases (with results, null, errors)...

// TODO: revise existing tests, remove redundant ones...
// TODO add:
// - function foo() {}
// - async function foo() {}
// async () => {}
// async req => {}
// (a = 'default') => {}
// (_, []) => {}
// (...args) => {}


describe('Constructing a Method instance', () => {

    // TODO: temp testing... copypasta with constructing-a-multimethod-instance.ts
    before(() => configure({warnings: 'throw'}));
    after(() => configure({warnings: 'default'}));

    let tests = [
        `/api/{...rest}: ${(_, {rest}) => {}} ==> OK`,
        `/api/{...rest}: ${(req, {rest}) => {}} ==> OK`,
        `/api/…: ${() => {}} ==> OK`,

        `/api/{...rest}: ${() => {}} ==> ERROR: Expected consequent function to declare at least two parameters...`,
        `/api/{...rest}: ${(_, __) => {}} ==> OK`,
        `/api/{...rest}: ${(_, {}) => {}} ==> ERROR: Consequent is missing parameter(s) for capture(s) 'rest'...`,

        `/api/…: ${(req, {rest}) => {}} ==> ERROR: Consequent has excess parameter(s) 'rest'...`,
        `/foo/{...path}/{name}.{ext}: ${(req, oops, {rest}) => {}} ==> OK/decorator`,

        `/foo/{...path}/{name}.{ext}: ${(_, {req, rest}) => {}} ==> ERROR: Consequent is missing parameter(s) for capture(s) 'path'...`,
        `/foo/{...path}/{name}.{ext}: ${(_, {req, path, name, ext}) => {}} ==> ERROR: Consequent has excess parameter(s) 'req'...`,

        `/api/{...$req}: ${($req, {path, ext, name}) => {}} ==> ERROR: Consequent is missing parameter(s) for capture(s) '$req'...`,
        `/api/{...$req}: ${(_, {path, ext, req, name}) => {}} ==> ERROR: Consequent is missing parameter(s) for capture(s) '$req'...`,

        `/api/{...rest}: ${($req, {rest}, $next) => {}} ==> OK/decorator`,
        `/api/{...rest}: ${(_, {rest}, $next) => {}} ==> OK/decorator`,
        `/api/{...rest} #2: ${(_, {rest}, $next) => {}} ==> OK/decorator`,
        `/api/{...rest} #1000: ${(_, {rest}, $next) => {}} ==> OK/decorator`,
        `/api/{...rest} #comment: ${(_, {rest}, $next) => {}} ==> OK/decorator`,
        `#/api/{...rest}: ${(_, {rest}, $next) => {}} ==> ERROR: Consequent has excess parameter(s) 'rest'...`,
        `/api/{...rest} # 2 0 abc   : ${(_, {rest}, $next) => {}} ==> OK/decorator`,

        `/api/x # was... /{...rest}: ${(_, {}) => {}} ==> OK`,
        `/api/x # was... /{...rest}: ${(_, {rest}) => {}} ==> ERROR: Consequent has excess parameter(s) 'rest'...`,
    ];

    let testsOLD = [
        {
            pattern: '/api/x # was... /{...rest}',
            handler: () => {},
            isDecorator: false,
            error: null
        },
    ];

    tests.forEach(test => {
        it(test, function () {

            let [ruleText, expected] = test.split(' ==> ');
            let [patternSource, consequentSource] = ruleText.split(': ');
            let expectedIsDecorator = expected === 'OK/decorator';
            let expectedError = expected.startsWith('ERROR') ? expected : '';
            let consequent = eval('(' + consequentSource + ')');
            let actualIsDecorator = consequent.length >= 3;
            let actualError = '';
            let method: Method;
            try {
                method = new Method(patternSource, consequent);
            }
            catch (ex) {
                actualError = 'ERROR: ' + ex.message;
                if (expectedError && expectedError.slice(-3) === '...') {
                    actualError = actualError.slice(0, expectedError.length - 3) + '...';
                }
            }
            if (expectedError || actualError) {
                expect(actualError).equals(expectedError);
            }
            else {
                expect(method.predicate.toString()).equals(patternSource);
                expect(method.consequent).equals(consequent);
                expect(actualIsDecorator).equals(expectedIsDecorator);
            }
        });
    });
});
