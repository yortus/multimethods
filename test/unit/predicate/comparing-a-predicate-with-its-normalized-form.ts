import {expect} from 'chai';
import {Predicate} from 'multimethods';


describe('Comparing a predicate with its normalized form', () => {

    let predicatePatterns = [
        '/*/bar/{...baz}',
        '/*/bar/…',
        '/{n}/bar/...',
        '/{__}/bar/{…baz}'
    ];

    predicatePatterns.forEach(a1 => {
        let p1 = new Predicate(a1);
        it(`'${a1}' vs normalized`, () => {
            expect(a1 === p1.normalized.toString()).equals(p1 === p1.normalized);
        });

        predicatePatterns.forEach(a2 => {
            let p2 = new Predicate(a2);
            it(`'${a1}' vs '${a2}'`, () => {
                expect(p1.normalized).equals(p2.normalized);
            });
        });
    });
});
