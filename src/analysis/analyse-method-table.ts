import isMetaMethod from '../util/is-meta-method';
import MMInfo from './mm-info';
import {NormalOptions} from './normalise-options';
import {toNormalPredicate, NormalPredicate, Predicate, toPredicate} from '../math/predicates';
import {PredicateInMethodTable, ExactlyMatchingMethods} from './node-parts';





// TODO: doc... Augment sets with exactly-matching methods in most- to least-specific order.
export default function analyseMethodTable<T>(mminfo: MMInfo<T>) {
    return mminfo.addProps((_, __, set) => {
        let predicateInMethodTable = findMatchingPredicateInMethodTable(set.predicate, mminfo.options.methods) || set.predicate;

        // Find the index in the chain where meta-methods end and regular methods begin.
        let chain = mminfo.options.methods[predicateInMethodTable] || [];
        if (!Array.isArray(chain)) chain = [chain];
        let i = 0;
        while (i < chain.length && isMetaMethod(chain[i])) ++i;
        // TODO: explain ordering: regular methods from left-to-right; then meta-methods from right-to-left
        let exactlyMatchingMethods = chain.slice(i).concat(chain.slice(0, i).reverse());

        return {predicateInMethodTable, exactlyMatchingMethods} as PredicateInMethodTable & ExactlyMatchingMethods;
    });
}





// TODO: doc...
function findMatchingPredicateInMethodTable(normalisedPredicate: NormalPredicate, methods: NormalOptions['methods']): Predicate|null {
    methods = methods || {};
    for (let key in methods) {
        let predicate = toPredicate(key);

        // Skip until we find the right predicate.
        if (toNormalPredicate(predicate) !== normalisedPredicate) continue;

        // Found it!
        return predicate;
    }

    // If we get here, there is no matching predicate in the given `methods`.
    return null;
}
