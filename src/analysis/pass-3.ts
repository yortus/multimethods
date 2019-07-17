import {toIdentifierParts} from '../math/predicates';
import {repeat} from '../util';




// TODO: doc...
export function pass3(mminfo: ReturnType<typeof import('./pass-2').pass2>) {
    type TNode = typeof mminfo.rootNode;

    return mminfo.map(startNode => {
        let methodSequence = [] as Array<{
            fromNode: TNode;
            methodIndex: number; // TODO: doc... index into fromNode.exactMethods array
            identifier: string; // TODO: is this same as fromNode.identifier? need it here? investigate?
            isMeta: boolean; // TODO: change to isDecorator
        }>;

        // TODO: explain method sequence...
        //       *All* applicable methods for the node's predicate in most- to least- specific order...
        for (let n: TNode | undefined = startNode; n !== undefined; n = n.parentNode) {
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


        // TODO: fix...
        return {...startNode, methodSequence, entryPointIndex, identifier: methodSequence[0].identifier};
    });
}
