import {toIdentifierParts} from '../math/predicates';
import {DeepUpdated, repeat} from '../util';




// TODO: doc...
export function pass3(mminfo: ReturnType<typeof import('./pass-2').pass2>) {
    type OldNode = typeof mminfo.rootNode;
    type NewNode = OldNode & {
        childNodes: NewNode[];
        methodSequence: Array<{
            fromNode: OldNode;
            methodIndex: number; // TODO: doc... index into fromNode.exactMethods array
            identifier: string; // TODO: is this same as fromNode.identifier? need it here? investigate?
            isMeta: boolean; // TODO: change to isDecorator
        }>;
        entryPointIndex: number; // TODO: doc... index into node.methodSequence array
        identifier: string;
    };

    for (let node of mminfo.allNodes) {

        // TODO: child nodes...
        let childNodes = node.subsets;

        // TODO: method sequences...
        let startNode = node;
        let methodSequence = [] as NewNode['methodSequence'];

        // TODO: explain method sequence...
        //       *All* applicable methods for the node's predicate in most- to least- specific order...
        for (let n: OldNode | undefined = startNode; n !== undefined; n = n.parentNode) {
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
        Object.assign(node, {
            childNodes,
            methodSequence,
            entryPointIndex,
            identifier: methodSequence[0].identifier,
        });
    }

    return mminfo as DeepUpdated<typeof mminfo, OldNode, NewNode>;
}
