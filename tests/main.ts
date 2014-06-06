import references = require('references');
import chai = require('chai');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import mm = require('multimethods');
var expect = chai.expect;


describe('multimethods.create(...)', () => {

    var simpleStringRoute = {
        name: 'simple string route',
        typeof: value => value,
        isa: (specialType: string, generalType: string) => {
            return specialType.indexOf(generalType) === 0 && specialType.length >= generalType.length;
        }
    };

    var triple = mm.create({
        name: 'tripleDispatch',
        params: [
            {
                name: 'a',
                typeFamily: simpleStringRoute
            },
            {
                name: 'b',
                typeFamily: simpleStringRoute
            },
            {
                name: 'c',
                typeFamily: simpleStringRoute
            },
        ]
    });

    triple.override(['', '', ''], (a, b, c) => 'default implementation');
    triple.override(['A', 'B', 'C'], (a, b, c) => 'A, B, C');
    triple.override(['A1', 'B', 'C'], (a, b, c) => 'A1, B, C');
    triple.override(['A', 'B1', 'C'], (a, b, c) => 'A, B1, C');
    triple.override(['A1', 'B1', 'C'], (a, b, c) => 'A1, B1, C');
    triple.override(['A', 'B', 'C2'], (a, b, c) => 'A, B, C2');
    triple.override(['A', 'B2', 'C2'], (a, b, c) => 'A, B2, C2');
    triple.override(['A1', 'B', 'C234'], (a, b, c) => 'A1, B, C234');
    triple.override(['A123', 'B2', 'C2'], (a, b, c) => 'A123, B2, C2');
    triple.override(['A12', 'B2', 'C'], (a, b, c) => 'A12, B2, C');


    it('returns a multimethod that invokes the best override', () => {

        expect(triple('A1', 'B1', 'C1')).to.equal('A1, B1, C');
        expect(triple('A2', 'B2', 'C2')).to.equal('A, B2, C2');
        expect(() => triple('A12', 'B', 'C23')).to.throw(); // ambiguous
        expect(triple('A2', 'B2', 'C')).to.equal('A, B, C');
        expect(triple('A2', 'B2', 'C2')).to.equal('A, B2, C2');
        expect(triple('A123', 'B', 'C')).to.equal('A1, B, C');
    });
});


describe('multimethods.createAsync(...)', () => {

    var simpleStringRoute = {
        name: 'simple string route',
        typeof: async ((value: any) => value),
        isa: async ((specialType: string, generalType: string) => {
            return specialType.indexOf(generalType) === 0 && specialType.length >= generalType.length;
        })
    };

    var triple = mm.createAsync({
        name: 'tripleDispatch',
        params: [
            {
                name: 'a',
                typeFamily: simpleStringRoute
            },
            {
                name: 'b',
                typeFamily: simpleStringRoute
            },
            {
                name: 'c',
                typeFamily: simpleStringRoute
            },
        ]
    });

    triple.override(['', '', ''], async ((a, b, c) => 'default implementation'));
    triple.override(['A', 'B', 'C'], async ((a, b, c) => 'A, B, C'));
    triple.override(['A1', 'B', 'C'], async ((a, b, c) => 'A1, B, C'));
    triple.override(['A', 'B1', 'C'], async ((a, b, c) => 'A, B1, C'));
    triple.override(['A1', 'B1', 'C'], async ((a, b, c) => 'A1, B1, C'));
    triple.override(['A', 'B', 'C2'], async ((a, b, c) => 'A, B, C2'));
    triple.override(['A', 'B2', 'C2'], async ((a, b, c) => 'A, B2, C2'));
    triple.override(['A1', 'B', 'C234'], async ((a, b, c) => 'A1, B, C234'));
    triple.override(['A123', 'B2', 'C2'], async ((a, b, c) => 'A123, B2, C2'));
    triple.override(['A12', 'B2', 'C'], async ((a, b, c) => 'A12, B2, C'));


    it('returns a multimethod that invokes the best override', async.cps(() => {
        expect(await (triple('A1', 'B1', 'C1'))).to.equal('A1, B1, C');
        expect(await (triple('A2', 'B2', 'C2'))).to.equal('A, B2, C2');

        var fail = new Error("Expected triple('A12', 'B', 'C23') to throw");
        try {
            await (triple('A12', 'B', 'C23'));
            throw fail;
        }
        catch (err) { if (err === fail) throw err; }

        expect(await (triple('A2', 'B2', 'C'))).to.equal('A, B, C');
        expect(await (triple('A2', 'B2', 'C2'))).to.equal('A, B2, C2');
        expect(await (triple('A123', 'B', 'C'))).to.equal('A1, B, C');
    }));
});
