import {expect, use as chaiUse} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {NEXT, create as MM, meta} from 'multimethods';





chaiUse(chaiAsPromised);





describe('MULTIMETHOD I: Constructing a Multimethod instance', () => {

    // TODO: temp testing...
    it('TEMP1', () => {

        let mm = MM({
            arity: 1,
            discriminator: (x: string) => x,
            methods: {
                '/{thing}': (x, {}, _) => x,
                '/foo':     (x) => 'foo' + x,
                '/bar':     (x) => 'bar' + x,
                '**':      meta((x, _, next) => `---${next(x)}---`),
            },
        });
        let result = mm('/foo');
        result = result;
    });

    // TODO: temp testing...
    it('TEMP2', () => {

        let mm = MM({
            arity: 2,
            methods: {
                '**':              (a: any, b: any) => `${a}:${b}`,
                '/String**':       (_: string, __: any) => `first is string`,
                '/Number**':       (_: number, __: any) => `first is number`,
                '/Number/Boolean':  (_: number, __: any) => `num:bool`,
            },
        });

        expect(mm('foo', 42)).to.equal('first is string');
        expect(mm(42, 'foo')).to.equal('first is number');
        expect(mm(true, 42)).to.equal('true:42');
        expect(mm(42, true)).to.equal('num:bool');
    });

    // TODO: temp testing... strict+sync - ensure method result is checked properly
    it('TEMP3', () => {

        let mm = MM({
            arity: 2,
            async: false,
            strict: true,
            methods: {
                '**':              (a: any, b: any) => `${a}:${b}`,
                '/String**':       (_: string, __: any) => Promise.resolve(`first is string`),
                '/Number**':       (_: number, __: any) => `first is number`,
                '/Number/Boolean':  (_: number, __: any) => `num:bool`,
            },
        });

        expect(() => mm('foo', 42)).to.throw();
        expect(mm(42, 'foo')).to.equal('first is number');
        expect(mm(true, 42)).to.equal('true:42');
        expect(mm(42, true)).to.equal('num:bool');
    });

    // TODO: temp testing... strict+async - ensure method result is checked properly
    it('TEMP4', async () => {

        let mm = MM({
            arity: 2,
            async: true,
            strict: true,
            methods: {
                '**':              (a: any, b: any) => Promise.resolve(`${a}:${b}`),
                '/String**':       (_: string, __: any) => Promise.resolve(`first is string`),
                '/Number**':       (_: number, __: any) => { throw new Error('oops'); },
                '/Number/Boolean':  (_: number, __: any) => `num:bool`,
            },
        });

        await expect(mm('foo', 42)).to.eventually.equal('first is string');
        await expect(mm(true, 42)).to.eventually.equal('true:42');
        await expect(mm(42, 'foo')).to.be.rejected;
        await expect(mm(42, true)).to.be.rejected;
    });

    it('TEMP5', () => {

        let mm = MM<string, any>({
            // arity: 1,
            async: false,
            strict: true,
            discriminator: (a: string) => a,
            methods: {
                '**':       meta((a, {}, next) => `-${next(a)}-`),
                'a*':       _ => 'a*',
                'aa*':      meta((a, {}, next) => { let r = next(a); return r === NEXT ? NEXT : `(${r})`; }),
            },
        });

        expect(mm('aaa')).to.equal('-a*-');
    });
});
