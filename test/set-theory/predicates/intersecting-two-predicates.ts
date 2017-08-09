import {expect} from 'chai';
import {intersect, toNormalPredicate} from 'multimethods/math/predicates';





describe('Intersecting two predicates', () => {

    // NB: For visual clarity, `⨂` is used below to mean the empty predicate. This is not the
    //     same as the ∅ predicate. ∅ does not match any strings, but ⨂ matches the empty string.
    let tests = [
        '∅ ∩ ∅ = ∅',
        '∅ ∩ ⨂ = ∅',
        '⨂ ∩ ∅ = ∅',
        'abc ∩ ∅ = ∅',
        '∅ ∩ def = ∅',
        '** ∩ ⨂ = ⨂',
        '⨂ ∩ ⨂ = ⨂',
        'abc ∩ ⨂ = ∅',
        '⨂ ∩ def = ∅',
        '⨂ ∩ ⨂ = ⨂',
        '⨂ ∩ * = ⨂',
        '⨂ ∩ ** = ⨂',
        '* ∩ ⨂ = ⨂',

        '/ab* ∩ /*b = /ab|/ab*b',
        '/f*o*o*z ∩ /foo*baz = /foo*baz',
        '/*/f*o*o*baz ∩ /aaa/foo*z = /aaa/foo*baz',
        '/ab*b ∩ /a*bc = ∅',
        '/ab*b ∩ /a*bc* = /ab*bc*b|/abc*b',
        '/a*b ∩ /ab*ab = /ab*ab',
        '/a*b ∩ /ba*ab = ∅',
        '/*m*n* ∩ /*n*m* = /*m*n*m*|/*n*m*n*',
        '/*m*n* ∩ /*n*m*n* = /*n*m*n*',
        '/ ∩ / = /',
        '/ ∩ /* = /',
        '/* ∩ /* = /*',
        '/* ∩ / = /',
        '/f ∩ / = ∅',
        '/ ∩ /f = ∅',

        '/a/b ∩ /* = ∅',
        '/a/b ∩ /*/*c* = ∅',
        '/a/*b ∩ /*/*c* = /a/*c*b',
        '/a/*b ∩ /*/*c*/* = ∅',
        '/foo/* ∩ /*/bar = /foo/bar',
        '/a/b ∩ /** = /a/b',
        '/a/b ∩ ** = /a/b',
        '/ ∩ ** = /',
        '**.html ∩ ** = **.html',
        '/foo/**.html ∩ ** = /foo/**.html',
        '/foo/**.html ∩ /foo/bar/*z/* = /foo/bar/*z/*.html',
        '/foo/**.html ∩ /foo/bar/*z/** = /foo/bar/*z/**.html',

        // '/* ∩ /** = /*',
        // '/*/* ∩ /** = /*/*',
        // '/** ∩ /** = /**',
        // '/** ∩ /*/* = /*/*',
        // '/**/* ∩ /** = /**/*',
        // '/*/** ∩ /** = /*/**',
        // '/** ∩ /**/* = /**/*',
        // '/** ∩ /*/** = /*/**',
        // '/*/**/* ∩ /** = /*/**/*',
        // '*/** ∩ **/* = */*|*/**/*',
        // '*** ∩ *** = ERROR',
        // 'a* ∩ *a = a|a*a',
        // 'a** ∩ **a = a|a**a',
        // 'a/** ∩ **/a = a/**/a|a/a',
        // '*a** ∩ **a* = *a*|*a**a*',
        // '**a* ∩ *a** = *a*|*a**a*',
        // '**a* ∩ *z** = *a*z*|*z**a*',
        // '*z** ∩ **a* = *a*z*|*z**a*',
        // '*z* ∩ *a* = *a*z*|*z*a*',
        // 'a*** ∩ ***a = ERROR',
        // 'a*** ∩ ***a = ERROR',

        // '/o** ∩ /*z = /o*z',
        // '/o**o** ∩ /*z = /o*o*z',
        // '/o**o** ∩ /*z/b = /o*o*z/b',
        // '/**o**o** ∩ /*z/b = /*o*o*z/b',

        // 'abc|def ∩ def|ghi = def',
        // 'a|b|c|d ∩ z|c|q|d|12 = c|d',
        // 'a|a|aa|a ∩ aaa|aa|a|aa = a|aa',
        // 'a*|*a|a ∩ *|a|a* = *a|a*',
        // 'foo** ∩ foo/bar|foo/*|*baz = foo*baz|foo/*',
        // 'a*|aa*|aa*b ∩ ** = a*',
        // 'a|b|c|d|b* ∩ ∅ = ∅',
    ];

    tests.forEach(test => {
        it(test, () => {
            test = test.replace(/⨂/g, '');
            let lhsA = test.split(' = ')[0].split(' ∩ ')[0];
            let lhsB = test.split(' = ')[0].split(' ∩ ')[1];
            let rhs = test.split(' = ')[1];
            let actual: string;
            let expected = rhs;
            try {
                actual = intersect(toNormalPredicate(lhsA), toNormalPredicate(lhsB));
            }
            catch (ex) {
                actual = 'ERROR';
            }
            expect(actual).equals(expected);
        });
    });
});
