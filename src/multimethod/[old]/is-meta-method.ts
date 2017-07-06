




// TODO: doc...
function isMetaMethod(method: Function): boolean;
function isMetaMethod(method: Function, value: true): void;
function isMetaMethod(method: Function, value?: true) {
    if (arguments.length === 1) {
        return metaMethods.has(method);
    }
    metaMethods.set(method, value!);
    return;
}
export default isMetaMethod;





// TODO: explain...
const metaMethods = new WeakMap<Function, true>();
