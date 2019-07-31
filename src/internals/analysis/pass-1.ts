import {Decorators, Methods} from '../../interface/multimethod';
import {OptionsObject} from '../../interface/options';
import {NormalisedPattern, Pattern} from '../patterns';
import {Taxonomy} from '../taxonomies';




export function pass1(options: Required<OptionsObject>, methods: Methods, decorators: Decorators) {

    let allMethods = combineMethodsAndDecorators(methods, decorators);
    let decoratorLookup = new Set(Object.keys(decorators).reduce(
        (decs, pattern) => decs.concat(decorators[pattern] as Function),
        [] as Function[]
    ));

    let taxonomy = new Taxonomy(Object.keys(allMethods), options.unreachable);
    let allNodes = taxonomy.allTaxons.map(taxon => {

        let exactPattern = taxon.pattern as Pattern;
        let exactMethods = [] as Function[];

        for (let key of Object.keys(allMethods)) {
            // Skip until we find the right pattern.
            if (NormalisedPattern(key) !== taxon.pattern) continue;

            // Found it!
            exactPattern = Pattern(key);
            exactMethods = allMethods[key] || [];
            break;
        }

        // NB: update in-place, with updated type
        return Object.assign(taxon, {exactPattern, exactMethods});
    });
    let rootNode = allNodes[taxonomy.allTaxons.indexOf(taxonomy.rootTaxon)];

    return {
        options,
        allMethods,
        allNodes,
        rootNode,
        isDecorator: (m: Function) => decoratorLookup.has(m),
    };
}




// TODO: doc...
function combineMethodsAndDecorators(methods: Methods, decorators: Decorators) {
    let result = {} as Record<string, Function[]>;

    // TODO: explain ordering: regular methods from left-to-right; then decorators from right-to-left

    for (let pattern of Object.keys(methods)) {
        let meths = methods[pattern];
        result[pattern] = Array.isArray(meths) ? meths : [meths];
    }

    for (let pattern of Object.keys(decorators)) {
        let chain = result[pattern] || [];
        let decs = decorators[pattern];
        decs = Array.isArray(decs) ? decs.slice() : [decs];
        result[pattern] = chain.concat(decs.reverse());
    }

    return result;
}
