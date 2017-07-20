import {ExactPredicate, ExactMethods, ParentNode, MethodSequence} from './mm-node';
import isMetaMethod from '../util/is-meta-method';
import MMInfo from './mm-info';
import repeatString from '../util/string-repeat';
import {toIdentifierParts} from "../math/predicates";





// TODO: doc...
export default function analyseMethodSequences<T extends ExactPredicate & ExactMethods & ParentNode<T>>(mminfo: MMInfo<T>) {
    return mminfo.addProps((analysisNode) => {
        let result: MethodSequence<T> = {methodSequence: []};
        
        for (let inode: T | null = analysisNode; inode !== null; inode = inode.parentNode) {
            inode.exactMethods.forEach((method, localIndex) => {
                let node = inode as T & MethodSequence<T>;

// TODO: temp testing... test this...
                let identifier: string;
                let baseName = `${toIdentifierParts(node.exactPredicate)}${repeatString('ᐟ', localIndex)}`;
                if (isMetaMethod(method) && (node !== analysisNode || localIndex > 0)) {
                    identifier = `${toIdentifierParts(node.exactPredicate)}ːviaː${baseName}`;
                }
                else {
                    identifier = baseName;
                }

                result.methodSequence.push({method, node, localIndex, identifier});
            });
        }

        return result;
    });
}
