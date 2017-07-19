import {expect} from 'chai';
import {toPredicate, toNormalPredicate} from 'multimethods/math/predicates';


describe('Comparing a predicate with its normal form', () => {

    let predicatePatterns = [
        '/*/bar/{...baz}',
        '/*/bar/…',
        '/{n}/bar/...',
        '/{__}/bar/{…baz}'
    ];

    predicatePatterns.forEach(p1 => {
        predicatePatterns.forEach(p2 => {
            it(`'${p1}' vs '${p2}'`, () => {
                expect(toNormalPredicate(p1)).equals(toNormalPredicate(p2));
            });
        });
    });
});
