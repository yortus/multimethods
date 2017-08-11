import {expect} from 'chai';
import {intersect, toNormalPredicate} from 'multimethods/math/predicates';





describe('Intersecting two predicates', () => {

    // TODO: temp testing...
    it('SPECIAL', () => {
        let preds = [
            // '*A*I*S*W*',
            // '*B*W*',
            // '*A*I*M*W*',
            // '*W*',
            // '*B*M*W*',
            // '*A*J*M*S*',
            // '*A*T*W*',
            // '*A*E*S*T*W*',
            // '*B*I*M*S*T*U*W*Y*Z*',
            // '*A*B*X*Z*',
            // '*A*B*M*W*X*Y*',
            // '*D*E*Q*',
            '*A*',
            '*B*',
            '*C*',
            '*D*',
            '*E*',
            '*F*',
            '*G*',
        ];

        let bottomA = preds.map(toNormalPredicate).reduce(
            (bottom, pred) => intersect(bottom, pred),
            toNormalPredicate('**')
        );
        //expect(bottomA).to.equal('*A*B*D*E*I*J*M*Q*S*T*U*W*X*Y*Z*');

        let bottomBs = [] as string[];
        for (let i = 0; i < preds.length; ++i) {
            for (let j = i + 1; j < preds.length; ++j) {
                let p1 = preds[i];
                let p2 = preds[j];
                let join = intersect(toNormalPredicate(p1), toNormalPredicate(p2));
                bottomBs.push(join);
            }
        }
        let bottomB = toNormalPredicate(bottomBs.join('|'));
        //expect(bottomB).to.equal('*A*B*D*E*Q*X*Z*|*A*B*J*M*S*X*Z*|*A*D*E*J*M*Q*S*|*A*I*M*W*|*A*I*S*W*|*A*J*M*S*W*|*A*T*W*|*B*W*|*D*E*Q*W*');

        let bottomC = preds.map(p => intersect(toNormalPredicate(p), bottomB));
        console.log(bottomC);

    });






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

        '/* ∩ /** = /*',
        '/*/* ∩ /** = /*/*',
        '/** ∩ /** = /**',
        '/** ∩ /*/* = /*/*',
        '/**/* ∩ /** = /**/*',
        '/*/** ∩ /** = /*/**',
        '/** ∩ /**/* = /**/*',
        '/** ∩ /*/** = /*/**',
        '/*/**/* ∩ /** = /*/**/*',
        '*/** ∩ **/* = */*|*/**/*',
        '*** ∩ *** = ERROR',
        'a* ∩ *a = a|a*a',
        'a** ∩ **a = a|a**a',
        'a/** ∩ **/a = a/**/a|a/a',
        '*a** ∩ **a* = *a*|*a**a*',
        '**a* ∩ *a** = *a*|*a**a*',
        '**a* ∩ *z** = *a*z*|*z**a*',
        '*z** ∩ **a* = *a*z*|*z**a*',
        '*z* ∩ *a* = *a*z*|*z*a*',
        'a*** ∩ ***a = ERROR',
        'a*** ∩ ***a = ERROR',

        '/o** ∩ /*z = /o*z',
        '/o**o** ∩ /*z = /o*o*z',
        '/o**o** ∩ /*z/b = /o*o*z/b',
        '/**o**o** ∩ /*z/b = /*o*o*z/b',

        'abc|def ∩ def|ghi = def',
        'a|b|c|d ∩ z|c|q|d|12 = c|d',
        'a|a|aa|a ∩ aaa|aa|a|aa = a|aa',
        'a*|*a|a ∩ *|a|a* = *a|a*',
        'foo** ∩ foo/bar|foo/*|*baz = foo*baz|foo/*',
        'a*|aa*|aa*b ∩ ** = a*',
        'a|b|c|d|b* ∩ ∅ = ∅',
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
