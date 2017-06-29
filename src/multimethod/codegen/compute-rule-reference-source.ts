import {EulerDiagram} from '../../set-theory/sets';
import {LineageII} from '../compute-predicate-lineages-ii';





export default function computeRuleReferenceSource(eulerDiagram: EulerDiagram<LineageII>) {

    // TODO: doc... isMatch:XXX
    let isMatchLines = eulerDiagram.sets.map(s => s.isMatchVarDecl);

    // TODO: doc... getCaptures:XXX
    let captureLines: string[] = [];
    eulerDiagram.sets.forEach(set => {
        for (let i = 0; i < set.matchingRules.length; ++i) {
            let rule = set.matchingRules[i];
            if (!rule.getCapturesVarDecl) continue;
            captureLines.push(rule.getCapturesVarDecl);
        }
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
