import Rule from './rule';
import {EulerDiagram} from '../set-theory/sets';
import repeatString from '../util/repeat-string';
import {toIdentifierParts, parsePredicateSource, toMatchFunction} from '../set-theory/predicates';
import {Lineage} from './compute-predicate-lineages';
import isMetaHandler from './is-meta-handler';





// TODO: temp testing...
export interface LineageII {
    matchingRules: EmitInfo[];

    identifier: string;
    isMatch(discriminant: string): boolean;
    getCaptures(discriminant: string): {[captureName: string]: string};
}
export type EmitInfo = Rule & {
    callHandlerVarName: string;
    callHandlerVarDecl: string|null;
};





// TODO: ...
export default function computePredicateLineagesII<T>(eulerDiagram: EulerDiagram<T & Lineage>): EulerDiagram<T & LineageII> {

    let result = eulerDiagram.augment(set => {

        let matchingRules = set.lineage.map((rule, i) => {

            let callHandlerVarName = `callHandlerː${toIdentifierParts(set.predicate)}${repeatString('ᐟ', i)}`;
            let callHandlerVarDecl: string|null = null;

            // To avoid unnecessary duplication, skip emit for regular rules that are less specific that the set's predicate, since these will be handled in their own set.
            if (isMetaHandler(rule.handler) || eulerDiagram.get(rule.predicate) === set) {
                // TODO: move this emit string into snippets template function and extract from there
                callHandlerVarDecl = `var ${callHandlerVarName} = eulerDiagram.get('${set.predicate}').matchingRules[${i}].handler;`;
            }

            return {...rule, callHandlerVarName, callHandlerVarDecl};
        });

        let identifier = toIdentifierParts(set.predicate);
        let isMatch = toMatchFunction(set.predicate) as any; // TODO: doc casting effect here falsy->boolean (not quite accurate but works for conditionals)
        let hasCaptures = parsePredicateSource(set.lineage[0].predicate).captureNames.length > 0;
        let getCaptures = hasCaptures ? toMatchFunction(set.lineage[0].predicate) as any : null; // TODO: cleanup - remove lineage[0] ref

        return {matchingRules, identifier, isMatch, getCaptures};
    });

    return result;
}
