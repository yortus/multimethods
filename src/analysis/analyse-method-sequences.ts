import {MethodTableEntry, ParentNode, MethodSequence} from './mm-node';
import isMetaMethod from '../util/is-meta-method';
import MMInfo from './mm-info';
import repeatString from '../util/string-repeat';
import {toIdentifierParts} from "../math/predicates";





// TODO: doc...
export default function analyseMethodSequences<T extends MethodTableEntry & ParentNode<T>>(mminfo: MMInfo<T>) {
    return mminfo.addProps(startNode => {
        let result: MethodSequence<T> = {methodSequence: []};
        
        for (let ancestorNode: T | null = startNode; ancestorNode !== null; ancestorNode = ancestorNode.parentNode) {
            ancestorNode.exactMethods.forEach((method, i) => {

                // Make an IdentifierPart for each method that is descriptive and unique accross the multimethod.
                let identifier = `${toIdentifierParts(ancestorNode!.exactPredicate)}${repeatString('ᐟ', i)}`;
                if (isMetaMethod(method) && (ancestorNode !== startNode || i > 0)) {
                    identifier = `${toIdentifierParts(startNode.exactPredicate)}ːviaː${identifier}`;
                }

                result.methodSequence.push({method, fromNode: ancestorNode as T & MethodSequence<T>, identifier});
            });
        }

        return result;
    });
}
