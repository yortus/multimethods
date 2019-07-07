import {NodeProps, PartialMMInfo} from './build-mm-info';




// TODO: doc...
export function analyseChildNodes<P extends NodeProps>(mminfo: PartialMMInfo<P>) {
    return mminfo.addProps((_, nodes, set, sets) => {
        let childNodes = set.subsets.map(subset => nodes[sets.indexOf(subset)]);
        return {childNodes};
    });
}
