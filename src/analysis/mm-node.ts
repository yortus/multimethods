import {Predicate} from '../math/predicates';





// TODO: doc...
export default interface MMNode extends
    PredicateInMethodTable,
    ExactlyMatchingMethods,
    ParentNode<MMNode>,
    ChildNodes<MMNode>,
    MethodSequence<MMNode>
    { }





// TODO: doc...
export interface PredicateInMethodTable { predicateInMethodTable: Predicate }





// TODO: doc...
export interface ExactlyMatchingMethods { exactlyMatchingMethods: Function[] }





// TODO: doc...
export interface MethodSequence<TNode> {
    methodSequence: Array<{
        method: Function;
        node: TNode & MethodSequence<TNode>;
        localIndex: number;
    }>;
}





// TODO: doc...
export interface ParentNode<TNode> { parentNode: (TNode & ParentNode<TNode>) | null }





// TODO: doc...
export interface ChildNodes<TNode> { childNodes: Array<TNode & ChildNodes<TNode>> }
