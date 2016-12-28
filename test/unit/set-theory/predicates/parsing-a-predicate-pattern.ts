import {expect} from 'chai';
import {parsePredicatePattern, PredicateAST} from 'multimethods'; // TODO: these exports are lib internals - expose them differently? eg under util or something like that?


describe('Parsing a predicate pattern', () => {

    let tests = [
        '∅ ==> {signature: "", identifier: "ℙ", captures: [], comment: ""}',
        '/api/foo ==> {signature: "/api/foo", identifier: "ℙﾉapiﾉfoo", captures: [], comment: ""}',
        '/api/foo/BAR ==> {signature: "/api/foo/BAR", identifier: "ℙﾉapiﾉfooﾉBAR", captures: [], comment: ""}',
        '/api/foo… ==> {signature: "/api/foo…", identifier: "ℙﾉapiﾉfoo﹍", captures: ["?"], comment: ""}',
        '/api/foo... ==> {signature: "/api/foo…", identifier: "ℙﾉapiﾉfoo﹍", captures: ["?"], comment: ""}',
        '/api/foo/... ==> {signature: "/api/foo/…", identifier: "ℙﾉapiﾉfooﾉ﹍", captures: ["?"], comment: ""}',
        '/api/foo/{...rest} ==> {signature: "/api/foo/…", identifier: "ℙﾉapiﾉfooﾉ﹍", captures: ["rest"], comment: ""}',
        '/API/f* ==> {signature: "/API/f*", identifier: "ℙﾉAPIﾉfᕽ", captures: ["?"], comment: ""}',
        '/api/{foO}O ==> {signature: "/api/*O", identifier: "ℙﾉapiﾉᕽO", captures: ["foO"], comment: ""}',
        '/…/{name}.{ext} ==> {signature: "/…/*.*", identifier: "ℙﾉ﹍ﾉᕽˌᕽ", captures: ["?", "name", "ext"], comment: ""}',
        '/.../{name}.{ext} ==> {signature: "/…/*.*", identifier: "ℙﾉ﹍ﾉᕽˌᕽ", captures: ["?", "name", "ext"], comment: ""}',
        '/{...aPath}/{name}.{ext} ==> {signature: "/…/*.*", identifier: "ℙﾉ﹍ﾉᕽˌᕽ", captures: ["aPath", "name", "ext"], comment: ""}',
        '/-/./- ==> {signature: "/-/./-", identifier: "ℙﾉￚﾉˌﾉￚ", captures: [], comment: ""}',
        '/foo// ==> {signature: "/foo//", identifier: "ℙﾉfooﾉﾉ", captures: [], comment: ""}',
        '// ==> {signature: "//", identifier: "ℙﾉﾉ", captures: [], comment: ""}',
        '{$} ==> {signature: "*", identifier: "ℙᕽ", captures: ["$"], comment: ""}',
        '{...__} ==> {signature: "…", identifier: "ℙ﹍", captures: ["__"], comment: ""}',
        '.... ==> {signature: "….", identifier: "ℙ﹍ˌ", captures: ["?"], comment: ""}',
        'GET /foo ==> {signature: "GET /foo", identifier: "ℙGETㆍﾉfoo", captures: [], comment: ""}',
        '{method} {...path} ==> {signature: "* …", identifier: "ℙᕽㆍ﹍", captures: ["method", "path"], comment: ""}',
        'GET   /foo ==> {signature: "GET   /foo", identifier: "ℙGETㆍㆍㆍﾉfoo", captures: [], comment: ""}',
        '   GET /foo ==> {signature: "   GET /foo", identifier: "ℙㆍㆍㆍGETㆍﾉfoo", captures: [], comment: ""}',
        '   /    ==> {signature: "   /", identifier: "ℙㆍㆍㆍﾉ", captures: [], comment: ""}',
        '/ ==> {signature: "/", identifier: "ℙﾉ", captures: [], comment: ""}',
        '* ==> {signature: "*", identifier: "ℙᕽ", captures: ["?"], comment: ""}',
        '… ==> {signature: "…", identifier: "ℙ﹍", captures: ["?"], comment: ""}',
        '... ==> {signature: "…", identifier: "ℙ﹍", captures: ["?"], comment: ""}',
        '/*** ==> ERROR',
        '/*… ==> ERROR',
        '/foo/{...rest}* ==> ERROR',
        '/foo/{name}{ext} ==> ERROR',
        '/$foo ==> ERROR',
        '/bar/? ==> ERROR',
        '{} ==> ERROR',
        '{a...} ==> ERROR',
        '{...} ==> ERROR',
        '{..} ==> ERROR',
        '{..a} ==> ERROR',
        '{foo-bar} ==> ERROR',
        '{"foo"} ==> ERROR',
        '{ ==> ERROR',
        '} ==> ERROR',
        '{{} ==> ERROR',
        '{}} ==> ERROR',
    ];

    tests.forEach(test => {
        it(test, () => {
            let pattern = test.split(' ==> ')[0].replace(/^∅$/, '');
            let rhs = test.split(' ==> ')[1];
            let expected: PredicateAST|string = rhs === "ERROR" ? rhs : eval(`(${rhs})`);
            if (typeof expected !== 'string') expected.captureNames = expected.captures.filter(c => c !== '?'); // TODO: temp testing for PredicateClass compat. Add above or otherwise clean up.
            let expectedError = '';// TODO: implement this...
            let actual: PredicateAST|string = 'ERROR';
            try {
                actual = parsePredicatePattern(pattern);
            }
            catch (ex) { }
            expect(actual).to.deep.equal(expected);

            // TODO: temp testing...
            if (typeof actual !== 'string') {
                eval(`(function () { var ${actual.identifier}; })`);
            }

        });
    });
});
