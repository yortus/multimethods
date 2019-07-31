import {OptionsObject} from '../interface/options';
import {Pattern} from './patterns';




// TODO: doc...
export interface MMInfo {
    options: Required<OptionsObject>;

    allMethods: Record<string, Function[]>; // TODO: doc... includes all regular methods and all decorators

    allNodes: Node[];

    rootNode: Node;

    isDecorator(method: Function): boolean;
}




export interface Node {

    // from MethodTableEntry:
    exactPattern: Pattern;
    exactMethods: Function[];

    // from MethodSequence<TNode>:
    methodSequence: Array<{
        fromNode: Node;
        methodIndex: number; // TODO: doc... index into fromNode.exactMethods array
        identifier: string; // TODO: is this same as fromNode.identifier? need it here? investigate?
        isDecorator: boolean;
    }>;
    entryPointIndex: number; // TODO: doc... index into node.methodSequence array
    identifier: string;

    // from ChildNodes<TNode>:
    childNodes: Node[];
}
