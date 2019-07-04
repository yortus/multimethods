




/** Tests whether `value` appears to be a Promises/A+ instance */
export function isPromiseLike(value: any): value is PromiseLike<any> {
    if (!value) return false;
    let type = typeof value;
    if (type !== 'object' && type !== 'function') return false;
    return typeof value.then === 'function';
}
