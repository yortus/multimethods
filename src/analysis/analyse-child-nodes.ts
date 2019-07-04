import {MMInfo} from './mm-info';
import {ChildNodes} from './mm-node';





// TODO: doc...
export function analyseChildNodes<T extends object>(mminfo: MMInfo<T>) {
    return mminfo.addProps((_, nodes, set, sets) => {
        let childNodes = set.subsets.map(subset => nodes[sets.indexOf(subset)]);
        return {childNodes} as ChildNodes<T>;
    });
}
