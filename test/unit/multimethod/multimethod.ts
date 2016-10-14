import {expect} from 'chai';
import {Multimethod, UnaryMultimethod, BinaryMultimethod, TernaryMultimethod, VariadicMultimethod} from 'multimethods';




// TODO: ...
describe('Constructing a Multimethod instance', () => {

    // TODO: ...
    let tests = [
        () => new Multimethod({})

    ];



    // TODO: ...
    it('..', () => {




    // EXAMPLES / TESTS
    // TODO: temp testing...
    function test() {


        let mm0 = new Multimethod({ // mixed variadic
            async: 'mixed',
            arity: 'variadic',
            toDiscriminant: ([$0]) => '',
            methods: {
                '/foo': async ([x]) => 42,
                '/bar': async ([x]) => 42,
            }
        });
        let result0 = mm0('foo');


        let mm1 = new Multimethod<string, string>({ // async unary
            async: true,
            arity: 1,
            methods: {
                '/foo': async (x, {n}, next) => '42',
                '/bar': async (x) => '42',
            }
        });
        mm1.add('/foo', async (x, {n}, next) => '42');
        let result1 = mm1('foo');


        let mm2 = new UnaryMultimethod({ // sync unary
            async: false,
            //arity: 1,
            methods: {
                '/foo': (x: string) => '42',
                '/bar': (x: string) => '42'
            }
        });
        mm2.add({'/baz': (a) => '42'});
        let result2 = mm2('foo');


        let mm3 = new Multimethod({ // async unary
            async: true,
            arity: 1,
            methods: {
                '/foo': async (x: string) => '42',
                '/bar': async (x: string) => '42',
            }
        });
        let result3 = mm3('foo');


        let mm4 = new BinaryMultimethod({ // mixed binary
            //async: true,
            //arity: 2,
            methods: {
                '/foo': async (x: string, y: number, {}) => '42',
                '/bar': async (x: string, y: number, {}, next: any) => '42',
            }
        });
        let result4 = mm4('foo', 720);


        let mm5 = new Multimethod({ // mixed ternary
            //async: true,
            arity: 3,
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
