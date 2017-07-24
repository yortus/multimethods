// tslint:disable:no-eval
import {expect} from 'chai';
import {parsePredicateSource, PredicateAST} from 'multimethods/math/predicates';


describe('Parsing a predicate string', () => {

    let tests = [
        '∅ ==> {signature: "", identifier: "", captures: []}',
        '/ ==> {signature: "/", identifier: "Ⳇ", captures: []}',
        '* ==> {signature: "*", identifier: "ӿ", captures: ["?"]}',
        '** ==> {signature: "**", identifier: "ᕯ", captures: ["?"]}',
        '/api/foo ==> {signature: "/api/foo", identifier: "ⳆapiⳆfoo", captures: []}',
        '/api/foo/BAR ==> {signature: "/api/foo/BAR", identifier: "ⳆapiⳆfooⳆBAR", captures: []}',
        '/api/foo** ==> {signature: "/api/foo**", identifier: "ⳆapiⳆfooᕯ", captures: ["?"]}',
        '/api/foo/** ==> {signature: "/api/foo/**", identifier: "ⳆapiⳆfooⳆᕯ", captures: ["?"]}',
        '/api/foo/{**rest} ==> {signature: "/api/foo/**", identifier: "ⳆapiⳆfooⳆᕯ", captures: ["rest"]}',
        '/API/f* ==> {signature: "/API/f*", identifier: "ⳆAPIⳆfӿ", captures: ["?"]}',
        '/api/{foO}O ==> {signature: "/api/*O", identifier: "ⳆapiⳆӿO", captures: ["foO"]}',
        '/**/{name}.{ext} ==> {signature: "/**/*.*", identifier: "ⳆᕯⳆӿˌӿ", captures: ["?", "name", "ext"]}',
        '/{**aPath}/{name}.{ext} ==> {signature: "/**/*.*", identifier: "ⳆᕯⳆӿˌӿ", captures: ["aPath", "name", "ext"]}',
        '/-/./- ==> {signature: "/-/./-", identifier: "ⳆￚⳆˌⳆￚ", captures: []}',
        '/foo// ==> {signature: "/foo//", identifier: "ⳆfooⳆⳆ", captures: []}',
        '// ==> {signature: "//", identifier: "ⳆⳆ", captures: []}',
        '{$} ==> {signature: "*", identifier: "ӿ", captures: ["$"]}',
        '{**__} ==> {signature: "**", identifier: "ᕯ", captures: ["__"]}',
        '**. ==> {signature: "**.", identifier: "ᕯˌ", captures: ["?"]}',
        'GET /foo ==> {signature: "GET /foo", identifier: "GETˑⳆfoo", captures: []}',
        '{method} {**path} ==> {signature: "* **", identifier: "ӿˑᕯ", captures: ["method", "path"]}',
        'GET   /foo ==> {signature: "GET   /foo", identifier: "GETˑˑˑⳆfoo", captures: []}',
        '   GET /foo ==> {signature: "   GET /foo", identifier: "ˑˑˑGETˑⳆfoo", captures: []}',
        '   /    ==> {signature: "   /   ", identifier: "ˑˑˑⳆˑˑˑ", captures: []}',
        'ᕯ ==> ERROR',
        '/*** ==> ERROR',
        '/foo/{**rest}* ==> ERROR',
        '/foo/{name}{ext} ==> ERROR',
        '/$foo ==> ERROR',
        '/bar/? ==> ERROR',
        '{} ==> ERROR',
        '{a**} ==> ERROR',
        '{**} ==> ERROR',
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
            let source = test.split(' ==> ')[0].replace(/^∅$/, '');
            let rhs = test.split(' ==> ')[1];
            let expected: PredicateAST|string = rhs === 'ERROR' ? rhs : eval(`(${rhs})`);
            if (typeof expected !== 'string') expected.captureNames = expected.captures.filter(c => c !== '?');
            let actual: PredicateAST|string;
            try {
                actual = parsePredicateSource(source);
            }
            catch (ex) {
                actual = 'ERROR';
            }
            expect(actual).to.deep.equal(expected);
        });
    });
});
