import {ExactlyMatchingMethods, ParentNode, MethodSequence} from './mm-node';
import MMInfo from './mm-info';
//import repeatString from '../util/string-repeat';
//import {toIdentifierParts} from "../math/predicates";





// TODO: doc...
export default function analyseMethodSequences<T extends ExactlyMatchingMethods & ParentNode<T>>(mminfo: MMInfo<T>) {
    return mminfo.addProps((node) => {
        let result: MethodSequence<T> = {methodSequence: []};
        
        for (let inode: T | null = node; inode !== null; inode = inode.parentNode) {
            inode.exactlyMatchingMethods.forEach((method, localIndex) => {
                let node = inode as T & MethodSequence<T>;
                result.methodSequence.push({method, node, localIndex});
            });
        }

        return result;
    });
}





// function getIdentifierForMethod(node: MMNode, i: number): string {
//     let m = node.allMatchingMethods[i];
//     let baseName = `${toIdentifierParts(m.node.predicateInMethodTable)}${repeatString('ᐟ', m.localIndex)}`;
//     if (isMetaMethod(m.method) && (m.node !== mostSpecificNode || m.localIndex > 0)) {
//         return `thunkː${toIdentifierParts(mostSpecificNode.predicateInMethodTable)}ːviaː${baseName}`;
//     }
//     else {
//         return `thunkː${baseName}`;
//     }
// }
