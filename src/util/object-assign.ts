




/**
 * Partial polyfill for ES6 Object.assign function.
 * See: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */
export default function assign<T extends object, S extends object>(target: T, source: S) {
    for (let key in source) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            (target as any)[key] = source[key];
        }
    }
    return target as any as T & S;
}
