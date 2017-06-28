//import {CONTINUE} from './sentinels';
//import disambiguateRoutes from './disambiguate-routes';
//import fatalError from '../util/fatal-error';
import Rule from './rule';
//import {Predicate, toNormalPredicate, ANY} from '../set-theory/predicates';
import {EulerDiagram, /*EulerSet*/} from '../set-theory/sets';

import repeatString from '../util/repeat-string';
import {toIdentifierParts, /*parsePredicatePattern*/} from '../set-theory/predicates';
import {Lineage} from './compute-predicate-lineages';





// TODO: temp testing...
export interface LineageII {
    matchingRules: EmitInfo[];
}
export type EmitInfo = Rule & {
    callHandlerVarName: string;
    callHandlerVarDecl: string|null;
    // getCapturesVarName: string|null;
    // getCapturesVarDecl: string|null;
    // thunkFunctionName: string;
    // thunkFunctionDecl: string;
};





// TODO: ...
export default function computePredicateLineagesII<T>(eulerDiagram: EulerDiagram<T & Lineage>): EulerDiagram<T & LineageII> {

    let result = eulerDiagram.augment(set => {

        let matchingRules = set.lineage.map((rule, i) => {


            // TODO: put these (or at least second one) in snippets template function
            let callHandlerVarName = `callHandlerː${toIdentifierParts(rule.predicate)}${repeatString('ᐟ', i)}`;
            let callHandlerVarDecl: string|null = null;
            if (rule.isMetaRule || eulerDiagram.get(rule.predicate) === set) {
                callHandlerVarDecl = `var ${callHandlerVarName} = eulerDiagram.get('${rule.predicate}').matchingRules[${i}].handler;`;
            }



            return {
                ...rule,
                callHandlerVarName,
                callHandlerVarDecl
            };
        });


        return {matchingRules};
        
    });

    return result;
}
