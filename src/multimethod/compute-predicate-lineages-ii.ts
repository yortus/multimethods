//import {CONTINUE} from './sentinels';
//import disambiguateRoutes from './disambiguate-routes';
//import fatalError from '../util/fatal-error';
import Rule from './rule';
//import {Predicate, toNormalPredicate, ANY} from '../set-theory/predicates';
import {EulerDiagram, /*EulerSet*/} from '../set-theory/sets';

import repeatString from '../util/repeat-string';
import {toIdentifierParts, parsePredicatePattern} from '../set-theory/predicates';
import {Lineage} from './compute-predicate-lineages';
import isMetaHandler from './is-meta-handler';





// TODO: temp testing...
export interface LineageII {
    matchingRules: EmitInfo[];
    isMatchVarName: string;
    isMatchVarDecl: string|null;
}
export type EmitInfo = Rule & {
    callHandlerVarName: string;
    callHandlerVarDecl: string|null;
    getCapturesVarName: string;
    getCapturesVarDecl: string|null;
    // thunkFunctionName: string;
    // thunkFunctionDecl: string;
};





// TODO: ...
export default function computePredicateLineagesII<T>(eulerDiagram: EulerDiagram<T & Lineage>): EulerDiagram<T & LineageII> {

    let result = eulerDiagram.augment(set => {

        let matchingRules = set.lineage.map((rule, i) => {

            let callHandlerVarName = `callHandlerː${toIdentifierParts(set.predicate)}${repeatString('ᐟ', i)}`;
            let getCapturesVarName = `getCapturesː${toIdentifierParts(set.predicate)}${repeatString('ᐟ', i)}`;
            let callHandlerVarDecl: string|null = null;
            let getCapturesVarDecl: string|null = null;

            // To avoid unnecessary duplication, skip emit for regular rules that are less specific that the set's predicate, since these will be handled in their own set.
            if (isMetaHandler(rule.handler) || eulerDiagram.get(rule.predicate) === set) {
                // TODO: move this emit string into snippets template function and extract from there
                callHandlerVarDecl = `var ${callHandlerVarName} = eulerDiagram.get('${set.predicate}').matchingRules[${i}].handler;`;

                let hasCaptures = parsePredicatePattern(rule.predicate).captureNames.length > 0;
                if (hasCaptures) {
                    // TODO: line too long!
                    // TODO: move this emit string into snippets template function and extract from there
                    getCapturesVarDecl = `var ${getCapturesVarName} = toMatchFunction(eulerDiagram.get('${set.predicate}').matchingRules[${i}].predicate);`;
                }
            }



            return {
                ...rule,
                callHandlerVarName,
                callHandlerVarDecl,
                getCapturesVarName,
                getCapturesVarDecl
            };
        });

        let isMatchVarName = `isMatchː${toIdentifierParts(set.predicate)}`;
        let isMatchVarDecl = `var ${isMatchVarName} = toMatchFunction(eulerDiagram.get('${set.predicate}').predicate);`;

        return {matchingRules, isMatchVarName, isMatchVarDecl};
        
    });

    return result;
}
