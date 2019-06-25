import {MethodSequenceEntry, MMInfo, MMNode} from '../analysis';
import {hasNamedCaptures} from '../math/predicates';
import repeatString from '../util/string-repeat';
import Emitter, {EnvNames} from './emitter';
import {ThunkFunctionSubstitutions, thunkFunctionTemplate} from './template-code';
import {transformTemplate} from './template-transforms';





// TODO: rewrite comments. Esp signature of route executor matches signature of multimethod (as per provided Options)
/**
 * Generates the virtual method, called a 'thunk', for the given node.
 * In the absence of meta-methods, the logic for the virtual method is straightforward: execute each matching method
 * in turn, from the most- to the least-specific, until one produces a result. With meta-methods, the logic becomes more
 * complex, because a meta-method must run *before* more-specific regular methods, with those more specific
 * methods being wrapped into a callback function and passed to the meta-method. To account for this, we perform
 * an order-preserving partitioning of all matching methods for the node, with each meta-method starting a new
 * partition. Within each partition, we use the straightforward cascading logic outlined above.
 * However, each partition as a whole is executed in reverse-order (least to most specific), with the next
 * (more-specific) partition being passed as the `next` parameter to the meta-method starting the previous
 * (less-specific) partition.
 * @param {node} MMNode - TODO: fix these...
 * @returns {Thunk} TODO:...
 */
export default function emitThunkFunction(emit: Emitter,
                                          mminfo: MMInfo<MMNode>,
                                          seq: Array<MethodSequenceEntry<MMNode>>,
                                          index: number,
                                          names: typeof EnvNames) {

    let {fromNode, methodIndex, isMeta} = seq[index];

    // To avoid unnecessary duplication, skip emit for regular methods that are less
    // specific that the set's predicate, since these will be handled in their own set.
    if (!isMeta && fromNode !== seq[0].fromNode) return;

    // TODO: temp testing... explain these calcs!!
    let isLeastSpecificMethod = index === seq.length - 1;
    let downstream = seq.filter((entry, j) => (j === 0 || entry.isMeta) && j < index).pop();

    // TODO: temp testing...
    emitThunkFromTemplate(emit, `${names.THUNK}ː${seq[index].identifier}`, mminfo.config.arity || 1, {

        // Statically known strings for substitution into the template
        IS_PROMISE_LIKE: names.IS_PROMISE_LIKE,
        CONTINUE: names.CONTINUE,
        EMPTY_CONTEXT: names.EMPTY_CONTEXT,
        ERROR_INVALID_RESULT: names.ERROR_INVALID_RESULT,
        GET_CAPTURES: `${names.GET_CAPTURES}ː${fromNode.identifier}`,
        METHOD: `${names.METHOD}ː${fromNode.identifier}${repeatString('ᐟ', methodIndex)}`,
        DOWNSTREAM_THUNK: downstream ? `${names.THUNK}ː${downstream.identifier}` : '',
        FALLBACK_THUNK: isLeastSpecificMethod ? '' : `${names.THUNK}ː${seq[index + 1].identifier}`,
        ARITY: `${mminfo.config.arity || 1}`,

        // Statically known booleans for dead code elimination
        ENDS_PARTITION: isLeastSpecificMethod || seq[index + 1].isMeta,
        HAS_CAPTURES: hasNamedCaptures(fromNode.exactPredicate),
        IS_META_METHOD: isMeta,
        HAS_DOWNSTREAM: downstream != null,
    });
}





// TODO: doc...
function emitThunkFromTemplate(emit: Emitter, name: string, arity: number|undefined, env: ThunkFunctionSubstitutions) {
    let source = transformTemplate(thunkFunctionTemplate, name, arity, env);
    emit(source);
}
