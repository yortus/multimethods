import {expect} from 'chai';
import {toPredicate, toNormalPredicate} from 'multimethods';


describe('Comparing a predicate with its normal form', () => {

    let predicatePatterns = [
        '/*/bar/{...baz}',
        '/*/bar/…',
        '/{n}/bar/...',
        '/{__}/bar/{…baz}'
    ];

    predicatePatterns.forEach(a1 => {
        let p1 = toPredicate(a1);
        it(`'${a1}' vs normalized`, () => {
            expect(a1 === toNormalPredicate(p1)).equals(p1.toString() === toNormalPredicate(p1));
        });

        predicatePatterns.forEach(a2 => {
            let p2 = toPredicate(a2);
            it(`'${a1}' vs '${a2}'`, () => {
                expect(toNormalPredicate(p1)).equals(toNormalPredicate(p2));
            });
        });
    });
});
