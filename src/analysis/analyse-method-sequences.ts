import {MethodTableEntry, ParentNode, MethodSequence} from './mm-node';
import isMetaMethod from '../util/is-meta-method';
import MMInfo from './mm-info';
import repeatString from '../util/string-repeat';
import {toIdentifierParts} from "../math/predicates";





// TODO: doc...
export default function analyseMethodSequences<T extends MethodTableEntry & ParentNode<T>>(mminfo: MMInfo<T>) {
    return mminfo.addProps((analysisNode) => {
        let result: MethodSequence<T> = {methodSequence: []};
        
        for (let ancestor: T | null = analysisNode; ancestor !== null; ancestor = ancestor.parentNode) {
            ancestor.exactMethods.forEach((method, localIndex) => {

                // Make an IdentifierPart for each method that is descriptive and unique accross the multimethod.
                let identifier = `${toIdentifierParts(ancestor!.exactPredicate)}${repeatString('ᐟ', localIndex)}`;
                if (isMetaMethod(method) && (ancestor !== analysisNode || localIndex > 0)) {
                    identifier = `${toIdentifierParts(analysisNode.exactPredicate)}ːviaː${identifier}`;
                }

                result.methodSequence.push({method, node: ancestor as T & MethodSequence<T>, localIndex, identifier});
            });
        }

        return result;
    });
}
