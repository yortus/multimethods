




/** Tests whether `value` appears to be a Promises/A+ instance */
export function isPromise(value: unknown): value is Promise<unknown> {
    if (!value) return false;
    let type = typeof value;
    if (type !== 'object' && type !== 'function') return false;
    return typeof (value as any).then === 'function';
}
