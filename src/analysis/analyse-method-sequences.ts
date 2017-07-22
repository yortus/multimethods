import {toIdentifierParts} from '../math/predicates';
import isMetaMethod from '../util/is-meta-method';
import repeatString from '../util/string-repeat';
import MMInfo from './mm-info';
import {MethodSequence, MethodSequenceEntry, MethodTableEntry, ParentNode} from './mm-node';





// TODO: doc...
export default function analyseMethodSequences<T extends MethodTableEntry & ParentNode<T>>(mminfo: MMInfo<T>) {
    return mminfo.addProps(startNode => {
        let methodSequence = [] as Array<MethodSequenceEntry<T>>;

        // TODO: explain method sequence...
        //       *All* applicable methods for the node's predicate in most- to least- specific order...
        for (let ancestorNode: T | null = startNode; ancestorNode !== null; ancestorNode = ancestorNode.parentNode) {
            ancestorNode.exactMethods.forEach((method, methodIndex) => {
                let fromNode = ancestorNode as T & MethodSequence<T>;
                let isMeta = isMetaMethod(method);

                // Make an IdentifierPart for each method that is descriptive and unique accross the multimethod.
                let identifier = `${toIdentifierParts(ancestorNode!.exactPredicate)}${repeatString('ᐟ', methodIndex)}`;
                if (isMeta && (ancestorNode !== startNode || methodIndex > 0)) {
                    identifier = `${toIdentifierParts(startNode.exactPredicate)}ːviaː${identifier}`;
                }

                methodSequence.push({fromNode, methodIndex, identifier, isMeta});
            });
        }

        // The 'entry point' method is the one whose method we call to begin the cascading evaluation for a dispatch. It
        // is the least-specific meta-method, or if there are no meta-methods, it is the most-specific ordinary method.
        let entryPoint = methodSequence.filter(entry => entry.isMeta).pop() || methodSequence[0];

        return {methodSequence, entryPoint, identifier: methodSequence[0].identifier} as MethodSequence<T>;
    });
}
