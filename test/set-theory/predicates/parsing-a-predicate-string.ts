// tslint:disable:no-eval
import {expect} from 'chai';
import {parsePredicateSource, PredicateAST} from 'multimethods/math/predicates';





describe('Parsing a predicate string', () => {

    let tests = [

        // Simple predicates consisting of valid characters:
        'abcdefghijklm ==> {signature: "abcdefghijklm", identifier: "abcdefghijklm", captures: []}',
        'nopqrstuvwxyz ==> {signature: "nopqrstuvwxyz", identifier: "nopqrstuvwxyz", captures: []}',
        'ABCDEFGHIJKLM ==> {signature: "ABCDEFGHIJKLM", identifier: "ABCDEFGHIJKLM", captures: []}',
        'NOPQRSTUVWXYZ ==> {signature: "NOPQRSTUVWXYZ", identifier: "NOPQRSTUVWXYZ", captures: []}',
        '0123456789 ==> {signature: "0123456789", identifier: "0123456789", captures: []}',
        ' /-.:<>@ ==> {signature: " /-.:<>@", identifier: "ˑⳆￚˌːᐸᐳဇ", captures: []}',

        // All other characters should be invalid.... Test all keyboard symbols explicitly:
        '` ==> ERROR',
        '~ ==> ERROR',
        '! ==> ERROR',
        '# ==> ERROR',
        '$ ==> ERROR',
        '% ==> ERROR',
        '^ ==> ERROR',
        '& ==> ERROR',
        '( ==> ERROR',
        ') ==> ERROR',
        '= ==> ERROR',
        '+ ==> ERROR',
        '[ ==> ERROR',
        '] ==> ERROR',
        '\\ ==> ERROR',
        '; ==> ERROR',
        `' ==> ERROR`,
        '" ==> ERROR',
        ', ==> ERROR',
        '? ==> ERROR',

        // All other characters should be invalid.... Sanity-check with a few random unicode characters:
        'ᕯ ==> ERROR',
        'á ==> ERROR',
        'ß ==> ERROR',
        'δ ==> ERROR',
        'ᵀ ==> ERROR',
        'औ ==> ERROR',
        'ݵ ==> ERROR',
        'Ϳ ==> ERROR',
        '𝟜 ==> ERROR',
        'Ⅳ ==> ERROR',
        '﹍ ==> ERROR',
        '§ ==> ERROR',
        '∫ ==> ERROR',
        '© ==> ERROR',

        // More complex valid predicates:
        ' ==> {signature: "", identifier: "", captures: []}', // NB: empty predicate
        '∅ ==> {signature: "∅", identifier: "Ø", captures: []}',
        '/ ==> {signature: "/", identifier: "Ⳇ", captures: []}',
        '* ==> {signature: "*", identifier: "ӿ", captures: ["?"]}',
        '** ==> {signature: "**", identifier: "ᕯ", captures: ["?"]}',
        'a|b ==> {signature: "a|b", identifier: "aǀb", captures: []}',
        '/api/foo ==> {signature: "/api/foo", identifier: "ⳆapiⳆfoo", captures: []}',
        '/api/foo/BAR ==> {signature: "/api/foo/BAR", identifier: "ⳆapiⳆfooⳆBAR", captures: []}',
        '/api/foo** ==> {signature: "/api/foo**", identifier: "ⳆapiⳆfooᕯ", captures: ["?"]}',
        '/api/foo/** ==> {signature: "/api/foo/**", identifier: "ⳆapiⳆfooⳆᕯ", captures: ["?"]}',
        '/api/foo/{**rest} ==> {signature: "/api/foo/**", identifier: "ⳆapiⳆfooⳆᕯ", captures: ["rest"]}',
        '/API/f* ==> {signature: "/API/f*", identifier: "ⳆAPIⳆfӿ", captures: ["?"]}',
        '/api/{foO}O ==> {signature: "/api/*O", identifier: "ⳆapiⳆӿO", captures: ["foO"]}',

        'foo*|*oops ==> {signature: "*oops|foo*", identifier: "ӿoopsǀfooӿ", captures: ["?", "?"]}',
        '*|aaa ==> {signature: "*", identifier: "ӿ", captures: ["?"]}',
        '| ==> {signature: "", identifier: "", captures: []}', // NB: two empty alternatives
        'abc|def ==> {signature: "abc|def", identifier: "abcǀdef", captures: []}',
        'def|abc ==> {signature: "abc|def", identifier: "abcǀdef", captures: []}',
        'def|abc|DEF|123 ==> {signature: "123|DEF|abc|def", identifier: "123ǀDEFǀabcǀdef", captures: []}',
        'foo*/bar|fo**/*z ==> {signature: "fo**/*z|foo*/bar", identifier: "foᕯⳆӿzǀfooӿⳆbar", captures: ["?","?","?"]}',
        'abc|abc ==> {signature: "abc", identifier: "abc", captures: []}',
        '*|* ==> {signature: "*", identifier: "ӿ", captures: ["?"]}',
        '**|** ==> {signature: "**", identifier: "ᕯ", captures: ["?"]}',
        '*|*|* ==> {signature: "*", identifier: "ӿ", captures: ["?"]}',
        '**|*|** ==> {signature: "**", identifier: "ᕯ", captures: ["?"]}',
        'a*|a*|B* ==> {signature: "B*|a*", identifier: "Bӿǀaӿ", captures: ["?", "?"]}',
        'a*|abc*d|aa* ==> {signature: "a*", identifier: "aӿ", captures: ["?"]}',
        'a*|*a ==> {signature: "*a|a*", identifier: "ӿaǀaӿ", captures: ["?", "?"]}',
        'foo*/bar|fo**/* ==> {signature: "fo**/*", identifier: "foᕯⳆӿ", captures: ["?", "?"]}',

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

        // Invalid predicates:
        '/∅ ==> ERROR',                 // Can't combine ∅ with anything else
        '∅|abc ==> ERROR',              // "    "
        '/*** ==> ERROR',               // Can't have adjacent wildcards/globstars
        '/foo/{**rest}* ==> ERROR',     // "    "
        '/foo/{name}{ext} ==> ERROR',   // "    "
        '/$foo ==> ERROR',              // Invalid char in predicate
        '/bar/? ==> ERROR',             // "    "
        '{} ==> ERROR',                 // malformed named capture
        '{a**} ==> ERROR',              // "    "
        '{**} ==> ERROR',               // "    "
        '{..} ==> ERROR',               // "    "
        '{..a} ==> ERROR',              // "    "
        '{foo-bar} ==> ERROR',          // "    "
        '{"foo"} ==> ERROR',            // "    "
        '{ ==> ERROR',                  // "    "
        '} ==> ERROR',                  // "    "
        '{{} ==> ERROR',                // "    "
        '{}} ==> ERROR',                // "    "
        'foo|{name} ==> ERROR',         // Can't mix alternation and named captures

        // Comments *were* supported until commit b908107. Now these are erorrs (invalid char '#'):
        '#comment ==> ERROR',
        '   #comment ==> ERROR',
        '# /a/b/c   fsdfsdf ==> ERROR',
        '/a/b#comment ==> ERROR',
        '/**/{name}.js   #12 ==> ERROR',
    ];

    tests.forEach(test => {
        it(test, () => {
            let source = test.split(' ==> ')[0];
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
