import {Predicate, Unreachable} from './math/predicates';




// TODO: doc...
export interface MMInfo<TNode = NodeInfo> {
    config: {
        name: string;
        discriminator: (...args: any[]) => string | Promise<string>;
        unreachable: Unreachable;
        unhandled: (discriminant: string) => unknown;
    };

    allMethods: Record<string, Function[]>; // TODO: doc... includes all regular methods and all decorators

    allNodes: TNode[];

    rootNode: TNode;

    isDecorator(method: Function): boolean;

    findNode(predicate: string): TNode | undefined;
}




export interface NodeInfo {

    // from MethodTableEntry:
    exactPredicate: Predicate;
    exactMethods: Function[];

    // from MethodSequence<TNode>:
    methodSequence: Array<{
        fromNode: NodeInfo;
        methodIndex: number; // TODO: doc... index into fromNode.exactMethods array
        identifier: string; // TODO: is this same as fromNode.identifier? need it here? investigate?
        isMeta: boolean; // TODO: change to isDecorator
    }>;
    entryPointIndex: number; // TODO: doc... index into node.methodSequence array
    identifier: string;

    // from ParentNode<TNode>:
    parentNode: NodeInfo | null; // TODO: make prop optional, don't use null

    // from ChildNodes<TNode>:
    childNodes: NodeInfo[];
}
