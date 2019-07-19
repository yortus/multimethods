// tslint:disable:no-eval
import {expect} from 'chai';
import {toIdentifierParts, toPattern} from 'multimethods/patterns';




describe('Making an identifier for a pattern', () => {

    let tests = [

        // Simple patterns consisting of valid characters:
        'abcdefghijklm ==> abcdefghijklm',
        'nopqrstuvwxyz ==> nopqrstuvwxyz',
        'ABCDEFGHIJKLM ==> ABCDEFGHIJKLM',
        'NOPQRSTUVWXYZ ==> NOPQRSTUVWXYZ',
        '0123456789 ==> 0123456789',
        ' /-.:<>@! ==> ˑⳆￚˌːᐸᐳဇǃ',

        // All other characters should be invalid.... Test all keyboard symbols explicitly:
        '` ==> ERROR',
        '~ ==> ERROR',
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

        // More complex valid patterns:
        ' ==> ', // NB: empty pattern
        '∅ ==> Ø',
        '/ ==> Ⳇ',
        '* ==> ӿ',
        '** ==> ᕯ',
        'a|b ==> aǀb',
        '/api/foo ==> ⳆapiⳆfoo',
        '/api/foo/BAR ==> ⳆapiⳆfooⳆBAR',
        '/api/foo** ==> ⳆapiⳆfooᕯ',
        '/api/foo/** ==> ⳆapiⳆfooⳆᕯ',
        '/api/foo/**! ==> ⳆapiⳆfooⳆᕯǃ',
        '/api/foo/{**rest} ==> ⳆapiⳆfooⳆᕯ',
        '/API/f* ==> ⳆAPIⳆfӿ',
        '/api/{foO}O ==> ⳆapiⳆӿO',

        'foo*|*oops ==> ӿoopsǀfooӿ',
        '*|aaa ==> ӿ',
        '*!|aaa ==> ӿǃǀaaa',
        '| ==> ', // NB: two empty alternatives
        'abc|def ==> abcǀdef',
        'def|abc ==> abcǀdef',
        'def|abc|DEF|123 ==> 123ǀDEFǀabcǀdef',
        'foo*/bar|fo**/*z ==> foᕯⳆӿzǀfooӿⳆbar',
        'abc|abc ==> abc',
        '*|* ==> ӿ',
        '**|** ==> ᕯ',
        '*|*|* ==> ӿ',
        '**|*|** ==> ᕯ',
        '**|*|**! ==> ᕯ',
        'a*|a*|B* ==> Bӿǀaӿ',
        'a*|abc*d|aa* ==> aӿ',
        'a*|*a ==> ӿaǀaӿ',
        'foo*/bar|fo**/* ==> foᕯⳆӿ',

        '/**/{name}.{ext} ==> ⳆᕯⳆӿˌӿ',
        '/{**aPath}/{name}.{ext} ==> ⳆᕯⳆӿˌӿ',
        '/-/./- ==> ⳆￚⳆˌⳆￚ',
        '/foo// ==> ⳆfooⳆⳆ',
        '// ==> ⳆⳆ',
        '{$} ==> ӿ',
        '{**__} ==> ᕯ',
        '**. ==> ᕯˌ',
        'GET /foo ==> GETˑⳆfoo',
        '{method} {**path} ==> ӿˑᕯ',
        'GET   /foo ==> GETˑˑˑⳆfoo',
        '   GET /foo ==> ˑˑˑGETˑⳆfoo',
        '   /    ==> ˑˑˑⳆˑˑˑ',
    ];

    tests.forEach(test => {
        it(test, () => {
            let [source, expected] = test.split(' ==> ');
            let actual: string;
            try {
                actual = toIdentifierParts(toPattern(source));
            }
            catch (ex) {
                actual = 'ERROR';
            }
            expect(actual).to.equal(expected);
        });
    });
});
