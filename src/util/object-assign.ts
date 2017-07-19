




/**
 * Partial polyfill for ES6 Object.assign function.
 * See: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */
export default function assign<T extends {[x: string]: any}, S extends {[x: string]: any}>(target: T, source: S) {
    for (var key in source) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
        }
    }
    return target as any as Overwrite<T, S>;
}





type Overwrite<T, U> = { [P in Diff<keyof T, keyof U>]: T[P] } & U;
type Diff<T extends string, U extends string> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
