import {expect} from 'chai';
import {EulerDiagram, EulerSet} from 'multimethods/math/sets';





describe('Constructing an euler diagram', () => {

    let tests = [
        {
            // ======================================== 1. ========================================
            name: 'simple tree',
            predicates: [
                '/**',
                '/foo/*',
                '/bar/*',
                '/foo/bar',
            ],
            eulerDiagram: {
                '/**': {
                    '/foo/*': {
                        '/foo/bar': {},
                    },
                    '/bar/*': {},
                },
            },
        },
        {
            // ======================================== 2. ========================================
            name: 'complex DAG',
            predicates: [
                'a*',
                '*m*',
                '*z',
                '**',
                '/bar',
                '/*',
                '/foo',
                '/foo/*.html',
                '/**o**o**.html',
                '/**o**o**',
                '/bar',
                'a*',
                '/a/*',
                '/*/b',
                '/*z/b',
            ],
            eulerDiagram: {
                'a*': {
                    'a*m*': {
                        'a*m*z': {},
                    },
                    'a*z': {
                        'a*m*z': {},
                    },
                },
                '*m*': {
                    'a*m*': {
                        'a*m*z': {},
                    },
                    '*m*z': {
                        'a*m*z': {},
                    },
                },
                '*z': {
                    'a*z': {
                        'a*m*z': {},
                    },
                    '*m*z': {
                        'a*m*z': {},
                    },
                },
                '/*': {
                    '/bar': {},
                    '/*o*o*': {
                        '/foo': {},
                        '/*o*o*.html': {},
                    },
                },
                '/**o**o**': {
                    '/*o*o*': {
                        '/foo': {},
                        '/*o*o*.html': {},
                    },
                    '/**o**o**.html': {
                        '/*o*o*.html': {},
                        '/foo/*.html': {},
                        '/a/*o*o*.html': {},
                    },
                    '/a/*o*o*': {
                        '/a/*o*o*.html': {},
                    },
                    '/*o*o*/b': {
                        '/*o*o*z/b': {},
                    },
                },
                '/a/*': {
                    '/a/*o*o*': {
                        '/a/*o*o*.html': {},
                    },
                    '/a/b': {},
                },
                '/*/b': {
                    '/*o*o*/b': {
                        '/*o*o*z/b': {},
                    },
                    '/a/b': {},
                    '/*z/b': {
                        '/*o*o*z/b': {},
                    },
                },
                '/*z/b': {
                    '/*o*o*z/b': {},
                },
            },
        },
        {
            // ======================================== 3. ========================================
            // This case used to throw 'ERROR: Intersection of *a and a* cannot be expressed as a single predicate...'
            name: 'multipart intersections',
            predicates: [
                '**',
                'a*',
                '*a',
            ],

            // TODO: temp testing...
            eulerDiagram: {
                'a*': {
                    'a|a*a': {},
                },
                '*a': {
                    'a|a*a': {},
                },
            },
        },
        {
            // ======================================== 4. ========================================
            // This case caused v0.6.2 to hang computing an endless series of ever-longer synthesised intersections.
            name: 'non-terminating intersections',
            predicates: [
                '*A*B*',
                '*C*',
                'C*',
                'C*B',
            ],
            eulerDiagram: {
                '*A*B*': {
                    '*A*B*C*|*A*C*B*|*C*A*B*': {
                        'C*A*B*': {
                            'C*A*B': {},
                        },
                    },
                },
                '*C*': {
                    '*A*B*C*|*A*C*B*|*C*A*B*': {
                        'C*A*B*': {
                            'C*A*B': {},
                        },
                    },
                    'C*': {
                        'C*A*B*': {
                            'C*A*B': {},
                        },
                        'C*B': {
                            'C*A*B': {},
                        },
                    },
                    'C*B': {
                        'C*A*B': {},
                    },
                },
                'C*': {
                        'C*A*B*': {
                            'C*A*B': {},
                        },
                    'C*B': {
                        'C*A*B': {},
                    },
                },
                'C*B': {
                    'C*A*B': {},
                },
            },
        },
    ];

    tests.forEach(test => {
        it(test.name, () => {
            let expected: any = test.eulerDiagram;
            let actual: any;
            try {
                actual = setToObj(new EulerDiagram(test.predicates).universalSet);
            }
            catch (ex) {
                actual = 'ERROR: ' + ex.message;
                if (typeof expected === 'string' && expected.slice(-3) === '...') {
                    actual = actual.slice(0, expected.length - 3) + '...';
                }
            }
            expect(actual).deep.equal(expected);
        });
    });
});


/** Helper function that converts an EulerDiagram to a simple nested object with predicate sources for keys */
function setToObj(set: EulerSet): {} {
    return set.subsets.reduce((obj, subset) => (obj[subset.predicate.toString()] = setToObj(subset), obj), {});
}
