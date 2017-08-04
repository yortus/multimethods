// tslint:disable:no-eval
import {expect} from 'chai';
import {parsePredicateSource, toNormalPredicate} from 'multimethods/math/predicates';





describe('Parsing and normalising a predicate', () => {

    let tests = [

        // Simple predicates consisting of valid characters:
        'abcdefghijklm ==> {normalised: "abcdefghijklm"}',
        'nopqrstuvwxyz ==> {normalised: "nopqrstuvwxyz"}',
        'ABCDEFGHIJKLM ==> {normalised: "ABCDEFGHIJKLM"}',
        'NOPQRSTUVWXYZ ==> {normalised: "NOPQRSTUVWXYZ"}',
        '0123456789 ==> {normalised: "0123456789"}',
        ' /-.:<>@ ==> {normalised: " /-.:<>@"}',

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
        ' ==> {normalised: ""}', // NB: empty predicate
        '∅ ==> {normalised: "∅"}',
        '/ ==> {normalised: "/"}',
        '* ==> {normalised: "*"}',
        '** ==> {normalised: "**"}',
        'a|b ==> {normalised: "a|b"}',
        '/api/foo ==> {normalised: "/api/foo"}',
        '/api/foo/BAR ==> {normalised: "/api/foo/BAR"}',
        '/api/foo** ==> {normalised: "/api/foo**"}',
        '/api/foo/** ==> {normalised: "/api/foo/**"}',
        '/api/foo/{**rest} ==> {normalised: "/api/foo/**"}',
        '/API/f* ==> {normalised: "/API/f*"}',
        '/api/{foO}O ==> {normalised: "/api/*O"}',

        'foo*|*oops ==> {normalised: "*oops|foo*"}',
        '*|aaa ==> {normalised: "*"}',
        '| ==> {normalised: ""}', // NB: two empty alternatives
        'abc|def ==> {normalised: "abc|def"}',
        'def|abc ==> {normalised: "abc|def"}',
        'def|abc|DEF|123 ==> {normalised: "123|DEF|abc|def"}',
        'foo*/bar|fo**/*z ==> {normalised: "fo**/*z|foo*/bar"}',
        'abc|abc ==> {normalised: "abc"}',
        '*|* ==> {normalised: "*"}',
        '**|** ==> {normalised: "**"}',
        '*|*|* ==> {normalised: "*"}',
        '**|*|** ==> {normalised: "**"}',
        'a*|a*|B* ==> {normalised: "B*|a*"}',
        'a*|abc*d|aa* ==> {normalised: "a*"}',
        'a*|*a ==> {normalised: "*a|a*"}',
        'foo*/bar|fo**/* ==> {normalised: "fo**/*"}',

        '/**/{name}.{ext} ==> {normalised: "/**/*.*"}',
        '/{**aPath}/{name}.{ext} ==> {normalised: "/**/*.*"}',
        '/-/./- ==> {normalised: "/-/./-"}',
        '/foo// ==> {normalised: "/foo//"}',
        '// ==> {normalised: "//"}',
        '{$} ==> {normalised: "*"}',
        '{**__} ==> {normalised: "**"}',
        '**. ==> {normalised: "**."}',
        'GET /foo ==> {normalised: "GET /foo"}',
        '{method} {**path} ==> {normalised: "* **"}',
        'GET   /foo ==> {normalised: "GET   /foo"}',
        '   GET /foo ==> {normalised: "   GET /foo"}',
        '   /    ==> {normalised: "   /   "}',

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
            let expected: string = rhs === 'ERROR' ? rhs : eval(`(${rhs})`);
            let actual: {normalised: string} | string;
            try {
                let p = parsePredicateSource(source);
                let np = toNormalPredicate(p);
                actual = {normalised: np};
            }
            catch (ex) {
                actual = 'ERROR';
            }
            expect(actual).to.deep.equal(expected);
        });
    });
});
