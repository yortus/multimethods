import {MethodSequenceEntry, MMInfo, MMNode} from '../analysis';
import {hasNamedCaptures} from '../math/predicates';
import repeatString from '../util/string-repeat';
import {eliminateDeadCode} from './eliminate-dead-code';
import Emitter, {EnvNames} from './emitter';
import * as environment from './eval-environment';
import * as placeholders from './eval-placeholders';
import {getNormalisedFunctionSource} from './get-normalised-function-source';
import {makeParameterList} from './make-parameter-list';
import {replaceAll} from './replace-all';




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
 */
export default function emitThunk(emit: Emitter,
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
    let source = getNormalisedFunctionSource(thunkTemplate);
    let replacements: Partial<Record<keyof typeof placeholders, string | boolean>> = {
        __MM_ARITY__: String(mminfo.config.arity || 1),
        __MM_PARAMS__: makeParameterList(mminfo.config.arity || 1),
        __THUNK_NAME__: `${names.THUNK}ː${seq[index].identifier}`,
        __METHOD__: `${names.METHOD}ː${fromNode.identifier}${repeatString('ᐟ', methodIndex)}`,
        __NO_THIS_REFERENCE_IN_METHOD__: !/\bthis\b/g.test(fromNode.exactMethods[methodIndex].toString()),
        __HAS_PATTERN_BINDINGS__: hasNamedCaptures(fromNode.exactPredicate),
        __GET_PATTERN_BINDINGS__: `${names.GET_PATTERN_BINDINGS}ː${fromNode.identifier}`,
        __HAS_OUTER_METHOD__: !isLeastSpecificMethod && !seq[index + 1].isMeta,
        __OUTER_THUNK__: isLeastSpecificMethod ? '' : `${names.THUNK}ː${seq[index + 1].identifier}`,
        __HAS_INNER_METHOD__: innerMethod != null,
        __INNER_THUNK__: innerMethod ? `${names.THUNK}ː${innerMethod.identifier}` : '',
    };
    source = replaceAll(source, replacements);
    source = eliminateDeadCode(source);
    emit(source);
}




// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __ARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
const thunkTemplate = function __THUNK_NAME__(disc: string, __MM_PARAMS__: any[], args: any[] | false) {

    // TODO: explain - template source can only include constructs that are supported by all target runtimes. So no ES6.
    // tslint:disable: no-shadowed-variable
    // tslint:disable: no-var-keyword
    // tslint:disable: object-literal-shorthand
    // tslint:disable: only-arrow-functions

    if (__NO_THIS_REFERENCE_IN_METHOD__) {
        return args ? __METHOD__.apply(undefined, args) : __METHOD__(__MM_PARAMS__);
    }
    else {
        if (__HAS_OUTER_METHOD__) {
            var outer = function () { return __OUTER_THUNK__(disc, __MM_PARAMS__, args); };
        }
        else {
            var outer = function () { return unhandled(disc) as unknown; };
        }

        if (__HAS_INNER_METHOD__) {
            var inner = function (__MM_PARAMS__: any[]) {
                return __INNER_THUNK__(disc, __MM_PARAMS__, arguments.length > __MM_ARITY__ && copyArray(arguments));
            };
        }
        else {
            var inner: typeof inner = function () { return unhandled(disc); };
        }

        if (__HAS_PATTERN_BINDINGS__) {
            var pattern = __GET_PATTERN_BINDINGS__(disc);
        }
        else {
            var pattern = emptyObject;

        }

        var context = { pattern: pattern, inner: inner, outer: outer };
        return args ? __METHOD__.apply(context, args) : __METHOD__.call(context, __MM_PARAMS__);
    }
};




const {copyArray, emptyObject, unhandled} = environment;
const {
    __MM_ARITY__,
    __GET_PATTERN_BINDINGS__, __HAS_INNER_METHOD__, __HAS_OUTER_METHOD__, __HAS_PATTERN_BINDINGS__,
    __INNER_THUNK__, __METHOD__, __NO_THIS_REFERENCE_IN_METHOD__, __OUTER_THUNK__,
} = placeholders;
