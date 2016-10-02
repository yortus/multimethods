import {expect} from 'chai';
import {Pattern} from 'multimethods';


describe('Comparing a pattern with its normalized form', () => {

    let patterns = [
        '/*/bar/{...baz}',
        '/*/bar/…',
        '/{n}/bar/...',
        '/{__}/bar/{…baz}'
    ];

    patterns.forEach(a1 => {
        let p1 = new Pattern(a1);
        it(`'${a1}' vs normalized`, () => {
            expect(a1 === p1.normalized.toString()).equals(p1 === p1.normalized);
        });

        patterns.forEach(a2 => {
            let p2 = new Pattern(a2);
            it(`'${a1}' vs '${a2}'`, () => {
                expect(p1.normalized).equals(p2.normalized);
            });
        });
    });
});
