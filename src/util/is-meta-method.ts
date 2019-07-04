




// TODO: doc...
export function isMetaMethod(method: Function): boolean;
export function isMetaMethod(method: Function, value: true): void;
export function isMetaMethod(method: Function, value?: true) {
    if (arguments.length === 1) {
        return metaMethods.has(method);
    }
    metaMethods.set(method, value!);
    return;
}





// TODO: explain...
const metaMethods = new WeakMap<Function, true>();
