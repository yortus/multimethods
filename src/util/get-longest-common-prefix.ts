




// TODO: doc... add tests...
export function getLongestCommonPrefix<T>(arrays: T[][]): T[] {

    // TODO: stupid case...
    if (arrays.length === 0) return [];

    // TODO: explain rest...
    let commonPrefix: T[] = [];
    while (arrays.every(array => array.length > commonPrefix.length)) {
        let el = arrays[0][commonPrefix.length];
        if (arrays.some(array => array[commonPrefix.length] !== el)) break;
        commonPrefix.push(el);
    }
    return commonPrefix;
}
