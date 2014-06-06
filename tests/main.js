var chai = require('chai');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

//import mm = require('multimethods');
var mm = require('../index');
var expect = chai.expect;

describe('multimethods.create(...)', function () {
    var simpleStringRoute = {
        name: 'simple string route',
        typeof: function (value) {
            return value;
        },
        isa: function (specialType, generalType) {
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
            }
        ]
    });

    triple.override(['', '', ''], function (a, b, c) {
        return 'default implementation';
    });
    triple.override(['A', 'B', 'C'], function (a, b, c) {
        return 'A, B, C';
    });
    triple.override(['A1', 'B', 'C'], function (a, b, c) {
        return 'A1, B, C';
    });
    triple.override(['A', 'B1', 'C'], function (a, b, c) {
        return 'A, B1, C';
    });
    triple.override(['A1', 'B1', 'C'], function (a, b, c) {
        return 'A1, B1, C';
    });
    triple.override(['A', 'B', 'C2'], function (a, b, c) {
        return 'A, B, C2';
    });
    triple.override(['A', 'B2', 'C2'], function (a, b, c) {
        return 'A, B2, C2';
    });
    triple.override(['A1', 'B', 'C234'], function (a, b, c) {
        return 'A1, B, C234';
    });
    triple.override(['A123', 'B2', 'C2'], function (a, b, c) {
        return 'A123, B2, C2';
    });
    triple.override(['A12', 'B2', 'C'], function (a, b, c) {
        return 'A12, B2, C';
    });

    it('returns a multimethod that invokes the best override', function () {
        expect(triple('A1', 'B1', 'C1')).to.equal('A1, B1, C');
        expect(triple('A2', 'B2', 'C2')).to.equal('A, B2, C2');
        expect(function () {
            return triple('A12', 'B', 'C23');
        }).to.throw(); // ambiguous
        expect(triple('A2', 'B2', 'C')).to.equal('A, B, C');
        expect(triple('A2', 'B2', 'C2')).to.equal('A, B2, C2');
        expect(triple('A123', 'B', 'C')).to.equal('A1, B, C');
    });
});

describe('multimethods.createAsync(...)', function () {
    var simpleStringRoute = {
        name: 'simple string route',
        typeof: async(function (value) {
            return value;
        }),
        isa: async(function (specialType, generalType) {
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
            }
        ]
    });

    triple.override(['', '', ''], async(function (a, b, c) {
        return 'default implementation';
    }));
    triple.override(['A', 'B', 'C'], async(function (a, b, c) {
        return 'A, B, C';
    }));
    triple.override(['A1', 'B', 'C'], async(function (a, b, c) {
        return 'A1, B, C';
    }));
    triple.override(['A', 'B1', 'C'], async(function (a, b, c) {
        return 'A, B1, C';
    }));
    triple.override(['A1', 'B1', 'C'], async(function (a, b, c) {
        return 'A1, B1, C';
    }));
    triple.override(['A', 'B', 'C2'], async(function (a, b, c) {
        return 'A, B, C2';
    }));
    triple.override(['A', 'B2', 'C2'], async(function (a, b, c) {
        return 'A, B2, C2';
    }));
    triple.override(['A1', 'B', 'C234'], async(function (a, b, c) {
        return 'A1, B, C234';
    }));
    triple.override(['A123', 'B2', 'C2'], async(function (a, b, c) {
        return 'A123, B2, C2';
    }));
    triple.override(['A12', 'B2', 'C'], async(function (a, b, c) {
        return 'A12, B2, C';
    }));

    it('returns a multimethod that invokes the best override', async.cps(function () {
        expect(await(triple('A1', 'B1', 'C1'))).to.equal('A1, B1, C');
        expect(await(triple('A2', 'B2', 'C2'))).to.equal('A, B2, C2');

        var fail = new Error("Expected triple('A12', 'B', 'C23') to throw");
        try  {
            await(triple('A12', 'B', 'C23'));
            throw fail;
        } catch (err) {
            if (err === fail)
                throw err;
        }

        expect(await(triple('A2', 'B2', 'C'))).to.equal('A, B, C');
        expect(await(triple('A2', 'B2', 'C2'))).to.equal('A, B2, C2');
        expect(await(triple('A123', 'B', 'C'))).to.equal('A1, B, C');
    }));
});
//# sourceMappingURL=main.js.map
