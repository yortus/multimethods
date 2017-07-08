import {expect} from 'chai';
import {parsePredicateSource, PredicateAST} from 'multimethods'; // TODO: these exports are lib internals - expose them differently? eg under util or something like that?


describe('Parsing a predicate string', () => {

    let tests = [
        '∅ ==> {signature: "", identifier: "", captures: []}',
        '/api/foo ==> {signature: "/api/foo", identifier: "ⳆapiⳆfoo", captures: []}',
        '/api/foo/BAR ==> {signature: "/api/foo/BAR", identifier: "ⳆapiⳆfooⳆBAR", captures: []}',
        '/api/foo… ==> {signature: "/api/foo…", identifier: "ⳆapiⳆfoo﹍", captures: ["?"]}',
        '/api/foo... ==> {signature: "/api/foo…", identifier: "ⳆapiⳆfoo﹍", captures: ["?"]}',
        '/api/foo/... ==> {signature: "/api/foo/…", identifier: "ⳆapiⳆfooⳆ﹍", captures: ["?"]}',
        '/api/foo/{...rest} ==> {signature: "/api/foo/…", identifier: "ⳆapiⳆfooⳆ﹍", captures: ["rest"]}',
        '/API/f* ==> {signature: "/API/f*", identifier: "ⳆAPIⳆfᕽ", captures: ["?"]}',
        '/api/{foO}O ==> {signature: "/api/*O", identifier: "ⳆapiⳆᕽO", captures: ["foO"]}',
        '/…/{name}.{ext} ==> {signature: "/…/*.*", identifier: "Ⳇ﹍Ⳇᕽˌᕽ", captures: ["?", "name", "ext"]}',
        '/.../{name}.{ext} ==> {signature: "/…/*.*", identifier: "Ⳇ﹍Ⳇᕽˌᕽ", captures: ["?", "name", "ext"]}',
        '/{...aPath}/{name}.{ext} ==> {signature: "/…/*.*", identifier: "Ⳇ﹍Ⳇᕽˌᕽ", captures: ["aPath", "name", "ext"]}',
        '/-/./- ==> {signature: "/-/./-", identifier: "ⳆￚⳆˌⳆￚ", captures: []}',
        '/foo// ==> {signature: "/foo//", identifier: "ⳆfooⳆⳆ", captures: []}',
        '// ==> {signature: "//", identifier: "ⳆⳆ", captures: []}',
        '{$} ==> {signature: "*", identifier: "ᕽ", captures: ["$"]}',
        '{...__} ==> {signature: "…", identifier: "﹍", captures: ["__"]}',
        '.... ==> {signature: "….", identifier: "﹍ˌ", captures: ["?"]}',
        'GET /foo ==> {signature: "GET /foo", identifier: "GETㆍⳆfoo", captures: []}',
        '{method} {...path} ==> {signature: "* …", identifier: "ᕽㆍ﹍", captures: ["method", "path"]}',
        'GET   /foo ==> {signature: "GET   /foo", identifier: "GETㆍㆍㆍⳆfoo", captures: []}',
        '   GET /foo ==> {signature: "   GET /foo", identifier: "ㆍㆍㆍGETㆍⳆfoo", captures: []}',
        '   /    ==> {signature: "   /   ", identifier: "ㆍㆍㆍⳆㆍㆍㆍ", captures: []}',
        '/ ==> {signature: "/", identifier: "Ⳇ", captures: []}',
        '* ==> {signature: "*", identifier: "ᕽ", captures: ["?"]}',
        '… ==> {signature: "…", identifier: "﹍", captures: ["?"]}',
        '... ==> {signature: "…", identifier: "﹍", captures: ["?"]}',
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
                actual = parsePredicateSource(pattern);
            }
            catch (ex) { }
            expect(actual).to.deep.equal(expected);

            // TODO: temp testing...
            if (typeof actual !== 'string') {
                eval(`(function () { var ℙ${actual.identifier}; })`);
            }

        });
    });
});
