import {expect} from 'chai';
import {PredicateClass, normalise} from 'multimethods';


describe('Comparing a predicate with its normalized form', () => {

    let predicatePatterns = [
        '/*/bar/{...baz}',
        '/*/bar/…',
        '/{n}/bar/...',
        '/{__}/bar/{…baz}'
    ];

    predicatePatterns.forEach(a1 => {
        let p1 = new PredicateClass(a1);
        it(`'${a1}' vs normalized`, () => {
            expect(a1 === normalise(p1.toString())).equals(p1.toString() === normalise(p1.toString()));
        });

        predicatePatterns.forEach(a2 => {
            let p2 = new PredicateClass(a2);
            it(`'${a1}' vs '${a2}'`, () => {
                expect(normalise(p1.toString())).equals(normalise(p2.toString()));
            });
        });
    });
});
