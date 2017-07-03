




// TODO: doc... add tests...
export default function getLongestCommonSuffix<T>(arrays: T[][]): T[] {

    // TODO: stupid case...
    if (arrays.length === 0) return [];

    // TODO: explain rest...
    let commonSuffix: T[] = [];
    while (arrays.every(array => array.length > commonSuffix.length)) {
        let el = arrays[0][arrays[0].length - commonSuffix.length - 1];
        if (arrays.some(array => array[array.length - commonSuffix.length - 1] !== el)) break;
        commonSuffix.unshift(el);
    }
    return commonSuffix;
}
