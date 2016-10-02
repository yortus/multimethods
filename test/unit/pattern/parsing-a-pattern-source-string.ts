import {expect} from 'chai';
import {parsePatternSource, PatternAST} from 'multimethods';


describe('Parsing a pattern source string', () => {

    let tests = [
        '∅ ==> {signature: "", identifier: "ℙ", captures: []}',
        '/api/foo ==> {signature: "/api/foo", identifier: "ℙﾉapiﾉfoo", captures: []}',
        '/api/foo/BAR ==> {signature: "/api/foo/BAR", identifier: "ℙﾉapiﾉfooﾉBAR", captures: []}',
        '/api/foo… ==> {signature: "/api/foo…", identifier: "ℙﾉapiﾉfoo﹍", captures: ["?"]}',
        '/api/foo... ==> {signature: "/api/foo…", identifier: "ℙﾉapiﾉfoo﹍", captures: ["?"]}',
        '/api/foo/... ==> {signature: "/api/foo/…", identifier: "ℙﾉapiﾉfooﾉ﹍", captures: ["?"]}',
        '/api/foo/{...rest} ==> {signature: "/api/foo/…", identifier: "ℙﾉapiﾉfooﾉ﹍", captures: ["rest"]}',
        '/API/f* ==> {signature: "/API/f*", identifier: "ℙﾉAPIﾉfᕽ", captures: ["?"]}',
        '/api/{foO}O ==> {signature: "/api/*O", identifier: "ℙﾉapiﾉᕽO", captures: ["foO"]}',
        '/…/{name}.{ext} ==> {signature: "/…/*.*", identifier: "ℙﾉ﹍ﾉᕽˌᕽ", captures: ["?", "name", "ext"]}',
        '/.../{name}.{ext} ==> {signature: "/…/*.*", identifier: "ℙﾉ﹍ﾉᕽˌᕽ", captures: ["?", "name", "ext"]}',
        '/{...aPath}/{name}.{ext} ==> {signature: "/…/*.*", identifier: "ℙﾉ﹍ﾉᕽˌᕽ", captures: ["aPath", "name", "ext"]}',
        '/-/./- ==> {signature: "/-/./-", identifier: "ℙﾉￚﾉˌﾉￚ", captures: []}',
        '/foo// ==> {signature: "/foo//", identifier: "ℙﾉfooﾉﾉ", captures: []}',
        '// ==> {signature: "//", identifier: "ℙﾉﾉ", captures: []}',
        '{$} ==> {signature: "*", identifier: "ℙᕽ", captures: ["$"]}',
        '{...__} ==> {signature: "…", identifier: "ℙ﹍", captures: ["__"]}',
        '.... ==> {signature: "….", identifier: "ℙ﹍ˌ", captures: ["?"]}',
        'GET /foo ==> {signature: "GET /foo", identifier: "ℙGETㆍﾉfoo", captures: []}',
        '{method} {...path} ==> {signature: "* …", identifier: "ℙᕽㆍ﹍", captures: ["method", "path"]}',
        'GET   /foo ==> {signature: "GET   /foo", identifier: "ℙGETㆍㆍㆍﾉfoo", captures: []}',
        '   GET /foo ==> {signature: "   GET /foo", identifier: "ℙㆍㆍㆍGETㆍﾉfoo", captures: []}',
        '   /    ==> {signature: "   /", identifier: "ℙㆍㆍㆍﾉ", captures: []}',
        '/ ==> {signature: "/", identifier: "ℙﾉ", captures: []}',
        '* ==> {signature: "*", identifier: "ℙᕽ", captures: ["?"]}',
        '… ==> {signature: "…", identifier: "ℙ﹍", captures: ["?"]}',
        '... ==> {signature: "…", identifier: "ℙ﹍", captures: ["?"]}',
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
            let patternSource = test.split(' ==> ')[0].replace(/^∅$/, '');
            let rhs = test.split(' ==> ')[1];
            let expected: PatternAST|string = rhs === "ERROR" ? rhs : eval(`(${rhs})`);
            let expectedError = '';// TODO: implement this...
            let actual: PatternAST|string = 'ERROR';
            try {
                actual = parsePatternSource(patternSource);
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
