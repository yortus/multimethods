import {expect} from 'chai';
import {toPredicate} from 'multimethods/math/predicates';
import {intersect} from 'multimethods/math/sets';


describe('Intersecting two predicates', () => {

    let tests = [
        '… ∩ ∅ = ∅',
        ' ∩ ∅ = ∅',
        'abc ∩ ∅ = []',
        '∅ ∩ ∅ = ∅',
        '∅ ∩ def = []',
        '∅ ∩ * = ∅',
        '∅ ∩ … = ∅',
        '* ∩ ∅ = ∅',

        '/ab* ∩ /*b = [/ab,/ab*b]',
        '/f*o*o*z ∩ /foo*baz = /foo*baz',
        '/*/f*o*o*baz ∩ /aaa/foo*z = /aaa/foo*baz',
        '/ab*b ∩ /a*bc = []',
        '/ab*b ∩ /a*bc* = [/abc*b,/ab*bc*b]',
        '/a*b ∩ /ab*ab = /ab*ab',
        '/a*b ∩ /ba*ab = []',
        '/*m*n* ∩ /*n*m* = [/*m*n*m*,/*n*m*n*]',
        '/*m*n* ∩ /*n*m*n* = /*n*m*n*',
        '/ ∩ / = /',
        '/ ∩ /* = /',
        '/* ∩ /* = /*',
        '/* ∩ / = /',
        '/f ∩ / = []',
        '/ ∩ /f = []',

        '/a/b ∩ /* = []',
        '/a/b ∩ /*/*c* = []',
        '/a/*b ∩ /*/*c* = /a/*c*b',
        '/a/*b ∩ /*/*c*/* = []',
        '/foo/* ∩ /*/bar = /foo/bar',

        '/a/b ∩ /… = /a/b',
        '/a/b ∩ … = /a/b',
        '/ ∩ … = /',
        ' ∩ … = ∅',
        '….html ∩ … = ….html',
        '/foo/….html ∩ … = /foo/….html',
        '/foo/….html ∩ /foo/bar/*z/* = /foo/bar/*z/*.html',
        '/foo/….html ∩ /foo/bar/*z/… = /foo/bar/*z/….html',

        '/* ∩ /… = /*',
        '/*/* ∩ /… = /*/*',
        '/… ∩ /… = /…',
        '/… ∩ /*/* = /*/*',
        '/…/* ∩ /… = /…/*',
        '/*/… ∩ /… = /*/…',
        '/… ∩ /…/* = /…/*',
        '/… ∩ /*/… = /*/…',
        '/*/…/* ∩ /… = /*/…/*',
        '*/… ∩ …/* = [*/*,*/…/*]',
        '*… ∩ …* = ERROR',
        'a* ∩ *a = [a,a*a]',
        'a… ∩ …a = [a,a…a]',
        'a/… ∩ …/a = [a/a,a/…/a]',
        '*a… ∩ …a* = [*a*,*a…a*]',
        '…a* ∩ *a… = [*a*,*a…a*]',
        '…a* ∩ *z… = [*a*z*,*z…a*]',
        '*z… ∩ …a* = [*a*z*,*z…a*]',
        '*z* ∩ *a* = [*z*a*,*a*z*]',
        'a*… ∩ …*a = ERROR',
        'a…* ∩ *…a = ERROR',

        '/o… ∩ /*z = /o*z',
        '/o…o… ∩ /*z = /o*o*z',
        '/o…o… ∩ /*z/b = /o*o*z/b',
        '/…o…o… ∩ /*z/b = /*o*o*z/b'
    ];

    tests.forEach(test => {
        it(test, () => {
            let lhsA = test.split(' = ')[0].split(' ∩ ')[0].replace(/^∅$/, '');
            let lhsB = test.split(' = ')[0].split(' ∩ ')[1].replace(/^∅$/, '');
            let rhs = test.split(' = ')[1].replace(/^∅$/, '');
            let actual: string, expected = rhs;
            try {
                let intersections = intersect(toPredicate(lhsA), toPredicate(lhsB)); // TODO: fix casts
                actual = `[${intersections}]`;
                if (intersections.length === 1) actual = actual.slice(1, -1);
            }
            catch(ex) {
                actual = 'ERROR';
            }
            expect(actual).equals(expected);
        });
    });
});
