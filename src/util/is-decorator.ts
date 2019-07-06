




// TODO: doc...
export function isDecorator(method: Function): boolean;
export function isDecorator(method: Function, value: true): void;
export function isDecorator(method: Function, value?: true) {
    if (arguments.length === 1) {
        return decorators.has(method);
    }
    decorators.set(method, value!);
    return;
}





// TODO: explain...
const decorators = new WeakMap<Function, true>();
