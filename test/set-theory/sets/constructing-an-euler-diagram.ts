import {expect} from 'chai';
import {EulerDiagram, EulerSet} from 'multimethods/math/sets';





describe('Constructing an euler diagram', () => {

    let tests = [
        // {
        //     // ======================================== 1. ========================================
        //     name: 'simple tree',
        //     predicates: [
        //         '/**',
        //         '/foo/*',
        //         '/bar/*',
        //         '/foo/bar',
        //     ],
        //     eulerDiagram: {
        //         '/**': {
        //             '/foo/*': {
        //                 '/foo/bar': {},
        //             },
        //             '/bar/*': {},
        //         },
        //     },
        // },
        // {
        //     // ======================================== 2. ========================================
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
        //                 '[/*o*o*.html]': {},
        //             },
        //         },
        //         '/**o**o**': {
        //             '[/*o*o*]': {
        //                 '/foo': {},
        //                 '[/*o*o*.html]': {},
        //             },
        //             '/**o**o**.html': {
        //                 '[/*o*o*.html]': {},
        //                 '/foo/*.html': {},
        //                 '[/a/*o*o*.html]': {},
        //             },
        //             '[/a/*o*o*]': {
        //                 '[/a/*o*o*.html]': {},
        //             },
        //             '[/*o*o*/b]': {
        //                 '[/*o*o*z/b]': {},
        //             },
        //         },
        //         '/a/*': {
        //             '[/a/*o*o*]': {
        //                 '[/a/*o*o*.html]': {},
        //             },
        //             '[/a/b]': {},
        //         },
        //         '/*/b': {
        //             '[/*o*o*/b]': {
        //                 '[/*o*o*z/b]': {},
        //             },
        //             '[/a/b]': {},
        //             '/*z/b': {
        //                 '[/*o*o*z/b]': {},
        //             },
        //         },
        //         '/*z/b': {
        //             '[/*o*o*z/b]': {},
        //         },
        //     },
        // },
        // {
        //     // ======================================== 3. ========================================
        //     // This case used to throw 'ERROR: Intersection of *a and a* cannot be expressed as a single predicate...'
        //     name: 'multipart intersections',
        //     predicates: [
        //         '**',
        //         'a*',
        //         '*a',
        //     ],
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
        //     // ======================================== 4. ========================================
        //     // This case caused v0.6.2 to hang computing an endless series of ever-longer synthesised intersections.
        //     name: 'high intersection complexity',
        //     predicates: [
        //         '*A*B*',
        //         '*C*',
        //         'C*',
        //         'C*B',
        //     ],
        //     eulerDiagram: {
        //         '*A*B*': {
        //             '[*A*B*C*|*A*C*B*|*C*A*B*]': {
        //                 '[C*A*B*]': {
        //                     '[C*A*B]': {},
        //                 },
        //             },
        //         },
        //         '*C*': {
        //             '[*A*B*C*|*A*C*B*|*C*A*B*]': {
        //                 '[C*A*B*]': {
        //                     '[C*A*B]': {},
        //                 },
        //             },
        //             'C*': {
        //                 '[C*A*B*]': {
        //                     '[C*A*B]': {},
        //                 },
        //                 'C*B': {
        //                     '[C*A*B]': {},
        //                 },
        //             },
        //             'C*B': {
        //                 '[C*A*B]': {},
        //             },
        //         },
        //         'C*': {
        //                 '[C*A*B*]': {
        //                     '[C*A*B]': {},
        //                 },
        //             'C*B': {
        //                 '[C*A*B]': {},
        //             },
        //         },
        //         'C*B': {
        //             '[C*A*B]': {},
        //         },
        //     },
        // },
        // {
        //     // ======================================== 5. ========================================
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
        //     // ======================================== 6. ========================================
        //     // This case took ~40 seconds to complete in v0.7.0. The given predicates produce a very large
        //     // number of valid intersections, which are eventually reduced down to those shown in the ED below.
        //     name: 'high intersection complexity II',
        //     predicates: [
        //         '*J*I*S*W*',
        //         '*A*W*',
        //         '*A*I*M*W*',
        //         '*W*',
        //     ],
        //     eulerDiagram: {
        //         '*W*': {
        //             '*A*I*M*W*': {
        //                 ['[*A*I*J*M*I*S*W*|*A*I*M*J*I*S*W*|*A*J*I*M*S*W*|*A*J*I*S*M*W*'
        //                 + '|*J*A*I*M*S*W*|*J*A*I*S*M*W*|*J*I*A*S*I*M*W*|*J*I*S*A*I*M*W*]']: {},
        //             },
        //             '*A*W*': {
        //                 '*A*I*M*W*': {
        //                     ['[*A*I*J*M*I*S*W*|*A*I*M*J*I*S*W*|*A*J*I*M*S*W*|*A*J*I*S*M*W*'
        //                     + '|*J*A*I*M*S*W*|*J*A*I*S*M*W*|*J*I*A*S*I*M*W*|*J*I*S*A*I*M*W*]']: {},
        //                 },
        //                 '[*A*J*I*S*W*|*J*A*I*S*W*|*J*I*A*S*W*|*J*I*S*A*W*]': {
        //                     ['[*A*I*J*M*I*S*W*|*A*I*M*J*I*S*W*|*A*J*I*M*S*W*|*A*J*I*S*M*W*'
        //                     + '|*J*A*I*M*S*W*|*J*A*I*S*M*W*|*J*I*A*S*I*M*W*|*J*I*S*A*I*M*W*]']: {},
        //                 },
        //             },
        //             '*J*I*S*W*': {
        //                 '[*A*J*I*S*W*|*J*A*I*S*W*|*J*I*A*S*W*|*J*I*S*A*W*]': {
        //                     ['[*A*I*J*M*I*S*W*|*A*I*M*J*I*S*W*|*A*J*I*M*S*W*|*A*J*I*S*M*W*'
        //                     + '|*J*A*I*M*S*W*|*J*A*I*S*M*W*|*J*I*A*S*I*M*W*|*J*I*S*A*I*M*W*]']: {},
        //                 },
        //             },
        //         },
        //     },
        // },





        {
            // ======================================== 7. ========================================
            // This test will combinatorially explode your engine if the `isUnreachable` option is not used. The
            // full set of intersections are orders of magnitude more complex to compute than in the previous
            // test. This demonstrates the effect of reducing the solution space using `isUnreachable`. As a result
            // of the reduced search space, this test completes in less time than the previous simpler one.
            name: 'high intersection complexity III',
            predicates: [
                '*A*I*S*W*',
                '*B*W*',
                '*A*I*M*W*',
                '*W*',
                '*B*M*W*',
                '*A*J*M*S*',
                '*A*T*W*',
                '*A*E*S*T*W*',
                '*B*I*M*S*T*U*W*Y*Z*',
                '*A*B*X*Z*',
                '*A*B*M*W*X*Y*',
                '*D*E*Q*',
            ],
            eulerDiagram: {
                '*W*': {
                    '*A*I*S*W*': {
                        '[*A*B*I*S*W*]': {
                            '[*A*B*I*M*S*W*]': {
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*I*S*W*X*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*W*X*Y*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*I*M*S*W*]': {
                            '[*A*B*I*M*S*W*]': {
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*I*J*M*S*W*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            },
                            '[*A*E*I*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*W*X*Y*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*I*J*M*S*W*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*I*S*T*W*]': {
                            '[*A*E*I*S*T*W*]': {
                                '[*A*E*I*M*S*T*W*]': {
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                },
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*E*I*S*T*W*]': {
                            '[*A*E*I*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            },
                        },
                        '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*I*S*W*X*Z*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*I*M*S*W*X*Y*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*D*E*I*Q*S*W*]': {},
                    },
                    '*B*W*': {
                        '[*A*B*I*S*W*]': {
                            '[*A*B*I*M*S*W*]': {
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*I*S*W*X*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*W*X*Y*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '*B*M*W*': {
                            '[*A*B*I*M*W*]': {
                                '[*A*B*I*M*S*W*]': {
                                    '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                        '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                        '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                    },
                                    '[*A*B*I*M*S*W*X*Y*]': {
                                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                    },
                                },
                                '[*A*B*I*M*W*X*Z*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*I*M*W*X*Y*]': {
                                    '[*A*B*I*M*S*W*X*Y*]': {
                                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                    },
                                },
                            },
                            '[*A*B*J*M*S*W*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*J*M*S*W*X*Y*]': {},
                            },
                            '[*A*B*M*T*W*]': {
                                '[*A*B*E*M*S*T*W*]': {
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                },
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*M*T*W*X*Y*]': {
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*E*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '*B*I*M*S*T*U*W*Y*Z*': {
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                            },
                            '[*A*B*M*W*X*Z*]': {
                                '[*A*B*I*M*W*X*Z*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*M*W*X*Y*Z*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '*A*B*M*W*X*Y*': {
                                '[*A*B*I*M*W*X*Y*]': {
                                    '[*A*B*I*M*S*W*X*Y*]': {
                                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                    },
                                },
                                '[*A*B*J*M*S*W*X*Y*]': {},
                                '[*A*B*M*T*W*X*Y*]': {
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                                '[*A*B*M*W*X*Y*Z*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                '[*A*B*D*E*M*Q*W*X*Y*]': {},
                            },
                            '[*B*D*E*M*Q*W*]': {
                                '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                                '[*A*B*D*E*M*Q*W*X*Y*]': {},
                            },
                        },
                        '[*A*B*J*M*S*W*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*J*M*S*W*X*Y*]': {},
                        },
                        '[*A*B*T*W*]': {
                            '[*A*B*M*T*W*]': {
                                '[*A*B*E*M*S*T*W*]': {
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                },
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*M*T*W*X*Y*]': {
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*E*S*T*W*]': {
                                '[*A*B*E*M*S*T*W*]': {
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                },
                                '[*A*B*E*S*T*W*X*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*T*W*X*Z*]': {
                                '[*A*B*E*S*T*W*X*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*M*T*W*X*Y*]': {
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*B*E*S*T*W*]': {
                            '[*A*B*E*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                        },
                        '*B*I*M*S*T*U*W*Y*Z*': {
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*B*W*X*Z*]': {
                            '[*A*B*I*S*W*X*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*M*W*X*Z*]': {
                                '[*A*B*I*M*W*X*Z*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*M*W*X*Y*Z*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*I*M*W*X*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*T*W*X*Z*]': {
                                '[*A*B*E*S*T*W*X*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*M*W*X*Y*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '*A*B*M*W*X*Y*': {
                            '[*A*B*I*M*W*X*Y*]': {
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*J*M*S*W*X*Y*]': {},
                            '[*A*B*M*T*W*X*Y*]': {
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                            '[*A*B*M*W*X*Y*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            '[*A*B*D*E*M*Q*W*X*Y*]': {},
                        },
                        '[*B*D*E*Q*W*]': {
                            '[*B*D*E*M*Q*W*]': {
                                '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                                '[*A*B*D*E*M*Q*W*X*Y*]': {},
                            },
                        },
                    },
                    '*A*I*M*W*': {
                        '[*A*I*M*S*W*]': {
                            '[*A*B*I*M*S*W*]': {
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*I*J*M*S*W*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            },
                            '[*A*E*I*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*W*X*Y*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*B*I*M*W*]': {
                            '[*A*B*I*M*S*W*]': {
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*I*M*W*X*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*I*M*W*X*Y*]': {
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                        },
                        '[*A*I*J*M*S*W*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*I*M*T*W*]': {
                            '[*A*E*I*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*E*I*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*I*M*W*X*Z*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*I*M*W*X*Y*]': {
                            '[*A*B*I*M*S*W*X*Y*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*D*E*I*M*Q*W*]': {},
                    },
                    '*B*M*W*': {
                        '[*A*B*I*M*W*]': {
                            '[*A*B*I*M*S*W*]': {
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*I*M*W*X*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*I*M*W*X*Y*]': {
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                        },
                        '[*A*B*J*M*S*W*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*J*M*S*W*X*Y*]': {},
                        },
                        '[*A*B*M*T*W*]': {
                            '[*A*B*E*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*M*T*W*X*Y*]': {
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*B*E*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                        },
                        '*B*I*M*S*T*U*W*Y*Z*': {
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*B*M*W*X*Z*]': {
                            '[*A*B*I*M*W*X*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*M*W*X*Y*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '*A*B*M*W*X*Y*': {
                            '[*A*B*I*M*W*X*Y*]': {
                                '[*A*B*I*M*S*W*X*Y*]': {
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*J*M*S*W*X*Y*]': {},
                            '[*A*B*M*T*W*X*Y*]': {
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                            '[*A*B*M*W*X*Y*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            '[*A*B*D*E*M*Q*W*X*Y*]': {},
                        },
                        '[*B*D*E*M*Q*W*]': {
                            '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                            '[*A*B*D*E*M*Q*W*X*Y*]': {},
                        },
                    },
                    '[*A*J*M*S*W*]': {
                        '[*A*I*J*M*S*W*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*B*J*M*S*W*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*J*M*S*W*X*Y*]': {},
                        },
                        '[*A*J*M*S*T*W*]': {
                            '[*A*E*J*M*S*T*W*]': {},
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*E*J*M*S*T*W*]': {},
                        '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        '[*A*B*J*M*S*W*X*Y*]': {},
                    },
                    '*A*T*W*': {
                        '[*A*I*S*T*W*]': {
                            '[*A*E*I*S*T*W*]': {
                                '[*A*E*I*M*S*T*W*]': {
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                },
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*B*T*W*]': {
                            '[*A*B*M*T*W*]': {
                                '[*A*B*E*M*S*T*W*]': {
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                },
                                '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                    '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                                '[*A*B*M*T*W*X*Y*]': {
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                                },
                            },
                            '[*A*B*E*S*T*W*]': {
                                '[*A*B*E*M*S*T*W*]': {
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                },
                                '[*A*B*E*S*T*W*X*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*T*W*X*Z*]': {
                                '[*A*B*E*S*T*W*X*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*M*T*W*X*Y*]': {
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*I*M*T*W*]': {
                            '[*A*E*I*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*B*M*T*W*]': {
                            '[*A*B*E*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*M*T*W*X*Y*]': {
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*J*M*S*T*W*]': {
                            '[*A*E*J*M*S*T*W*]': {},
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        },
                        '*A*E*S*T*W*': {
                            '[*A*E*I*S*T*W*]': {
                                '[*A*E*I*M*S*T*W*]': {
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                },
                            },
                            '[*A*B*E*S*T*W*]': {
                                '[*A*B*E*M*S*T*W*]': {
                                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                                },
                                '[*A*B*E*S*T*W*X*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*E*I*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            },
                            '[*A*B*E*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*E*J*M*S*T*W*]': {},
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                            '[*A*D*E*Q*S*T*W*]': {},
                        },
                        '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*T*W*X*Z*]': {
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*M*T*W*X*Y*]': {
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*D*E*Q*T*W*]': {
                            '[*A*D*E*Q*S*T*W*]': {},
                        },
                    },
                    '*A*E*S*T*W*': {
                        '[*A*E*I*S*T*W*]': {
                            '[*A*E*I*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            },
                        },
                        '[*A*B*E*S*T*W*]': {
                            '[*A*B*E*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                        },
                        '[*A*E*I*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*B*E*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                        },
                        '[*A*E*J*M*S*T*W*]': {},
                        '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        '[*A*B*E*S*T*W*X*Z*]': {},
                        '[*A*B*E*M*S*T*W*X*Y*]': {},
                        '[*A*D*E*Q*S*T*W*]': {},
                    },
                    '*B*I*M*S*T*U*W*Y*Z*': {
                        '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                    },
                    '[*A*B*W*X*Z*]': {
                        '[*A*B*I*S*W*X*Z*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*M*W*X*Z*]': {
                            '[*A*B*I*M*W*X*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*M*W*X*Y*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*B*I*M*W*X*Z*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*T*W*X*Z*]': {
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*E*S*T*W*X*Z*]': {},
                        '[*A*B*M*W*X*Y*Z*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                    },
                    '*A*B*M*W*X*Y*': {
                        '[*A*B*I*M*W*X*Y*]': {
                            '[*A*B*I*M*S*W*X*Y*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*B*J*M*S*W*X*Y*]': {},
                        '[*A*B*M*T*W*X*Y*]': {
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*E*M*S*T*W*X*Y*]': {},
                        '[*A*B*M*W*X*Y*Z*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        '[*A*B*D*E*M*Q*W*X*Y*]': {},
                    },
                    '[*D*E*Q*W*]': {
                        '[*A*D*E*I*Q*S*W*]': {},
                        '[*B*D*E*Q*W*]': {
                            '[*B*D*E*M*Q*W*]': {
                                '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                                '[*A*B*D*E*M*Q*W*X*Y*]': {},
                            },
                        },
                        '[*A*D*E*I*M*Q*W*]': {},
                        '[*B*D*E*M*Q*W*]': {
                            '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                            '[*A*B*D*E*M*Q*W*X*Y*]': {},
                        },
                        '[*A*D*E*Q*T*W*]': {
                            '[*A*D*E*Q*S*T*W*]': {},
                        },
                        '[*A*D*E*Q*S*T*W*]': {},
                        '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                        '[*A*B*D*E*M*Q*W*X*Y*]': {},
                    },
                },
                '*A*J*M*S*': {
                    '[*A*J*M*S*W*]': {
                        '[*A*I*J*M*S*W*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*B*J*M*S*W*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*J*M*S*W*X*Y*]': {},
                        },
                        '[*A*J*M*S*T*W*]': {
                            '[*A*E*J*M*S*T*W*]': {},
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*E*J*M*S*T*W*]': {},
                        '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        '[*A*B*J*M*S*W*X*Y*]': {},
                    },
                    '[*A*B*J*M*S*X*Z*]': {},
                    '[*A*B*J*M*S*W*X*Y*]': {},
                    '[*A*D*E*J*M*Q*S*]': {},
                },
                '*A*T*W*': {
                    '[*A*I*S*T*W*]': {
                        '[*A*E*I*S*T*W*]': {
                            '[*A*E*I*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            },
                        },
                        '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                    },
                    '[*A*B*T*W*]': {
                        '[*A*B*M*T*W*]': {
                            '[*A*B*E*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                                '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*M*T*W*X*Y*]': {
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*B*E*S*T*W*]': {
                            '[*A*B*E*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                        },
                        '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*T*W*X*Z*]': {
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*M*T*W*X*Y*]': {
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                    },
                    '[*A*I*M*T*W*]': {
                        '[*A*E*I*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                    },
                    '[*A*B*M*T*W*]': {
                        '[*A*B*E*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                        },
                        '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                            '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*M*T*W*X*Y*]': {
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                    },
                    '[*A*J*M*S*T*W*]': {
                        '[*A*E*J*M*S*T*W*]': {},
                        '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                    },
                    '*A*E*S*T*W*': {
                        '[*A*E*I*S*T*W*]': {
                            '[*A*E*I*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            },
                        },
                        '[*A*B*E*S*T*W*]': {
                            '[*A*B*E*M*S*T*W*]': {
                                '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                                '[*A*B*E*M*S*T*W*X*Y*]': {},
                            },
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                        },
                        '[*A*E*I*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        },
                        '[*A*B*E*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                        },
                        '[*A*E*J*M*S*T*W*]': {},
                        '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        '[*A*B*E*S*T*W*X*Z*]': {},
                        '[*A*B*E*M*S*T*W*X*Y*]': {},
                        '[*A*D*E*Q*S*T*W*]': {},
                    },
                    '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                        '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                    },
                    '[*A*B*T*W*X*Z*]': {
                        '[*A*B*E*S*T*W*X*Z*]': {},
                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                    },
                    '[*A*B*M*T*W*X*Y*]': {
                        '[*A*B*E*M*S*T*W*X*Y*]': {},
                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                    },
                    '[*A*D*E*Q*T*W*]': {
                        '[*A*D*E*Q*S*T*W*]': {},
                    },
                },
                '*A*E*S*T*W*': {
                    '[*A*E*I*S*T*W*]': {
                        '[*A*E*I*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        },
                    },
                    '[*A*B*E*S*T*W*]': {
                        '[*A*B*E*M*S*T*W*]': {
                            '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                            '[*A*B*E*M*S*T*W*X*Y*]': {},
                        },
                        '[*A*B*E*S*T*W*X*Z*]': {},
                        '[*A*B*E*M*S*T*W*X*Y*]': {},
                    },
                    '[*A*E*I*M*S*T*W*]': {
                        '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                    },
                    '[*A*B*E*M*S*T*W*]': {
                        '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        '[*A*B*E*M*S*T*W*X*Y*]': {},
                    },
                    '[*A*E*J*M*S*T*W*]': {},
                    '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                    '[*A*B*E*S*T*W*X*Z*]': {},
                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                    '[*A*D*E*Q*S*T*W*]': {},
                },
                '*B*I*M*S*T*U*W*Y*Z*': {
                    '[*A*B*I*M*S*T*U*W*Y*Z*]': {
                        '[*A*B*I*J*M*S*T*U*W*Y*Z*]': {},
                        '[*A*B*E*I*M*S*T*U*W*Y*Z*]': {},
                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                    },
                    '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                },
                '*A*B*X*Z*': {
                    '[*A*B*W*X*Z*]': {
                        '[*A*B*I*S*W*X*Z*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*M*W*X*Z*]': {
                            '[*A*B*I*M*W*X*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                            '[*A*B*M*W*X*Y*Z*]': {
                                '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                            },
                        },
                        '[*A*B*I*M*W*X*Z*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*T*W*X*Z*]': {
                            '[*A*B*E*S*T*W*X*Z*]': {},
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                        '[*A*B*E*S*T*W*X*Z*]': {},
                        '[*A*B*M*W*X*Y*Z*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                    },
                    '[*A*B*J*M*S*X*Z*]': {},
                    '[*A*B*T*W*X*Z*]': {
                        '[*A*B*E*S*T*W*X*Z*]': {},
                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                    },
                    '[*A*B*E*S*T*W*X*Z*]': {},
                    '[*A*B*M*W*X*Y*Z*]': {
                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                    },
                    '[*A*B*D*E*Q*X*Z*]': {},
                },
                '*A*B*M*W*X*Y*': {
                    '[*A*B*I*M*W*X*Y*]': {
                        '[*A*B*I*M*S*W*X*Y*]': {
                            '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                        },
                    },
                    '[*A*B*J*M*S*W*X*Y*]': {},
                    '[*A*B*M*T*W*X*Y*]': {
                        '[*A*B*E*M*S*T*W*X*Y*]': {},
                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                    },
                    '[*A*B*E*M*S*T*W*X*Y*]': {},
                    '[*A*B*M*W*X*Y*Z*]': {
                        '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                    },
                    '[*A*B*I*M*S*T*U*W*X*Y*Z*]': {},
                    '[*A*B*D*E*M*Q*W*X*Y*]': {},
                },
                '*D*E*Q*': {
                    '[*D*E*Q*W*]': {
                        '[*A*D*E*I*Q*S*W*]': {},
                        '[*B*D*E*Q*W*]': {
                            '[*B*D*E*M*Q*W*]': {
                                '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                                '[*A*B*D*E*M*Q*W*X*Y*]': {},
                            },
                        },
                        '[*A*D*E*I*M*Q*W*]': {},
                        '[*B*D*E*M*Q*W*]': {
                            '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                            '[*A*B*D*E*M*Q*W*X*Y*]': {},
                        },
                        '[*A*D*E*Q*T*W*]': {
                            '[*A*D*E*Q*S*T*W*]': {},
                        },
                        '[*A*D*E*Q*S*T*W*]': {},
                        '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                        '[*A*B*D*E*M*Q*W*X*Y*]': {},
                    },
                    '[*A*D*E*J*M*Q*S*]': {},
                    '[*A*D*E*Q*T*W*]': {
                        '[*A*D*E*Q*S*T*W*]': {},
                    },
                    '[*A*D*E*Q*S*T*W*]': {},
                    '[*B*D*E*I*M*Q*S*T*U*W*Y*Z*]': {},
                    '[*A*B*D*E*Q*X*Z*]': {},
                    '[*A*B*D*E*M*Q*W*X*Y*]': {},
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
//console.log(JSON.stringify(actual, null, 4));
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
