import {NormalPredicate, Predicate, toNormalPredicate, toPredicate} from '../math/predicates';
import isMetaMethod from '../util/is-meta-method';
import Configuration from './configuration';
import MMInfo from './mm-info';
import {MethodTableEntry} from './mm-node';





// TODO: doc... Get predicates and exactly-matching methods in most- to least-specific order.
export default function analyseMethodTable<T>(mminfo: MMInfo<T>) {
    return mminfo.addProps((_, __, set) => {
        let exactPredicate = findExactPredicateInMethodTable(set.predicate, mminfo.config) || set.predicate;

        // Find the index in the chain where meta-methods end and regular methods begin.
        let chain = mminfo.config.methods[exactPredicate] || [];
        if (!Array.isArray(chain)) chain = [chain];
        let i = 0;
        while (i < chain.length && isMetaMethod(chain[i])) ++i;
        // TODO: explain ordering: regular methods from left-to-right; then meta-methods from right-to-left
        let exactMethods = chain.slice(i).concat(chain.slice(0, i).reverse());

        return {exactPredicate, exactMethods} as MethodTableEntry;
    });
}





// TODO: doc...
function findExactPredicateInMethodTable(normalisedPredicate: NormalPredicate, config: Configuration): Predicate|null {
    for (let key in config.methods) {
        if (!config.methods.hasOwnProperty(key)) continue;
        let predicate = toPredicate(key);

        // Skip until we find the right predicate.
        if (toNormalPredicate(predicate) !== normalisedPredicate) continue;

        // Found it!
        return predicate;
    }

    // If we get here, there is no matching predicate in the method table.
    return null;
}
