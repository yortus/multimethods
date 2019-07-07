import {toIdentifierParts} from '../math/predicates';
import {NodeInfo} from '../mm-info';
import {DeepReplace, repeat} from '../util';
import {NodeProps, PartialMMInfo} from './build-mm-info';




// TODO: doc...
export function analyseMethodSequences<P extends NodeProps>(mminfo: PartialMMInfo<P | 'exactPredicate' | 'exactMethods' | 'parentNode'>) {
    return mminfo.addProps(startNode => {
        let methodSequence = [] as DeepReplace<NodeInfo['methodSequence'], NodeInfo, typeof startNode>;

        // TODO: explain method sequence...
        //       *All* applicable methods for the node's predicate in most- to least- specific order...
        for (let n: typeof startNode | null = startNode; n !== null; n = n.parentNode) {
            let fromNode = n;
            fromNode.exactMethods.forEach((method, methodIndex) => {
                let isMeta = mminfo.isDecorator(method);

                // Make an IdentifierPart for each method that is descriptive and unique accross the multimethod.
                let identifier = `${toIdentifierParts(fromNode.exactPredicate)}${repeat('ᐟ', methodIndex)}`;
                if (isMeta && (fromNode !== startNode || methodIndex > 0)) {
                    identifier = `${toIdentifierParts(startNode.exactPredicate)}ːviaː${identifier}`;
                }

                methodSequence.push({fromNode, methodIndex, identifier, isMeta});
            });
        }

        // The 'entry point' method is the one whose method we call to begin the cascading evaluation for a dispatch. It
        // is the least-specific meta-method, or if there are no meta-methods, it is the most-specific ordinary method.
        let entryPoint = methodSequence.filter(entry => entry.isMeta).pop() || methodSequence[0];
        let entryPointIndex = methodSequence.indexOf(entryPoint);

        return {methodSequence, entryPointIndex, identifier: methodSequence[0].identifier};
    });
}
