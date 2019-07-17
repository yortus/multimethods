import {Predicate, toNormalPredicate, toPredicate} from '../math/predicates';
import {EulerDiagram} from '../math/sets';
import {OptionsObject} from '../options';
import {Dict} from '../util';




export function pass1(options: Required<OptionsObject>, methods: Dict<Function | Function[]>, decorators: Dict<Function | Function[]>) {

    let allMethods = combineMethodsAndDecorators(methods, decorators);
    let decoratorLookup = new Set(Object.keys(decorators).reduce(
        (decs, predicate) => decs.concat(decorators[predicate]),
        [] as Function[]
    ));

    let ed = new EulerDiagram(Object.keys(allMethods), options.unreachable);
    let allNodes = ed.allSets.map(set => {

        let exactPredicate = set.predicate as Predicate;
        let exactMethods = [] as Function[];

        for (let key of Object.keys(allMethods)) {
            // Skip until we find the right predicate.
            if (toNormalPredicate(key) !== set.predicate) continue;

            // Found it!
            exactPredicate = toPredicate(key);
            exactMethods = allMethods[key] || [];
            break;
        }

        // NB: update in-place, with updated type
        return Object.assign(set, {exactPredicate, exactMethods});
    });
    let rootNode = allNodes[ed.allSets.indexOf(ed.universalSet)];

    return {
        options,
        allMethods,
        allNodes,
        rootNode,
        isDecorator: (m: Function) => decoratorLookup.has(m),
    };
}




// TODO: doc...
function combineMethodsAndDecorators(methods: Dict<Function | Function[]>, decorators: Dict<Function | Function[]>) {
    let result = {} as Record<string, Function[]>;

    // TODO: explain ordering: regular methods from left-to-right; then meta-methods from right-to-left

    for (let predicate of Object.keys(methods)) {
        let meths = methods[predicate];
        result[predicate] = Array.isArray(meths) ? meths : [meths];
    }

    for (let predicate of Object.keys(decorators)) {
        let chain = result[predicate] || [];
        let decs = decorators[predicate];
        decs = Array.isArray(decs) ? decs.slice() : [decs];
        result[predicate] = chain.concat(decs.reverse());
    }

    return result;
}
