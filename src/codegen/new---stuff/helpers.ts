import {MethodSequenceEntry, MMInfo, MMNode} from '../../analysis';
import {hasNamedCaptures} from '../../math/predicates';
import repeatString from '../../util/string-repeat';
import {makeParameterList} from '../make-parameter-list';



// PER MULTIMETHOD:
// - MM_NAME
// - MM.ARITY
// - MM_PARAMS
//
// PER NODE:
// - NODE.IS_MATCH = toMatchFunction(toNormalPredicate(node.exactPredicate));
// - NODE.HAS_PATTERN_BINDINGS = hasNamedCaptures(node.exactPredicate);
// - NODE.GET_PATTERN_BINDINGS = toMatchFunction(node.exactPredicate) as EmitNode['getPatternBindings'];
//
// PER EXACT_METHOD in a node:
// - METHOD.NAME
//
// PER METHOD_SEQUENCE_ENTRY in a node:
// - MATCH.THUNK_NAME
// - MATCH.METHOD_NAME
// - MATCH.HAS_NO_THIS_REFERENCE_IN_METHOD
// - MATCH.HAS_OUTER_MATCH
// - MATCH.OUTER_THUNK_NAME
// - MATCH.HAS_INNER_MATCH
// - MATCH.INNER_THUNK_NAME




export function getMultimethodSubstitutions(mminfo: MMInfo<MMNode>) {
    return {
        NAME: mminfo.config.name,
        ARITY: String(mminfo.config.arity || 1),
        PARAMS: makeParameterList(mminfo.config.arity || 1),
        NAMEOF_SELECT_THUNK: 'selectThunk',
    };
}




export function getNodeSubstitutions(node: MMNode, nodeIndex?: number) {
    return {
        INDEX: nodeIndex,
        NAMEOF_IS_MATCH: `isMatchː${node.identifier}`,
        HAS_PATTERN_BINDINGS: hasNamedCaptures(node.exactPredicate),
        NAMEOF_GET_PATTERN_BINDINGS: `getPatternBindingsː${node.identifier}`,
    };
}




export function getMethodSubstitutions(node: MMNode, methodIndex: number) {
    return {
        NAME: getMethodName(node, methodIndex),
        INDEX: methodIndex,
    };
}




export function getThunkSubstitutions(seq: Array<MethodSequenceEntry<MMNode>>, index: number) {
    let {fromNode, methodIndex} = seq[index];

    // TODO: temp testing... explain these calcs!!
    let isLeastSpecificMethod = index === seq.length - 1;
    let innerMethod = seq.filter((entry, j) => (j === 0 || entry.isMeta) && j < index).pop();

    return {
        NAMEOF_THUNK: getThunkName(seq, index),
        NAMEOF_METHOD: getMethodName(fromNode, methodIndex),
        HAS_NO_THIS_REFERENCE_IN_METHOD: !/\bthis\b/g.test(fromNode.exactMethods[methodIndex].toString()),
        HAS_OUTER_MATCH: !isLeastSpecificMethod && !seq[index + 1].isMeta,
        NAMEOF_OUTER_THUNK: isLeastSpecificMethod ? '' : getThunkName(seq, index + 1),
        HAS_INNER_MATCH: innerMethod != null,
        NAMEOF_INNER_THUNK: innerMethod ? getThunkName([innerMethod], 0) : '',
    };
}




export function getThunkName(seq: Array<MethodSequenceEntry<MMNode>>, index: number) {
    return `thunkː${seq[index].identifier}`;
}




export function getMethodName(node: MMNode, methodIndex: number) {
    return `methodː${node.identifier}${repeatString('ᐟ', methodIndex)}`;
}
