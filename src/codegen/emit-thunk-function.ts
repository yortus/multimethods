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
    let innerMethod = seq.filter((entry, j) => (j === 0 || entry.isMeta) && j < index).pop();

    // TODO: temp testing...
    emitThunkFromTemplate(emit, `${names.THUNK}ː${seq[index].identifier}`, mminfo.config.arity || 1, {

        // Statically known strings for substitution into the template
        UNHANDLED: names.UNHANDLED,
        EMPTY_OBJECT: names.EMPTY_OBJECT,
        GET_PATTERN_BINDINGS: `${names.GET_PATTERN_BINDINGS}ː${fromNode.identifier}`,
        METHOD: `${names.METHOD}ː${fromNode.identifier}${repeatString('ᐟ', methodIndex)}`,
        INNER_THUNK: innerMethod ? `${names.THUNK}ː${innerMethod.identifier}` : '',
        OUTER_THUNK: isLeastSpecificMethod ? '' : `${names.THUNK}ː${seq[index + 1].identifier}`,
        ARITY: `${mminfo.config.arity || 1}`,
        COPY_ARRAY: names.COPY_ARRAY,

        // Statically known booleans for dead code elimination
        HAS_PATTERN_BINDINGS: hasNamedCaptures(fromNode.exactPredicate),
        HAS_INNER_METHOD: innerMethod != null,
        HAS_OUTER_METHOD: !isLeastSpecificMethod && !seq[index + 1].isMeta,
        NO_THIS_REFERENCE_IN_METHOD: !/\bthis\b/g.test(fromNode.exactMethods[methodIndex].toString()),
    });
}





// TODO: doc...
function emitThunkFromTemplate(emit: Emitter, name: string, arity: number|undefined, env: ThunkFunctionSubstitutions) {
    let source = transformTemplate(thunkFunctionTemplate, name, arity, env);
    emit(source);
}
