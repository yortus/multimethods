import {default as MM} from './create';
import {meta} from './decorators';
import * as types from './multimethod';
import {UNHANDLED_DISPATCH} from './sentinels';




// TODO: ...
const Multimethod = create as types.MultimethodStatic;
type Multimethod<P extends unknown[], R> = types.Multimethod<P, R>;
export {Multimethod};




export function isUnhandled(err: {code?: unknown}) {
    return err instanceof Error && err.code === UNHANDLED_DISPATCH;
}




// TODO: ...
function create<P extends unknown[]>(options?: types.Options<P, 'mixed'>): types.Multimethod<P, never>;
function create<P extends unknown[]>(options?: types.Options<P, 'async'>): types.AsyncMultimethod<P, never>;
function create(options: types.Options<unknown[], any>) {
    let discriminator = typeof options === 'function' ? options : options.discriminator;
    let unhandled = typeof options === 'object' ? options.unhandled : undefined;

    let mm = MM({
        discriminator,
        arity: discriminator.length || 1,
        unhandled,
    });
    let result: types.Multimethod<unknown[], unknown> = addMethods(mm);
    return result;

    function addMethods<T>(mm: T, existingMethods: {[x: string]: Function} = {}) {
        let extend = (methods: any) => {
            methods = combine(existingMethods, methods);
            let mm2 = MM({
                discriminator,
                methods,
                unhandled,
            });
            return addMethods(mm2, methods);
        };

        let decorate = (decorators: any) => {
            let keys = Object.keys(decorators);
            let metaMethods = keys.reduce(
                (obj, key) => {
                    let decsArray: any[] = decorators[key];
                    decsArray = Array.isArray(decsArray) ? decsArray : [decsArray];
                    obj[key] = decsArray.map(dec => dec === 'super' ? 'super' : meta(dec));
                    return obj;
                },
                {} as any
            );
            let methods = combine(existingMethods, metaMethods);
            let mm2 = MM({
                discriminator,
                methods,
                unhandled,
            });
            return addMethods(mm2, methods);
        };

        let result = Object.assign(mm, {extend, decorate});
        return result;
    }
}




function combine(m1: {[x: string]: any}, m2: {[x: string]: any}) {
    let k1 = Object.keys(m1);
    let k2 = Object.keys(m2);

    let result = {} as {[x: string]: any};
    for (let k of k1) result[k] = m1[k];
    for (let k of k2) result[k] = m2[k];

    // TODO: shouldn't need to specify 'super' if decorators are being merged into methods with same key
    let keysInBoth = k1.filter(k => k2.includes(k));
    for (let k of keysInBoth) {
        let method1 = m1[k];
        let method2 = m2[k];

        if (!Array.isArray(method2) || !method2.some(m => m === 'super')) {
            throw new Error(`Override must be an array including 'super' as an element`);
        }

        let superIndex = method2.indexOf('super');
        let pre = method2.slice(0, superIndex);
        let post = method2.slice(superIndex + 1);
        result[k] = pre.concat(method1, post);
    }
    return result;
}
