import {expect} from 'chai';
import {Multimethod, UnaryMultimethod, BinaryMultimethod, TernaryMultimethod, VariadicMultimethod} from 'multimethods';




// TODO: ...
describe('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Constructing a Multimethod instance', () => {

    let arities: Array<1|2|3|'variadic'> = [undefined, 1, 2, 3, 'variadic'];
    let timings: Array<'mixed'|'async'|'sync'> = [undefined, 'mixed', 'async', 'sync'];


    arities.forEach(arity => {
        timings.forEach(timing => {

            it(`{arity: ${JSON.stringify(arity)}, timing: ${JSON.stringify(timing)}}`, () => {


                let mm = new Multimethod({
                    arity,
                    timing
                });

                // instanceof checks
                expect(mm).instanceof(Function);
                expect(mm).instanceof(Multimethod);


                // TODO: restore these... not working yet...
                // switch (arity) {
                //     case 1:
                //         expect(mm).instanceof(UnaryMultimethod);
                //         expect(mm instanceof UnaryMultimethod).to.be.true;
                //         break;
                //     case 2: expect(mm).instanceof(BinaryMultimethod); break;
                //     case 3: expect(mm).instanceof(TernaryMultimethod); break;
                //     case 'variadic': expect(mm).instanceof(VariadicMultimethod); break;
                // }

                // Function checks
// TODO: ...
//                expect(mm.length).equals(typeof arity === 'number' ? arity : 0);

            });
        });
    });



    // TODO: ...
    let tests = [
        () => new Multimethod({})

    ];



    // TODO: ...
    it('...', () => {




        // EXAMPLES / TESTS
        // TODO: temp testing...
        function test() {


            let mm0 = new Multimethod({ // mixed variadic
                arity: 'variadic',
                timing: 'mixed',
                toDiscriminant: ([$0]) => '',
                methods: {
                    '/foo': async ([x]) => 42,
                    '/bar': async ([x]) => 42,
                }
            });
            let result0 = mm0('foo');


            let mm1 = new Multimethod<string, string>({ // async unary
                arity: 1,
                timing: 'async',
                methods: {
                    '/foo': async (x, {n}, next) => '42',
                    '/bar': async (x) => '42',
                }
            });
            mm1.add('/foo', async (x, {n}, next) => '42');
            let result1 = mm1('foo');


            let mm2 = new UnaryMultimethod({ // sync unary
                //arity: 1,
                timing: 'sync',
                methods: {
                    '/foo': (x: string) => '42',
                    '/bar': (x: string) => '42'
                }
            });
            mm2.add({'/baz': (a) => '42'});
            let result2 = mm2('foo');


            let mm3 = new Multimethod({ // async unary
                arity: 1,
                timing: 'async',
                methods: {
                    '/foo': async (x: string) => '42',
                    '/bar': async (x: string) => '42',
                }
            });
            let result3 = mm3('foo');


            let mm4 = new BinaryMultimethod({ // mixed binary
                //arity: 2,
                //timing: 'async',
                methods: {
                    '/foo': async (x: string, y: number, {}) => '42',
                    '/bar': async (x: string, y: number, {}, next: any) => '42',
                }
            });
            let result4 = mm4('foo', 720);


            let mm5 = new Multimethod({ // mixed ternary
                arity: 3,
                //timing: 'async',
                methods: {
                    '/foo': (x, y, z, {n}) => '42',
                    '/bar': async (x, y, z, {n}) => '42',
                }
            });
            let result5 = mm5('foo', 'bar', 'baz');


            let mm = new Multimethod({}); // untyped
            mm(42, 24);
        }


        function test2() {

            let m1 = new Multimethod(); // untyped
            let r1 = m1(42, 24);
            
            let m2 = new UnaryMultimethod();
            let r2 = m2(43);

            let m3 = new BinaryMultimethod();
            let r3 = m3(42, 24);

            let m4 = new TernaryMultimethod();
            let r4 = m4(42, 24, 2);

            let m5 = new VariadicMultimethod();
            let r5 = m5(42, 24); // TODO: should NOT typecheck!
        }





    });
});
