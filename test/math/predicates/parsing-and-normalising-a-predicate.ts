// tslint:disable:no-eval
import {expect} from 'chai';
import {toNormalPredicate, toPredicate} from 'multimethods/math/predicates';





describe('Parsing and normalising a predicate', () => {

    let tests = [

        // Simple predicates consisting of valid characters:
        'abcdefghijklm ==> abcdefghijklm',
        'nopqrstuvwxyz ==> nopqrstuvwxyz',
        'ABCDEFGHIJKLM ==> ABCDEFGHIJKLM',
        'NOPQRSTUVWXYZ ==> NOPQRSTUVWXYZ',
        '0123456789 ==> 0123456789',
        ' /-.:<>@ ==>  /-.:<>@',

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
        ' ==> ', // NB: empty predicate
        '∅ ==> ∅',
        '/ ==> /',
        '* ==> *',
        '** ==> **',
        'a|b ==> a|b',
        '/api/foo ==> /api/foo',
        '/api/foo/BAR ==> /api/foo/BAR',
        '/api/foo** ==> /api/foo**',
        '/api/foo/** ==> /api/foo/**',
        '/api/foo/{**rest} ==> /api/foo/**',
        '/API/f* ==> /API/f*',
        '/api/{foO}O ==> /api/*O',

        'foo*|*oops ==> *oops|foo*',
        '*|aaa ==> *',
        '| ==> ', // NB: two empty alternatives
        'abc|def ==> abc|def',
        'def|abc ==> abc|def',
        'def|abc|DEF|123 ==> 123|DEF|abc|def',
        'foo*/bar|fo**/*z ==> fo**/*z|foo*/bar',
        'abc|abc ==> abc',
        '*|* ==> *',
        '**|** ==> **',
        '*|*|* ==> *',
        '**|*|** ==> **',
        'a*|a*|B* ==> B*|a*',
        'a*|abc*d|aa* ==> a*',
        'a*|*a ==> *a|a*',
        'foo*/bar|fo**/* ==> fo**/*',

        '/**/{name}.{ext} ==> /**/*.*',
        '/{**aPath}/{name}.{ext} ==> /**/*.*',
        '/-/./- ==> /-/./-',
        '/foo// ==> /foo//',
        '// ==> //',
        '{$} ==> *',
        '{**__} ==> **',
        '**. ==> **.',
        'GET /foo ==> GET /foo',
        '{method} {**path} ==> * **',
        'GET   /foo ==> GET   /foo',
        '   GET /foo ==>    GET /foo',
        '   /    ==>    /   ',

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
            let [source, expected] = test.split(' ==> ');
            let actual: string;
            try {
                actual = toNormalPredicate(toPredicate(source));
            }
            catch (ex) {
                actual = 'ERROR';
            }
            expect(actual).to.equal(expected);
        });
    });
});
