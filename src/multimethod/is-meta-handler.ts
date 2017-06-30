




// TODO: doc...
function isMetaHandler(handler: Function): boolean;
function isMetaHandler(handler: Function, value: true): void;
function isMetaHandler(handler: Function, value?: true) {
    if (arguments.length === 1) {
        return metaHandlers.has(handler);
    }
    metaHandlers.set(handler, value!);
    return;
}
export default isMetaHandler;





// TODO: explain... replaces IS_META hack
const metaHandlers = new WeakMap<Function, true>();
