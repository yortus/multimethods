import {expect} from 'chai';
import {Predicate, Taxonomy, TaxonomyNode} from 'multimethods';


describe('Constructing a Taxonomy instance', () => {

    let tests = [
        {
            // ======================================== 1. ========================================
            name: 'simple tree',
            predicates: [
                '/...',
                '/foo/*',
                '/bar/*',
                '/foo/bar'
            ],
            taxonomy: {
                "/…": {
                    "/foo/*": {
                        "/foo/bar": {}
                    },
                    "/bar/*": {}
                }
            }
        },
        {
            // ======================================== 2. ========================================
            name: 'impossible intersections',
            predicates: [
                '...',
                'a*',
                '*a',
            ],

            // TODO: temp testing...
            taxonomy: {
                'a*': {
                    'a': {},
                    'a*a': {}
                },
                '*a': {
                    'a': {},
                    'a*a': {}
                }
            }

            // TODO: was...
            // taxonomy: 'ERROR: Intersection of *a and a* cannot be expressed as a single predicate...'
        },
        {
            // ======================================== 3. ========================================
            name: 'complex DAG',
            predicates: [
                'a*',
                '*m*',
                '*z',
                '...',
                '/bar',
                '/*',
                '/foo',
                '/foo/*.html',
                '/…o…o….html',
                '/...o...o...',
                '/bar',
                'a*',
                '/a/*',
                '/*/b',
                '/*z/b',
            ],
            taxonomy: {
                "a*": {
                    "a*m*": {
                        "a*m*z": {}
                    },
                    "a*z": {
                        "a*m*z": {}
                    }
                },
                "*m*": {
                    "a*m*": {
                        "a*m*z": {}
                    },
                    "*m*z": {
                        "a*m*z": {}
                    }
                },
                "*z": {
                    "a*z": {
                        "a*m*z": {}
                    },
                    "*m*z": {
                        "a*m*z": {}
                    }
                },
                "/*": {
                    "/bar": {},
                    "/*o*o*": {
                        "/foo": {},
                        "/*o*o*.html": {}
                    }
                },
                "/…o…o…": {
                    "/*o*o*": {
                        "/foo": {},
                        "/*o*o*.html": {}
                    },
                    "/…o…o….html": {
                        "/*o*o*.html": {},
                        "/foo/*.html": {},
                        "/a/*o*o*.html": {}
                    },
                    "/a/*o*o*": {
                        "/a/*o*o*.html": {}
                    },
                    "/*o*o*/b": {
                        "/*o*o*z/b": {}
                    }
                },
                "/a/*": {
                    "/a/*o*o*": {
                        "/a/*o*o*.html": {}
                    },
                    "/a/b": {}
                },
                "/*/b": {
                    "/*o*o*/b": {
                        "/*o*o*z/b": {}
                    },
                    "/a/b": {},
                    "/*z/b": {
                        "/*o*o*z/b": {}
                    }
                },
                "/*z/b": {
                    "/*o*o*z/b": {}
                }
            }
        }
    ];

    tests.forEach(test => {
        it(test.name, () => {
            let predicates = test.predicates.map(ps => new Predicate(ps));
            let expected: any = test.taxonomy;
            let actual: any;
            try {
                actual = nodeToObj(new Taxonomy(predicates).rootNode);
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


/** Helper function that converts a Taxonomy to a simple nested object with predicate sources for keys */
function nodeToObj(node: TaxonomyNode): {} {
    return node.specializations.reduce((obj, node) => (obj[node.predicate.toString()] = nodeToObj(node), obj), {});
}
