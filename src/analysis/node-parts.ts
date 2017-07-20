import {Predicate} from '../math/predicates';





export interface PredicateInMethodTable { predicateInMethodTable: Predicate }





export interface ExactlyMatchingMethods { exactlyMatchingMethods: Function[] }





export interface Fallback<TNode> { fallback: (TNode & Fallback<TNode>) | null }





export interface Children<TNode> { children: Array<TNode & Children<TNode>> }
