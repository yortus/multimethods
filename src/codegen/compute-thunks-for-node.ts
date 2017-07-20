import isMetaMethod from '../util/is-meta-method';
import emitThunkFunction from './emit-thunk-function';
import repeatString from '../util/string-repeat';
import {MMNode} from '../analysis';
import {toIdentifierParts, parsePredicateSource} from '../math/predicates';
import ThunkInfo from './thunk-info';





// TODO: rewrite comments. Esp signature of route executor matches signature of multimethod (as per provided Options)
/**
 * Generates the virtual method, called a 'thunk', for the given node.
 * In the absence of meta-methods, the logic for the virtual method is straightforward: execute each matching method
 * in turn, from the most- to the least-specific, until one produces a result. With meta-methods, the logic becomes more
 * complex, because a meta-method must run *before* more-specific regular methods, with those more specific
 * methods being wrapped into a callback function and passed to the meta-method. To account for this, we perform
 * an order-preserving partitioning of all matching methods for the node, with each meta-method starting a new
 * partition. Within each partition, we use the straightforward cascading logic outlined above.
 * However, each partition as a whole is executed in reverse-order (least to most specific), with the next (more-specific)
 * partition being passed as the `next` parameter to the meta-method starting the previous (less-specific) partition.
 * @param {node} MMNode - contains the list of matching methods for the node's predicate, ordered from most- to least-specific.
 * @returns {Thunk} the virtual method for the node.
 */
export default function computeThunksForNode(node: MMNode, arity: number|undefined, async: boolean|undefined): ThunkInfo {

    const mostSpecificNode = node;
    let mseq = node.methodSequence;

    let sources = mseq.map(({method, node, localIndex}, i) => {
        const identifier = toIdentifierParts(node.exactPredicate);

        // To avoid unnecessary duplication, skip emit for regular methods that are less specific that the set's predicate, since these will be handled in their own set.
        if (!isMetaMethod(method) && node !== mostSpecificNode) return '';

        // TODO: temp testing... explain!!
        let isLeastSpecificMethod = i === mseq.length - 1;
        let downstream = mseq.filter(({method}, j) => (j === 0 || isMetaMethod(method)) && j < i).pop();

        // TODO: temp testing...
        return emitThunkFunction(`thunkː${mseq[i].identifier}`, arity, {
            IS_PROMISE: 'isPromiseLike',
            CONTINUE: 'CONTINUE',
            EMPTY_OBJECT: 'EMPTY_OBJECT',
            GET_CAPTURES: `getCapturesː${identifier}`,
            CALL_METHOD: `methodː${identifier}${repeatString('ᐟ', localIndex)}`,
            DELEGATE_DOWNSTREAM: downstream ? `thunkː${downstream.identifier}` : '',
            DELEGATE_FALLBACK: isLeastSpecificMethod ? '' : `thunkː${mseq[i + 1].identifier}`,

            // Statically known booleans --> 'true'/'false' literals (for dead code elimination)
            ENDS_PARTITION: isLeastSpecificMethod || isMetaMethod(mseq[i + 1].method),
            HAS_CAPTURES: parsePredicateSource(node.exactPredicate).captureNames.length > 0,
            IS_META_METHOD: isMetaMethod(method),
            HAS_DOWNSTREAM: downstream != null,
            IS_NEVER_ASYNC: async === false,
            IS_ALWAYS_ASYNC: async === true
        });
    });

    // TODO: thunk names and sources...

    // TODO: temp testing...
    // The 'entry point' method is the one whose method we call to begin the cascading evaluation of the route. It is the
    // least-specific meta-method, or if there are no meta-methods, it is the most-specific ordinary method.
    let entryPoint = mseq.filter(el => isMetaMethod(el.method)).pop() || mseq[0];
    return {
        name: `thunkː${entryPoint.identifier}`,
        source: sources.join('\n\n')
    };
}
