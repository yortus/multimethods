import {default as MM} from './create';
import {meta} from './decorators';
import * as types from './multimethod';




// TODO: ...
const Multimethod = create as types.MultimethodStatic;
type Multimethod<P extends unknown[], R> = types.Multimethod<P, R>;
export {Multimethod};




// TODO: ...
function create<P extends unknown[]>(options?: types.Options<P, 'mixed'>): types.Multimethod<P, never>;
function create<P extends unknown[]>(options?: types.Options<P, 'async'>): types.AsyncMultimethod<P, never>;
function create(options: types.Options<unknown[], any>) {
    let label = typeof options === 'function' ? options : options.label;

    let mm = MM({ toDiscriminant: label });
    let result: types.Multimethod<unknown[], unknown> = addMethods(mm);
    return result;

    function addMethods<T>(mm: T, existingMethods: {[x: string]: Function} = {}) {
        let extend = (methods: any) => {
            methods = {...existingMethods, ...methods};
            let mm2 = MM({
                toDiscriminant: label,
                methods,
            });
            return addMethods(mm2, methods);
        };

        let decorate = (decorators: any) => {
            let keys = Object.keys(decorators);
            let metaMethods = keys.reduce(
                (obj, key) => {
                    obj[key] = meta((...args: unknown[]) => {
                        let next = args.pop();
                        let pattern = args.pop();
                        return decorators[key](next, args, {pattern});
                    });
                    return obj;
                },
                {} as any
            );
            let methods = {...existingMethods, ...metaMethods};
            let mm2 = MM({
                toDiscriminant: label,
                methods,
            });
            return addMethods(mm2, methods);
        };

        let result = Object.assign(mm, {extend, decorate});
        return result;
    }
}
