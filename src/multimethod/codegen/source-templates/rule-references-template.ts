import {Predicate} from '../../../set-theory/predicates';
import {EulerDiagram} from '../../../set-theory/sets';
import {LineageII} from '../../compute-predicate-lineages-ii';





// TODO: ========== The actual template ==========
// TODO: explain important norms in the template function... eg '$', __VARARGS__, __FUNCNAME__
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export const template = function __FUNCNAME__() {
    /*<snip>*/

    if ($.IS_FIRST_RULE) {
        /*!var*/ $.MATCH = $.TO_MATCH_FUNCTION($.EULER_DIAGRAM.get($.PREDICATE_STRING_LITERAL).predicate);
    }

    /*!var*/ $.CALL_HANDLER = $.EULER_DIAGRAM.get($.PREDICATE_STRING_LITERAL).matchingRules[0].handler;

    if ($.HAS_CAPTURES) {
        /*!var*/ $.GET_CAPTURES = $.TO_MATCH_FUNCTION($.EULER_DIAGRAM.get($.PREDICATE_STRING_LITERAL).matchingRules[0].predicate);
    }

    /*</snip>*/
}





// TODO: explain...
declare const $: VariablesInScope & BooleanConstants;





// TODO: these are replacement placeholders.
// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export interface VariablesInScope {
    PREDICATE_STRING_LITERAL: string; // TODO: doc: caller expected to include surrounding quote delimiters
    MATCH: Function;
    CALL_HANDLER: Function;
    GET_CAPTURES: Function;
    EULER_DIAGRAM: EulerDiagram<LineageII>;
    TO_MATCH_FUNCTION: (predicate: Predicate) => Function;
}

// TODO: these are statically known conditions that facilitate dead code elimination
// TODO: explain each of these in turn...
export interface BooleanConstants {
    IS_FIRST_RULE: boolean;
    HAS_CAPTURES: boolean;
}
