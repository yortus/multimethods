import {EulerDiagram} from '../../set-theory/sets';
import {LineageII} from '../compute-predicate-lineages-ii';
import repeatString from '../../util/repeat-string';
import {toIdentifierParts, parsePredicatePattern} from '../../set-theory/predicates';





export default function computeRuleReferenceSource(eulerDiagram: EulerDiagram<LineageII>) {

    // TODO: doc... isMatch:XXX
    let predicates = eulerDiagram.sets.map(set => set.predicate);
    let isMatchLines = predicates.map(p => `var isMatchː${toIdentifierParts(p)} = toMatchFunction(eulerDiagram.get('${p}').predicate);`);

    // TODO: doc... getCaptures:XXX
    let captureLines: string[] = [];
    eulerDiagram.sets.forEach(set => {
        let p = set.predicate;
        for (let i = 0; i < set.lineage.length; ++i) {

            // TODO: copypasta 3000 - extract helper fn?
            // To avoid unnecessary duplication, skip emit for regular rules that are less specific that the set's predicate, since these will be handled in their own set.
            let rule = set.lineage[i];
            if (!rule.isMetaRule && eulerDiagram.get(rule.predicate) !== set) continue;

            let hasCaptures = parsePredicatePattern(rule.predicate).captureNames.length > 0;
            if (!hasCaptures) continue;

            let varName = `getCapturesː${toIdentifierParts(p)}${repeatString('ᐟ', i)}`;
            captureLines.push(`var ${varName} = toMatchFunction(eulerDiagram.get('${p}').lineage[${i}].predicate);`);
        }
    });

    // TODO: doc... callHandler:XXX
    let handlerLines: string[] = [];
    eulerDiagram.sets.forEach(set => {
        let p = set.predicate;
        for (let i = 0; i < set.lineage.length; ++i) {

            // TODO: copypasta 3000 - extract helper fn?
            // To avoid unnecessary duplication, skip emit for regular rules that are less specific that the set's predicate, since these will be handled in their own set.
            let rule = set.lineage[i];
            if (!rule.isMetaRule && eulerDiagram.get(rule.predicate) !== set) continue;

            let varName = `callHandlerː${toIdentifierParts(p)}${repeatString('ᐟ', i)}`;
            handlerLines.push(`var ${varName} = eulerDiagram.get('${p}').lineage[${i}].handler;`);
        }
    });

    let source = [...isMatchLines, '', ...captureLines, '', ...handlerLines].join('\n') + '\n';
    return source;
}
