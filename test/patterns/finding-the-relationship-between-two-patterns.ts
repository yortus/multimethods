import {expect} from 'chai';
import {intersect, isSubsetOf, NONE, toNormalPattern} from 'multimethods/patterns';




describe('Finding the relationship between two patterns', () => {

    // NB: For visual clarity, `⨂` is used below to mean the empty pattern. This is not the
    //     same as the ∅ pattern. ∅ does not match any strings, but ⨂ matches the empty string.
    let tests = [
        '∅ EQUALS ∅',
        '⨂ EQUALS ⨂',
        '∅ SUBSET ⨂',
        '⨂ SUPERSET ∅',
        '∅ SUBSET abc',
        'abc SUPERSET ∅',
        '∅ SUBSET **',
        '** SUPERSET ∅',

        'abc/def SUBSET **',
        '** SUPERSET abc/def',
        'abc/def DISJOINT *',
        '* DISJOINT abc/def',
        'abc SUBSET a*',
        '/ab* OVERLAPS /*b',
        '/*/bar/{**baz} EQUALS /{__}/bar/**',

        '/f*o*o*z SUPERSET /foo*baz',
        '/*/f*o*o*baz OVERLAPS /aaa/foo*z',
        '/ab*b DISJOINT /a*bc',
        '/ab*b OVERLAPS /a*bc*',
        '/a*b SUPERSET /ab*ab',
        '/a*b DISJOINT /ba*ab',
        '/*m*n* OVERLAPS /*n*m*',
        '/*m*n* SUPERSET /*n*m*n*',
        '/ EQUALS /',
        '/ SUBSET /*',
        '/* EQUALS /*',
        '/* SUPERSET /',
        '/f DISJOINT /',
        '/ DISJOINT /f',

        '/a/b DISJOINT /*',
        '/a/b DISJOINT /*/*c*',
        '/a/*b OVERLAPS /*/*c*',
        '/a/*b DISJOINT /*/*c*/*',
        '/foo/* OVERLAPS /*/bar',
        '/a/b SUBSET /**',
        '/a/b SUBSET **',
        '/ SUBSET **',
        '**.html SUBSET **',
        '/foo/**.html SUBSET **',
        '/foo/**.html OVERLAPS /foo/bar/*z/*',
        '/foo/**.html OVERLAPS /foo/bar/*z/**',

        '/* SUBSET /**',
        '/*/* SUBSET /**',
        '/** EQUALS /**',
        '/** SUPERSET /*/*',
        '/**/* SUBSET /**',
        '/*/** SUBSET /**',
        '/** SUPERSET /**/*',
        '/** SUPERSET /*/**',
        '/*/**/* SUBSET /**',
        '*/** OVERLAPS **/*',
        'a* OVERLAPS *a',
        'a** OVERLAPS **a',
        'a/** OVERLAPS **/a',
        '*a** OVERLAPS **a*',
        '**a* OVERLAPS *a**',
        '**a* OVERLAPS *z**',
        '*z** OVERLAPS **a*',
        '*z* OVERLAPS *a*',

        '/o** OVERLAPS /*z',
        '/o**o** OVERLAPS /*z',
        '/o**o** OVERLAPS /*z/b',
        '/**o**o** OVERLAPS /*z/b',

        // NB: isSubsetOf can't work with alternations, so the following are all errors.
        'abc|def OVERLAPS def|ghi',
        'a|b|c|d OVERLAPS z|c|q|d|12',
        'a|a|aa|a SUBSET aaa|aa|a|aa',
        'a*|*a|a SUBSET *|a|a*',
        'foo** OVERLAPS foo/bar|foo/*|*baz',
        'a*|aa*|aa*b SUBSET **',
        'a|b|c|d|b* SUPERSET ∅',
        'a|bar|b*|*c* EQUALS *c*|baz|a|b*',
    ];

    tests.forEach(test => {
        it(test, () => {
            test = test.replace(/⨂/g, '');
            let [lhs, rhs] = test.split(/ [A-Z]+ /).map(toNormalPattern);
            let expected = test.match(/ ([A-Z]+) /)![1];
            let actual = '';

            // NB: isSubsetOf() can't handle alternations, and can't determine disjoint/overlapping relationships.
            if (lhs.indexOf('|') === -1 && rhs.indexOf('|') === -1) {
                let isSubset = isSubsetOf(lhs, rhs);
                let isSuperset = isSubsetOf(rhs, lhs);
                if (isSubset && isSuperset) actual = 'EQUALS';
                else if (isSubset) actual = 'SUBSET';
                else if (isSuperset) actual = 'SUPERSET';
            }

            // If isSubsetOf() couldn't determine the relationship, then use intersect instead.
            if (actual === '') {
                let intersection = intersect(lhs, rhs);
                if (lhs === rhs) actual = 'EQUALS';
                else if (intersection === lhs) actual = 'SUBSET';
                else if (intersection === rhs) actual = 'SUPERSET';
                else if (intersection === NONE) actual = 'DISJOINT';
                else actual = 'OVERLAPS';
            }
            expect(actual).equals(expected);
        });
    });
});
