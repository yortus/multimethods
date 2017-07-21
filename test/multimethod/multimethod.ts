import {expect} from 'chai';
import multimethod, {meta} from 'multimethods';





// TODO: ...
describe('MULTIMETHOD I: Constructing a Multimethod instance', () => {

    // TODO: temp testing...
    it('TEMP1', () => {

        let mm = multimethod({
            arity: 1,
            toDiscriminant: (x: string) => x,
            methods: {
                '/{thing}': (x, {_thing}, _) => x,
                '/foo':     (x) => 'foo' + x,
                '/bar':     (x) => 'bar' + x,
                '...':      meta((x, _caps, next) => `---${next(x)}---`)
            }
        });
        let result = mm('/foo');
        result;
    });

    // TODO: temp testing...
    it('TEMP2', () => {

        let mm = multimethod({
            arity: 2,
            methods: {
                '...':              (a: any, b: any) => `${a}:${b}`,
                '/String...':       (_a: string, _b: any) => `first is string`,
                '/Number...':       (_a: number, _b: any) => `first is number`,
                '/Number/Boolean':  (_a: number, _b: any) => `num:bool`,
            }
        });

        expect(mm('foo', 42)).to.equal('first is string');
        expect(mm(42, 'foo')).to.equal('first is number');
        expect(mm(true, 42)).to.equal('true:42');
        expect(mm(42, true)).to.equal('num:bool');
    });

});
