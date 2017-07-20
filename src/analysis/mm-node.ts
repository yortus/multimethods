import {Predicate} from '../math/predicates';





// TODO: doc...
export default interface MMNode extends
    MethodTableEntry,
    ParentNode<MMNode>,
    ChildNodes<MMNode>,
    MethodSequence<MMNode>
    { }





// TODO: doc... the predicate and methods for this node exactly as they appear in the method table...
export interface MethodTableEntry {
    exactPredicate: Predicate;
    exactMethods: Function[];
}





// TODO: doc... always unambiguously ordered from most- to least- specific. Always at least one element.
export interface MethodSequence<TNode> {
    methodSequence: Array<{
        method: Function;
        fromNode: TNode & MethodSequence<TNode>;
        identifier: string;
    }>;
}





// TODO: doc...
export interface ParentNode<TNode> { parentNode: (TNode & ParentNode<TNode>) | null }





// TODO: doc...
export interface ChildNodes<TNode> { childNodes: Array<TNode & ChildNodes<TNode>> }
