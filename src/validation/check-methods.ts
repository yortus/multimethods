import {toNormalPredicate} from '../math/predicates';
import Options from '../options';
import * as fatalError from '../util/fatal-error';
import isMetaMethod from '../util/is-meta-method';





// TODO: doc and cleanup...
export default function checkMethods(methods: Options['methods']) {
    if (methods === undefined) return;

    // For method chains, ensure first regular method in chain (if any) comes after last meta-method in chain (if any).
    Object.keys(methods).forEach((predicate): void => {
        let method = methods[predicate];
        if (!Array.isArray(method)) return;
        let chain = method;
        if (chain.some((fn, i) => i < chain.length - 1 && !isMetaMethod(fn) && isMetaMethod(chain[i + 1]))) {
            return fatalError.MIXED_CHAIN(predicate);
        }
    });



    // TODO: doc these new invariants:
    // - all predicates in `methods` are valid
    // - no two predicates in `methods` have the same normalised predicate (use chains for this scenario)
    let deduped = {} as {[s: string]: string[]};
    Object.keys(methods).forEach(predicate => {
        let np = toNormalPredicate(predicate);
        deduped[np] = deduped[np] || [];
        deduped[np].push(predicate);
    });
    for (let np in deduped) {
        if (deduped[np].length <= 1) continue;
        fatalError.DUPLICATE_PREDICATE(np, `'${deduped[np].join(`', '`)}'`);
    }

}
