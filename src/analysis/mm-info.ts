import {NormalOptions} from './normalise-options';
import {Predicate} from '../math/predicates';





// TODO: doc...
export default class MMInfo<TNode> {
    options: NormalOptions;
    nodes: TNode[];
    rootNode: TNode;
}





// TODO: doc...
export interface MMNode {
    predicateInMethodTable: Predicate;
    exactlyMatchingMethods: Function[];
    fallback: MMNode|null;
    children: MMNode[];
}
