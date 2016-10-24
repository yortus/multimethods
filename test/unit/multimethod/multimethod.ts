import {expect} from 'chai';
import {Multimethod, UnaryMultimethod, BinaryMultimethod, TernaryMultimethod, VariadicMultimethod} from 'multimethods';





// TODO: ...
describe('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Constructing a Multimethod instance', () => {





// TODO: temp testing...
it('???????????????????????????????????????????????', () => {
    debugger;
    let mm = new UnaryMultimethod({
        arity: 1,
        rules: {
            '/{thing}': ({thing}, x) => x,
            '/foo':     (ctx, x) => 'foo' + x,
            '/bar':     (ctx, x) => 'bar' + x,
        }
    });
    let result = mm('/foo');
});



//     let arities = [undefined, 0, 1, 2, 3, 4, 5];
//     let timings: Array<'mixed'|'async'|'sync'|undefined> = [undefined, 'mixed', 'async', 'sync'];


//     arities.forEach(arity => {
//         timings.forEach(timing => {

//             it(`{arity: ${JSON.stringify(arity)}, timing: ${JSON.stringify(timing)}}`, () => {


//                 // let mm = new Multimethod({
//                 //     arity,
//                 //     timing
//                 // });

//                 // // instanceof checks
//                 // expect(mm).instanceof(Function);
//                 // expect(mm).instanceof(Multimethod);


//                 // TODO: restore these... not working yet...
//                 // switch (arity) {
//                 //     case 1:
//                 //         expect(mm).instanceof(UnaryMultimethod);
//                 //         expect(mm instanceof UnaryMultimethod).to.be.true;
//                 //         break;
//                 //     case 2: expect(mm).instanceof(BinaryMultimethod); break;
//                 //     case 3: expect(mm).instanceof(TernaryMultimethod); break;
//                 //     case 'variadic': expect(mm).instanceof(VariadicMultimethod); break;
//                 // }

//                 // Function checks
// // TODO: ...
// //                expect(mm.length).equals(typeof arity === 'number' ? arity : 0);

//             });
//         });
//     });



    // TODO: ...
    let tests = [
        () => new Multimethod({})

    ];



    // // TODO: ...
    // it('...', () => {




    //     // EXAMPLES / TESTS
    //     // TODO: temp testing...
    //     function test() {


    //         let mmx = new Multimethod({ // mixed variadic
    //             //arity: undefined, // uncomment and it becomes UnaryMultimethod (except if using --strictNullChecks)
    //         });
    //         let resultx = mmx('foo');
    //         resultx = mmx('foo', 42, 'bar'); // OK, variadic


    //         let mm0 = new Multimethod({ // mixed variadic
    //             arity: undefined, // or don't give this key at all
    //             timing: 'mixed',
    //             toDiscriminant: ([$0]) => '',
    //             methods: {
    //                 '/foo': async (_, x) => 42,
    //                 '/bar': async (_, x) => 42,
    //                 '/baz': async (_, x, y, z, w) => 42,
    //             }
    //         });
    //         let result0 = mm0('foo');
    //         result0 = mm0('foo', 42, 'bar'); // OK, variadic


    //         let mm1 = new Multimethod<string, string>({ // async unary
    //             arity: 1,
    //             timing: 'async',
    //             methods: {
    //                 '/foo': async ({n, next}, x) => '42',
    //                 '/bar': async (_, x) => '42',
    //             }
    //         });
    //         mm1.add('/foo', async ({n, next}, x) => '42');
    //         let result1 = mm1('foo');
    //         //result1 = mm1();                                                    // ERROR arity
    //         //result1 = mm1('foo', 'bar');                                        // ERROR arity


    //         let mm2 = new UnaryMultimethod({ // sync unary
    //             //arity: 1,
    //             timing: 'sync',
    //             methods: {
    //                 '/foo': (_, x: string) => '42',
    //                 '/bar': (_, x: string) => '42',
    //                 // '/baz': (_, x: string, y: number) => '42' ERROR if uncommented
    //             }
    //         });
    //         mm2.add({'/baz': (_, a) => '42'});
    //         let result2 = mm2('foo');
    //         //result2 = mm2();                                                    // ERROR arity
    //         //result2 = mm2('foo', 'bar');                                        // ERROR arity


    //         let mm3 = new Multimethod({ // async unary
    //             arity: 1,
    //             timing: 'async',
    //             methods: {
    //                 '/foo': async (_, x: string) => '42',
    //                 '/bar': async (_, x: string) => '42',
    //             }
    //         });
    //         let result3 = mm3('foo');
    //         //result3 = mm3(); // ERROR arity
    //         //result3 = mm3('foo', 'bar');                                        // ERROR arity


    //         let mm4 = new BinaryMultimethod({ // mixed binary
    //             //arity: 2,
    //             //timing: 'async',
    //             methods: {
    //                 '/foo': async ({}, x: string, y: number) => '42',
    //                 '/bar': async ({next}, x: string, y: number) => '42',
    //             }
    //         });
    //         let result4 = mm4('foo', 720);
    //         //result4 = mm4();                                                    // ERROR arity
    //         //result4 = mm4('foo', 'bar');                                        // ERROR type
    //         //result4 = mm4('foo', 11, 'bar');                                    // ERROR arity


    //         let mm5 = new Multimethod({ // mixed ternary
    //             arity: 3,
    //             //timing: 'async',
    //             methods: {
    //                 '/foo': ({n}, x, y, z) => '42',
    //                 '/bar': async ({n}, x, y, z) => '42',
    //             }
    //         });
    //         let result5 = mm5('foo', 'bar', 'baz');
    //         //result5 = mm5('foo', 'bar');                                        // ERROR arity
    //         //result5 = mm5('foo', 'bar', 'baz', 'quux');                         // ERROR arity


    //         let mm = new Multimethod({}); // untyped
    //         mm(42, 24);
    //         mm(1, 2, 3);


    //         let mm6 = new Multimethod({ // mixed nullary
    //             arity: 0,
    //             methods: {
    //                 foo: (ctx) => 'foo'
    //             }
    //         });
    //         let result6 = mm6();
    //         //result6 = mm6('foo');                                               // ERROR arity

    //     }


    //     function test2() {

    //         let m1 = new Multimethod(); // untyped
    //         let r1 = m1(42, 24);
            
    //         let m2 = new UnaryMultimethod();
    //         let r2 = m2(43);
    //         //r2 = m2(43, true);                                                  // ERROR arity

    //         let m3 = new BinaryMultimethod();
    //         let r3 = m3(42, 24);

    //         let m4 = new TernaryMultimethod();
    //         let r4 = m4(42, 24, 2);

    //         let m5 = new VariadicMultimethod();
    //         let r5 = m5(42, 24);
    //         r5 = m5(); // OK

    //     }





    // });
});
