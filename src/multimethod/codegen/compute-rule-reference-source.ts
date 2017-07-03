import {EulerDiagram} from '../../set-theory/sets';
import {LineageII} from '../compute-predicate-lineages-ii';





export default function computeRuleReferenceSource(eulerDiagram: EulerDiagram<LineageII>) {

    // TODO: doc... isMatch:XXX
//    let isMatchLines = eulerDiagram.sets.map(s => s.isMatchVarDecl);
    let isMatchLines = eulerDiagram.sets.map(s => {
        return `var isMatchː${s.identifier} = eulerDiagram.get('${s.predicate}').isMatch;`;
    });

    // TODO: doc... getCaptures:XXX
    let captureLines: string[] = [];
    eulerDiagram.sets.forEach(set => {
        if (!set.getCaptures) return;
        captureLines.push(`var getCapturesː${set.identifier} = eulerDiagram.get('${set.predicate}').getCaptures;`);
    });

    // TODO: doc... callHandler:XXX
    let handlerLines: string[] = [];
    eulerDiagram.sets.forEach(set => {
        for (let i = 0; i < set.matchingRules.length; ++i) {
            let rule = set.matchingRules[i];
            if (!rule.callHandlerVarDecl) continue;
            handlerLines.push(rule.callHandlerVarDecl);
        }
    });

    let source = [...isMatchLines, '', ...captureLines, '', ...handlerLines].join('\n') + '\n';
    return source;
}
