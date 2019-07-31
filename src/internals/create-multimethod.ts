import {AsyncMultimethod, Multimethod} from '../interface/multimethod';
import {Options} from '../interface/options';
import {analyse} from './analysis';
import {codegen} from './codegen';
import {Dict} from './util';




// TODO: ...
export function createMultimethod<P extends unknown[]>(options?: Options<P>): Multimethod<P>;
export function createMultimethod<P extends unknown[]>(options?: Options<P, Promise<string>>): AsyncMultimethod<P>;
export function createMultimethod(options: Options<unknown[], any>) {
    let mm = codegen(analyse(options, {}, {}));
    let result = addMethods(mm, {}, {});
    return result;

    function addMethods<T>(mm: T, existingMethods: Dict<Function[]>, existingDecorators: Dict<Function[]>) {
        let extend = (methods: Record<string, Function | Array<Function | 'super'>>) => {
            let combinedMethods = combine(existingMethods, methods);
            let mm2 = codegen(analyse(options, combinedMethods, existingDecorators));
            return addMethods(mm2, combinedMethods, existingDecorators);
        };

        let decorate = (decorators: Record<string, Function | Array<Function | 'super'>>) => {
            let combinedDecorators = combine(existingDecorators, decorators);
            let mm2 = codegen(analyse(options, existingMethods, combinedDecorators));
            return addMethods(mm2, existingMethods, combinedDecorators);
        };

        return Object.assign(mm, {extend, decorate});
    }
}




// TODO: combine two method tables
function combine(existingMethods: Dict<Function[]>, additionalMethods: Dict<Function | Array<Function | 'super'>>) {
    let existingKeys = Object.keys(existingMethods);
    let additionalKeys = Object.keys(additionalMethods);
    let keysInBoth = existingKeys.filter(k => additionalKeys.indexOf(k) !== -1);
    let existingOnlyKeys = existingKeys.filter(k => keysInBoth.indexOf(k) === -1);
    let additionalOnlyKeys = additionalKeys.filter(k => keysInBoth.indexOf(k) === -1);

    let result = {} as Record<string, Function[]>;
    for (let k of existingOnlyKeys) result[k] = existingMethods[k];
    for (let k of additionalOnlyKeys) {
        let addition = additionalMethods[k];
        if (typeof addition === 'function') {
            result[k] = [addition];
            continue;
        }
        // For this key, there is no existing behaviour to override, so any references to 'super' can simply be elided.
        result[k] = addition.filter(a => a !== 'super') as Function[];
    }

    // TODO: shouldn't need to specify 'super' if decorators are being merged into methods with same key
    for (let k of keysInBoth) {
        let existing = existingMethods[k];
        let addition = additionalMethods[k];

        if (!Array.isArray(addition) || addition.filter(m => m === 'super').length !== 1) {
            throw new Error(`Override must be an array with exactly one element containing the value 'super'`);
        }

        let superIndex = addition.indexOf('super');
        let pre = addition.slice(0, superIndex) as Function[];
        let post = addition.slice(superIndex + 1) as Function[];
        result[k] = pre.concat(existing, post);
    }
    return result;
}










// // TODO: temp testing...
// declare const next: never;

// let mm1 = new Multimethod((a: number, b: string) => `/${a}/${b}`);
// mm1 = mm1.extend({foo: async () => 'foo'});
// let x1a = mm1(1, 'sdsd');


// let mm2 = mm1.extend({
//     '/foo': async () => 'hi',
//     '/bar': async () => next,
//     '/baz': () => 'baz',
// });
// let mm2b = mm2.decorate({
//     '**': (_, method, args) => 'asd' || method(...args),
// });
// let x2a = mm2(3, 'asda');


// let mm3 = mm2.extend({
//     '/foo/*': async (_, a, b) => 'hi hi',
//     '/foo/*/*': [() => 'hi hi hi'],
//     '/{**path}': ({path}, a, b) => `/${a}/${b}${path}`,
//     '/thing/{name}': () => next, // TODO: was... `/${a}/${b}${this.captures.name}`; },
// });
// let x3a = mm3(3, 'asda');


// let mm4a = mm1.extend({foo: () => 'foo'});
// let mm4b = mm1.extend({foo: () => 42});
// let mm4c = mm4a.extend({foo: () => 42});
// let mm4d = mm4c.extend({foo: async () => next});
// mm4a = mm4b;
// mm4a = mm4c;
// mm4b = mm4a;
// mm4b = mm4c;
// mm4c = mm4a;
// mm4c = mm4b;
// let x4a = mm4a(42, 'foo');
// let x4b = mm4b(42, 'foo');


// let mm5 = mm2.extend({
//     '/foo': async () => next,
//     '/bar': async () => 42,
// });
// let x5a = mm5(3, 'asda');


// let mm6 = mm4b.extend({
//     '/foo': () => next,
//     '/bar': () => 'foo',
// });
// let x6a = mm6(3, 'asda');


// let mm7 = new Multimethod({});
// let x7a = mm7.extend({foo: [
//     (_, a, b) => 'bar',
//     (_, a, b) => 'baz',
//     'super',
// ]})();


// let mm8a = new Multimethod(async (a: number, b: string) => `/${a}/${b}`);
// let mm8b = mm8a.extend({'/foo/*': () => 'foo'});
// let mm8c = mm8a.extend({'/bar/*': () => 'bar'}).decorate({'**': () => 'foo'});
// let x8b1 = mm8b(1, 'sdsd');


// let mm9 = mm2.extend({
//     '/foo/*': async (x, a, b) => 'hi hi',
//     '/bar/*': async (a, b) => 'hi hi',
//     '/foo/*/*': [() => 'hi hi hi'],
//     '/{**path}': ({path}, a, b) => `/${a}/${b}${path}`,
//     '/thing/{name}': (x, y, z) => next, // TODO: was... `/${a}/${b}${this.captures.name}`; },
// });
// let x9a = mm9(3, 'asda');
