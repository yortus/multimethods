import {expect} from 'chai';
import {NormalPredicate} from 'multimethods/math/predicates';
import {EulerDiagram, EulerSet} from 'multimethods/math/sets';





describe('Constructing an euler diagram', () => {

    let tests = [
        // {
        //     // ================================================================================
        //     name: 'simple tree',
        //     predicates: [
        //         '/**',
        //         '/foo/*',
        //         '/bar/*',
        //         '/foo/bar',
        //     ],
        //     unreachable: undefined,
        //     eulerDiagram: {
        //         '/**': {
        //             '/foo/*': {
        //                 '/foo/bar': {},
        //             },
        //             '/bar/*': {},
        //         },
        //     },
        // },
        {
            // ================================================================================
            name: 'simple tree II',
            predicates: [
                '*A*',
                '*B*',
                '*B*C*',
                '*A*B*C*D*',
            ],
            unreachable: isUnreachable,
            eulerDiagram: {
                '*A*': {
                    '[*A*B*]': {
                        //TODO: BUG!: If we arrive here with 'ABCD', it's treated as ambiguous but it's not!
                    },
                },
                '*B*': {
                    '*B*C*': {
                        '[*A*B*C*]': {
                            '*A*B*C*D*': {},
                        },
                    },
                    '[*A*B*]': {
                        //TODO: BUG!: If we arrive here with 'ABCD', it's treated as ambiguous but it's not!
                    },
                },
            },
        },
        // {
        //     // ================================================================================
        //     name: 'complex DAG',
        //     predicates: [
        //         '∅',
        //         'a*',
        //         '*m*',
        //         '*z',
        //         '**',
        //         '/bar',
        //         '/*',
        //         '/foo',
        //         '/foo/*.html',
        //         '/**o**o**.html',
        //         '/**o**o**',
        //         '/bar',
        //         'a*',
        //         '/a/*',
        //         '/*/b',
        //         '/*z/b',
        //     ],
        //     unreachable: undefined,
        //     eulerDiagram: {
        //         'a*': {
        //             '[a*m*]': {},
        //             '[a*z]': {},
        //         },
        //         '*m*': {
        //             '[a*m*]': {},
        //             '[*m*z]': {},
        //         },
        //         '*z': {
        //             '[a*z]': {},
        //             '[*m*z]': {},
        //         },
        //         '/*': {
        //             '/bar': {},
        //             '[/*o*o*]': {
        //                 '/foo': {},
        //             },
        //         },
        //         '/**o**o**': {
        //             '[/*o*o*]': {
        //                 '/foo': {},
        //             },
        //             '/**o**o**.html': {
        //                 '[/*o*o*.html]': {},
        //                 '/foo/*.html': {},
        //                 '[/a/*o*o*.html]': {},
        //             },
        //             '[/a/*o*o*]': {
        //             },
        //             '[/*o*o*/b]': {
        //             },
        //         },
        //         '/a/*': {
        //             '[/a/*o*o*]': {
        //             },
        //             '[/a/b]': {},
        //         },
        //         '/*/b': {
        //             '[/*o*o*/b]': {
        //             },
        //             '[/a/b]': {},
        //             '/*z/b': {
        //                 '[/*o*o*z/b]': {},
        //             },
        //         },
        //     },
        // },
        // {
        //     // ================================================================================
        //     // This case used to throw 'ERROR: Intersection of *a and a* cannot be expressed as a single predicate...'
        //     name: 'multipart intersections',
        //     predicates: [
        //         '**',
        //         'a*',
        //         '*a',
        //     ],
        //     unreachable: undefined,
        //     eulerDiagram: {
        //         'a*': {
        //             '[a|a*a]': {},
        //         },
        //         '*a': {
        //             '[a|a*a]': {},
        //         },
        //     },
        // },
        // {
        //     // ================================================================================
        //     // This case caused v0.6.2 to hang computing an endless series of ever-longer synthesised intersections.
        //     name: 'high intersection complexity',
        //     predicates: [
        //         '*A*B*',
        //         '*C*',
        //         'C*',
        //         'C*B',
        //     ],
        //     unreachable: undefined,
        //     eulerDiagram: {
        //         '*A*B*': {
        //             '[*A*B*C*|*A*C*B*|*C*A*B*]': {
        //             },
        //         },
        //         '*C*': {
        //             '[*A*B*C*|*A*C*B*|*C*A*B*]': {
        //             },
        //             'C*': {
        //                 '[C*A*B*]': {
        //                 },
        //                 'C*B': {
        //                     '[C*A*B]': {},
        //                 },
        //             },
        //         },
        //     },
        // },
        // {
        //     // ================================================================================
        //     name: 'alternations',
        //     predicates: [
        //         'a|b|c',
        //         'b|c|d',
        //         'a',
        //         'b',
        //         'a*|*a',
        //         '**c**|*',
        //         '**b**|**',
        //     ],
        //     unreachable: undefined,
        //     eulerDiagram: {
        //         '*|**c**': {
        //             'a|b|c': {
        //                 '[b|c]': {
        //                     b: {},
        //                 },
        //                 'a': {},
        //             },
        //             'b|c|d': {
        //                 '[b|c]': {
        //                     b: {},
        //                 },
        //             },
        //             '*a|a*': {
        //                 a: {},
        //             },
        //         },
        //     },
        // },
        // {
        //     // ================================================================================
        //     // This case took ~40 seconds to complete in v0.7.0. The given predicates produce a very large
        //     // number of valid intersections, which are eventually reduced down to those shown in the ED below.
        //     name: 'high intersection complexity II',
        //     predicates: [
        //         '*J*I*S*W*',
        //         '*A*W*',
        //         '*A*I*M*W*',
        //         '*W*',
        //     ],
        //     unreachable: undefined,
        //     eulerDiagram: {
        //         '*W*': {
        //             '*A*W*': {
        //                 '*A*I*M*W*': {
        //                     ['[*A*I*J*M*I*S*W*|*A*I*M*J*I*S*W*|*A*J*I*M*S*W*|*A*J*I*S*M*W*'
        //                     + '|*J*A*I*M*S*W*|*J*A*I*S*M*W*|*J*I*A*S*I*M*W*|*J*I*S*A*I*M*W*]']: {},
        //                 },
        //                 '[*A*J*I*S*W*|*J*A*I*S*W*|*J*I*A*S*W*|*J*I*S*A*W*]': {
        //                 },
        //             },
        //             '*J*I*S*W*': {
        //                 '[*A*J*I*S*W*|*J*A*I*S*W*|*J*I*A*S*W*|*J*I*S*A*W*]': {
        //                 },
        //             },
        //         },
        //     },
        // },
        // {
        //     // ================================================================================
        //     // This test will combinatorially explode your engine if the `isUnreachable` option is not used. The
        //     // full set of intersections are orders of magnitude more complex to compute than in the previous
        //     // test. This demonstrates the effect of reducing the solution space using `isUnreachable`. As a result
        //     // of the reduced search space, this test completes in less time than the previous simpler one.
        //     name: 'high intersection complexity III',
        //     predicates: [
        //         '*A*I*S*W*',
        //         '*B*W*',
        //         '*A*I*M*W*',
        //         '*W*',
        //         '*B*M*W*',
        //         '*A*J*M*S*',
        //         '*A*T*W*',
        //         '*A*E*S*T*W*',
        //         '*B*I*M*S*T*U*W*Y*Z*',
        //         '*A*B*X*Z*',
        //         '*A*B*M*W*X*Y*',
        //         '*D*E*Q*',
        //     ],
        //     unreachable: isUnreachable,
        //     eulerDiagram: {
        //         '*W*': {
        //             '*A*I*S*W*': {
        //                 '[*A*B*I*S*W*]': {},
        //                 '[*A*I*M*S*W*]': {},
        //                 '[*A*I*J*M*S*W*]': {},
        //                 '[*A*I*S*T*W*]': {},
        //                 '[*A*B*I*S*W*X*Z*]': {},
        //                 '[*A*D*E*I*Q*S*W*]': {},
        //             },
        //             '*B*W*': {
        //                 '*B*M*W*': {
        //                     '*B*I*M*S*T*U*W*Y*Z*': {
        //                         '[*A*B*I*M*S*T*U*W*Y*Z*]': {},
        //                         '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
        //                         '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
        //                         '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
        //                         '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
        //                     },
        //                     '*A*B*M*W*X*Y*': {
        //                         '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
        //                         '[*A*B*I*M*S*W*X*Y*]': {},
        //                         '[*A*B*I*M*W*X*Y*]': {},
        //                         '[*A*B*J*M*S*W*X*Y*]': {},
        //                         '[*A*B*M*T*W*X*Y*]': {},
        //                         '[*A*B*E*M*S*T*W*X*Y*]': {},
        //                         '[*A*B*M*W*X*Y*Z*]': {},
        //                         '[*A*B*D*E*M*Q*W*X*Y*]': {},
        //                     },
        //                     '[*A*B*I*M*W*]': {},
        //                     '[*A*B*I*M*S*W*]': {},
        //                     '[*A*B*J*M*S*W*]': {},
        //                     '[*A*B*M*T*W*]': {},
        //                     '[*A*B*E*M*S*T*W*]': {},
        //                     '[*A*B*I*M*W*X*Z*]': {},
        //                     '[*A*B*M*W*X*Z*]': {},
        //                     '[*B*D*E*M*Q*W*]': {},
        //                 },
        //                 '[*A*B*I*S*W*]': {},
        //                 '[*A*B*T*W*]': {},
        //                 '[*A*B*I*S*W*X*Z*]': {},
        //                 '[*A*B*W*X*Z*]': {},
        //                 '[*A*B*T*W*X*Z*]': {},
        //                 '[*B*D*E*Q*W*]': {},
        //             },
        //             '*A*I*M*W*': {
        //                 '[*A*I*M*S*W*]': {},
        //                 '[*A*I*J*M*S*W*]': {},
        //                 '[*A*I*M*T*W*]': {},
        //                 '[*A*D*E*I*M*Q*W*]': {},
        //             },
        //             '*A*T*W*': {
        //                 '*A*E*S*T*W*': {
        //                     '[*A*E*I*S*T*W*]': {},
        //                     '[*A*B*E*S*T*W*]': {},
        //                     '[*A*E*I*M*S*T*W*]': {},
        //                     '[*A*B*E*M*S*T*W*]': {},
        //                     '[*A*E*J*M*S*T*W*]': {},
        //                     '[*A*B*E*S*T*W*X*Z*]': {},
        //                     '[*A*D*E*Q*S*T*W*]': {},
        //                 },
        //                 '[*A*I*S*T*W*]': {},
        //                 '[*A*B*T*W*]': {},
        //                 '[*A*I*M*T*W*]': {},
        //                 '[*A*J*M*S*T*W*]': {},
        //                 '[*A*B*T*W*X*Z*]': {},
        //                 '[*A*D*E*Q*T*W*]': {},
        //             },
        //             '[*A*J*M*S*W*]': {},
        //             '[*D*E*Q*W*]': {},
        //         },
        //         '*A*J*M*S*': {
        //             '[*A*J*M*S*W*]': {},
        //             '[*A*B*J*M*S*X*Z*]': {},
        //             '[*A*D*E*J*M*Q*S*]': {},
        //         },
        //         '*A*B*X*Z*': {
        //             '[*A*B*J*M*S*X*Z*]': {},
        //             '[*A*B*D*E*Q*X*Z*]': {},
        //         },
        //         '*D*E*Q*': {
        //             '[*D*E*Q*W*]': {},
        //             '[*A*D*E*J*M*Q*S*]': {},
        //             '[*A*B*D*E*Q*X*Z*]': {},
        //         },
        //     },
        // },
    ];

    tests.forEach(test => {
        it(test.name, () => {
            let expected: any = test.eulerDiagram;
            let actual: any;
            try {
                actual = setToObj(new EulerDiagram(test.predicates, test.unreachable).universalSet);
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
    return set.subsets.reduce(
        (obj, subset) => {
            let key = subset.predicate as string;
            if (!subset.isPrincipal) key = `[${key}]`;
            obj[key] = setToObj(subset);
            return obj;
        },
        {}
    );
}





// TODO: temp testing...
function isUnreachable(p: NormalPredicate) {

    // Only consider the form *A*B*C*...*
    if (p.length < 3) return;
    if (p.charAt(0) !== '*' || p.charAt(p.length - 1) !== '*') return;
    if (p.indexOf('**') !== -1 || p.indexOf('/') !== -1) return;

    // If the parts aren't strictly ordered, it's unreachable
    let parts = p.slice(1, -1).split('*');
    for (let i = 0, j = 1; j < parts.length; ++i, ++j) {
        if (parts[i] >= parts[j]) return true;
    }
    return;
}
