import {expect} from 'chai';
import {NormalisedPattern} from 'multimethods/patterns';




describe('Comparing equivalent patterns', () => {

    let equivalenceGroups = [
        [
            '/*/bar/{**baz}',
            '/*/bar/**',
            '/{n}/bar/**',
            '/{__}/bar/{**baz}',
        ],
        [
            '/*/bar/**|xy*z|abc',
            'abc|/*/bar/**|xy*z',
            '/*/bar/**|abc|xy*z',
            'xy*z|/*/bar/**|abc',
            'abc|xy*z|/*/bar/**',
        ],
        [
            'aaa|a*|**/*z',
            '1/**/z|a*|**/*z|abc',
            '123/xyz|a|a1|a/to/z|**/*z|a*',
            '**/*z|a*z|a*|x/y/z',
        ],
    ];

    equivalenceGroups.forEach(group => {
        group.forEach(p1 => {
            group.forEach(p2 => {
                it(`'${p1}' vs '${p2}'`, () => {
                    expect(NormalisedPattern(p1)).equals(NormalisedPattern(p2));
                });
            });
        });
    });
});
