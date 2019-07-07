import {analyseAll, buildMMInfo} from './analysis';
import {codegen} from './codegen';
import {instrumentMethods, instrumentMultimethod} from './instrumentation';
import * as types from './multimethod';
import {Options} from './options';
import {UNHANDLED_DISPATCH} from './sentinels';
import {debug} from './util';
import {checkMethodsAndDecorators, checkOptions} from './validation';




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

    let mm = MM({discriminator, unhandled}, {}, {});
    let result = addMethods(mm, {}, {});
    return result;

    function addMethods<T>(mm: T, existingMethods: Record<string, Function[]>, existingDecorators: Record<string, Function[]>) {
        let extend = (methods: Record<string, Function | Array<Function | 'super'>>) => {
            let combinedMethods = combine(existingMethods, methods);
            let mm2 = MM({discriminator, unhandled}, combinedMethods, existingDecorators);
            return addMethods(mm2, combinedMethods, existingDecorators);
        };

        let decorate = (decorators: Record<string, Function | Array<Function | 'super'>>) => {
            let combinedDecorators = combine(existingDecorators, decorators);
            let mm2 = MM({discriminator, unhandled}, existingMethods, combinedDecorators);
            return addMethods(mm2, existingMethods, combinedDecorators);
        };

        return Object.assign(mm, {extend, decorate});
    }
}




// TODO: combine two method tables
function combine(existingMethods: Record<string, Function[]>, additionalMethods: Record<string, Function | Array<Function | 'super'>>) {
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




// TODO: doc...
function MM(options: Options, methods: Record<string, Function | Function[]>, decorators: Record<string, Function | Function[]>) {
    options = options || {};
    checkOptions(options); // NB: may throw
    checkMethodsAndDecorators(methods, decorators); // NB: may throw
    let mminfo = buildMMInfo({options, methods, decorators});
    let mminfo2 = analyseAll(mminfo);
    if (debug.enabled) instrumentMethods(mminfo2);
    let multimethod = codegen(mminfo2);
    if (debug.enabled) multimethod = instrumentMultimethod(multimethod, mminfo2);
    return multimethod;
}
