import {ChildNodes} from './mm-node';
import MMInfo from './mm-info';





// TODO: doc...
export default function analyseChildNodes<T>(mminfo: MMInfo<T>) {
    return mminfo.addProps((_, nodes, set, sets) => {
        let childNodes = set.subsets.map(subset => nodes[sets.indexOf(subset)]);
        return {childNodes} as ChildNodes<T>;
    });
}
