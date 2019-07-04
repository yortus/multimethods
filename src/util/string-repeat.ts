




/**
 * Polyfill for ES6 String#repeat method.
 */
export function repeat(str: string, count: number) {
    return Array(count + 1).join(str);
}
