import Emitter from './emitter';
import isMetaMethod from '../util/is-meta-method';
import repeatString from '../util/string-repeat';
import {MMInfo, MMNode, MethodSequence} from '../analysis';
import {parsePredicateSource} from '../math/predicates';
import getNormalisedFunctionSource from './get-normalised-function-source';
import {template, VariablesInScope, BooleanConstants} from './source-templates/thunk-function-template';
import {transformFunctionSource} from './source-transforms';





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
export default function emitThunkFunction(emit: Emitter, mminfo: MMInfo<MMNode>, seq: MethodSequence<MMNode>['methodSequence'], index: number, env: Env) {
    let {method, fromNode} = seq[index];
    let i = index;

    // To avoid unnecessary duplication, skip emit for regular methods that are less specific that the set's predicate, since these will be handled in their own set.
    if (!isMetaMethod(method) && fromNode !== seq[0].fromNode) return;

    // TODO: temp testing... explain!!
    let isLeastSpecificMethod = i === seq.length - 1;
    let downstream = seq.filter(({method}, j) => (j === 0 || isMetaMethod(method)) && j < i).pop();

    // TODO: temp testing...
    emitThunkFromTemplate(emit, `${env.THUNK_PREFIX}${seq[i].identifier}`, mminfo.options.arity, {

        // Statically known strings for substitution into the template
        IS_PROMISE_LIKE: env.IS_PROMISE_LIKE,
        CONTINUE: env.CONTINUE,
        EMPTY_OBJECT: env.EMPTY_OBJECT,
        GET_CAPTURES: `${env.GET_CAPTURES_PREFIX}${fromNode.identifier}`,
        CALL_METHOD: `${env.METHOD_PREFIX}${fromNode.identifier}${repeatString('ᐟ', fromNode.exactMethods.indexOf(method))}`,
        DELEGATE_DOWNSTREAM: downstream ? `${env.THUNK_PREFIX}${downstream.identifier}` : '',
        DELEGATE_FALLBACK: isLeastSpecificMethod ? '' : `${env.THUNK_PREFIX}${seq[i + 1].identifier}`,

        // Statically known booleans for dead code elimination
        ENDS_PARTITION: isLeastSpecificMethod || isMetaMethod(seq[i + 1].method),
        HAS_CAPTURES: parsePredicateSource(fromNode.exactPredicate).captureNames.length > 0,
        IS_META_METHOD: isMetaMethod(method),
        HAS_DOWNSTREAM: downstream != null,
        IS_NEVER_ASYNC: mminfo.options.async === false,
        IS_ALWAYS_ASYNC: mminfo.options.async === true
    });
}





// TODO: doc...
export type Env = {
    IS_PROMISE_LIKE: string;
    CONTINUE: string;
    EMPTY_OBJECT: string;
    THUNK_PREFIX: string;
    GET_CAPTURES_PREFIX: string;
    METHOD_PREFIX: string;
}





// TODO: doc...
function emitThunkFromTemplate(emit: Emitter, name: string, arity: number|undefined, env: TemplateEnv) {
    let source = getNormalisedFunctionSource(template);
    source = transformFunctionSource(source, name, arity, env);
    emit(source);
}





// TODO: doc...
type TemplateEnv = {[K in keyof VariablesInScope]: string} & {[K in keyof BooleanConstants]: boolean};
