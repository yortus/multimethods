import {expect, use as chaiUse} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {Multimethod, next} from 'multimethods';
import defaultDiscriminator from 'multimethods/analysis/configuration/default-discriminator';




chaiUse(chaiAsPromised);




describe('MULTIMETHOD I: Constructing a Multimethod instance', () => {

    // TODO: temp testing...
    it('TEMP1', () => {
        let mm = Multimethod((x: string) => x).extend({
            '/{thing}': (x) => x,
            '/foo':     (x) => 'foo' + x,
            '/bar':     (x) => 'bar' + x,
        }).decorate({
            '**':       (m, args) => `---${m(...args)}---`,
        });
        let result = mm('/foo');
        result = result;
    });

    // TODO: temp testing...
    it('TEMP2', () => {
        let mm = Multimethod(defaultDiscriminator).extend({
            '**':               (a: any, b: any) => `${a}:${b}`,
            '/String**':        (_: string, __: any) => `first is string`,
            '/Number**':        (_: number, __: any) => `first is number`,
            '/Number/Boolean':  (_: number, __: any) => `num:bool`,
        });

        expect(mm('foo', 42)).to.equal('first is string');
        expect(mm(42, 'foo')).to.equal('first is number');
        expect(mm(true, 42)).to.equal('true:42');
        expect(mm(42, true)).to.equal('num:bool');
    });

    // TODO: temp testing... strict+sync - ensure method result is checked properly
    it('TEMP3', () => {
        let mm = Multimethod(defaultDiscriminator).extend({
            '**':               (a: any, b: any) => `${a}:${b}`,
            '/String**':        (_: string, __: any) => Promise.resolve(`first is string`),
            '/Number**':        (_: number, __: any) => `first is number`,
            '/Number/Boolean':  (_: number, __: any) => `num:bool`,
        });

        expect(mm('foo', 42)).to.eventually.equal('first is string');
        expect(mm(42, 'foo')).to.equal('first is number');
        expect(mm(true, 42)).to.equal('true:42');
        expect(mm(42, true)).to.equal('num:bool');
    });

    // TODO: temp testing... strict+async - ensure method result is checked properly
    it('TEMP4', async () => {

        let mm = Multimethod(async (...args: any[]) => defaultDiscriminator(...args)).extend({
            '**':              (a: any, b: any) => Promise.resolve(`${a}:${b}`),
            '/String**':       (_: string, __: any) => Promise.resolve(`first is string`),
            '/Number**':       (_: number, __: any) => { throw new Error('oops'); },
            '/Number/Boolean':  (_: number, __: any) => `num:bool`,
        });

        await expect(mm('foo', 42)).to.eventually.equal('first is string');
        await expect(mm(true, 42)).to.eventually.equal('true:42');
        await expect(mm(42, 'foo')).to.be.rejected;
        await expect(mm(42, true)).to.eventually.equal('num:bool');
    });

    it('TEMP5', () => {
        let mm = Multimethod((a: string) => a).extend({
            'a*':       _ => 'a*',
        }).decorate({
            '**':       (m, [a]) => `-${m(a)}-`,
            'aa*':      (m, [a]) => { let r = m(a); return r === next ? next : `(${r})`; },
        });

        expect(mm('aaa')).to.equal('-a*-');
    });
});
