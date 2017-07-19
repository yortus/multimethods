import {expect} from 'chai';
import {parsePredicateSource, PredicateAST} from 'multimethods/math/predicates';


describe('Parsing a predicate string', () => {

    let tests = [
        '∅ ==> {signature: "", identifier: "", captures: []}',
        '/api/foo ==> {signature: "/api/foo", identifier: "ⳆapiⳆfoo", captures: []}',
        '/api/foo/BAR ==> {signature: "/api/foo/BAR", identifier: "ⳆapiⳆfooⳆBAR", captures: []}',
        '/api/foo… ==> {signature: "/api/foo…", identifier: "ⳆapiⳆfoo﹍", captures: ["?"]}',
        '/api/foo... ==> {signature: "/api/foo…", identifier: "ⳆapiⳆfoo﹍", captures: ["?"]}',
        '/api/foo/... ==> {signature: "/api/foo/…", identifier: "ⳆapiⳆfooⳆ﹍", captures: ["?"]}',
        '/api/foo/{...rest} ==> {signature: "/api/foo/…", identifier: "ⳆapiⳆfooⳆ﹍", captures: ["rest"]}',
        '/API/f* ==> {signature: "/API/f*", identifier: "ⳆAPIⳆfӿ", captures: ["?"]}',
        '/api/{foO}O ==> {signature: "/api/*O", identifier: "ⳆapiⳆӿO", captures: ["foO"]}',
        '/…/{name}.{ext} ==> {signature: "/…/*.*", identifier: "Ⳇ﹍Ⳇӿˌӿ", captures: ["?", "name", "ext"]}',
        '/.../{name}.{ext} ==> {signature: "/…/*.*", identifier: "Ⳇ﹍Ⳇӿˌӿ", captures: ["?", "name", "ext"]}',
        '/{...aPath}/{name}.{ext} ==> {signature: "/…/*.*", identifier: "Ⳇ﹍Ⳇӿˌӿ", captures: ["aPath", "name", "ext"]}',
        '/-/./- ==> {signature: "/-/./-", identifier: "ⳆￚⳆˌⳆￚ", captures: []}',
        '/foo// ==> {signature: "/foo//", identifier: "ⳆfooⳆⳆ", captures: []}',
        '// ==> {signature: "//", identifier: "ⳆⳆ", captures: []}',
        '{$} ==> {signature: "*", identifier: "ӿ", captures: ["$"]}',
        '{...__} ==> {signature: "…", identifier: "﹍", captures: ["__"]}',
        '.... ==> {signature: "….", identifier: "﹍ˌ", captures: ["?"]}',
        'GET /foo ==> {signature: "GET /foo", identifier: "GETˑⳆfoo", captures: []}',
        '{method} {...path} ==> {signature: "* …", identifier: "ӿˑ﹍", captures: ["method", "path"]}',
        'GET   /foo ==> {signature: "GET   /foo", identifier: "GETˑˑˑⳆfoo", captures: []}',
        '   GET /foo ==> {signature: "   GET /foo", identifier: "ˑˑˑGETˑⳆfoo", captures: []}',
        '   /    ==> {signature: "   /   ", identifier: "ˑˑˑⳆˑˑˑ", captures: []}',
        '/ ==> {signature: "/", identifier: "Ⳇ", captures: []}',
        '* ==> {signature: "*", identifier: "ӿ", captures: ["?"]}',
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
            //let expectedError = '';// TODO: implement this...
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
