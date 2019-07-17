// TODO: doc...
export function deepUpdateInPlace(value: Record<string, any> | any[], replacements: Map<unknown, unknown>): void {
    updateObjectOrArrayInPlace(value, replacements, new Set<any>());
}




function updateObjectOrArrayInPlace(value: any, replacements: Map<unknown, unknown>, visited = new Set<any>()): void {
    if (visited.has(value)) return;
    visited.add(value);

    for (let key of Object.keys(value)) {
        let v = value[key];
        if (replacements.has(v)) {
            value[key] = replacements.get(v);
        }
        else if (v !== null && typeof v === 'object') {
            updateObjectOrArrayInPlace(v, replacements, visited);
        }
    }
}
