import {NormalPredicate, Predicate, toNormalPredicate, toPredicate} from '../math/predicates';
import {NodeProps, PartialMMInfo} from './build-mm-info';




// TODO: doc... Get predicates and exactly-matching methods in most- to least-specific order.
export function analyseMethodTable<P extends NodeProps>(mminfo: PartialMMInfo<P>) {
    return mminfo.addProps((_, __, set) => {
        let exactPredicate = findExactPredicateInMethodTable(set.predicate, mminfo.allMethods) || set.predicate;

        // Find the index in the chain where meta-methods end and regular methods begin.
        let chain = mminfo.allMethods[exactPredicate] || [];
        let i = 0;
        while (i < chain.length && mminfo.isDecorator(chain[i])) ++i;
        // TODO: explain ordering: regular methods from left-to-right; then meta-methods from right-to-left
        let exactMethods = chain.slice(i).concat(chain.slice(0, i).reverse());

        return {exactPredicate, exactMethods};
    });
}




// TODO: doc...
function findExactPredicateInMethodTable(normalisedPredicate: NormalPredicate, methods: Record<string, Function[]>): Predicate|null {
    for (let key in methods) {
        if (!methods.hasOwnProperty(key)) continue;
        let predicate = toPredicate(key);

        // Skip until we find the right predicate.
        if (toNormalPredicate(predicate) !== normalisedPredicate) continue;

        // Found it!
        return predicate;
    }

    // If we get here, there is no matching predicate in the method table.
    return null;
}
