import {Predicate} from '../math/predicates';





// TODO: doc...
export default interface MMNode extends
    ExactPredicate,
    ExactMethods,
    ParentNode<MMNode>,
    ChildNodes<MMNode>,
    MethodSequence<MMNode>
    { }





// TODO: doc... the predicate for this node exactly as it was given in the method table
export interface ExactPredicate { exactPredicate: Predicate }





// TODO: doc... the method chain for this node exactly as it was given in the method table
export interface ExactMethods { exactMethods: Function[] }





// TODO: doc... always unambiguously ordered from most- to least- specific. Always at least one element.
export interface MethodSequence<TNode> {
    methodSequence: Array<{
        method: Function;
        node: TNode & MethodSequence<TNode>;
        localIndex: number;
        identifier: string;
    }>;
}





// TODO: doc...
export interface ParentNode<TNode> { parentNode: (TNode & ParentNode<TNode>) | null }





// TODO: doc...
export interface ChildNodes<TNode> { childNodes: Array<TNode & ChildNodes<TNode>> }
