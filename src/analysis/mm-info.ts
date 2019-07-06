import {EulerDiagram, EulerSet} from '../math/sets';
import {Options} from '../options';
import {assign} from '../util';
import {Configuration} from './configuration';
import {createConfiguration} from './configuration';




// TODO: temp testing
interface Config {
    options: Options;
    methods: Record<string, Function | Function[]>;
    decorators: Record<string, Function | Function[]>;
}




// TODO: doc...
export class MMInfo<TNode extends object = {}> {

    static create(config: Config) {

        // TODO: temp testing...
        let cfg = createConfiguration(config.options);
        let allMethods = combineMethodsAndDecorators(config.methods, config.decorators);
        let decorators = Object.keys(config.decorators).reduce(
            (decs, predicate) => decs.concat(config.decorators[predicate]),
            [] as Function[]
        );

        let ed = new EulerDiagram(Object.keys(allMethods), cfg.unreachable);
        let mminfo = new MMInfo();
        mminfo.config = cfg;
        mminfo.allMethods = allMethods;
        mminfo.decorators = new Set(decorators);
        mminfo.allNodes = ed.allSets.map(() => ({}));
        mminfo.rootNode = mminfo.allNodes[ed.allSets.indexOf(ed.universalSet)];
        mminfo.eulerDiagram = ed;
        return mminfo;
    }

    config: Configuration;

    allMethods: Record<string, Function[]>; // TODO: doc includes all regular methods and all decorators

    allNodes: TNode[];

    rootNode: TNode;

    isDecorator(m: Function): boolean {
        return this.decorators.has(m);
    }

    findNode(predicate: string): TNode | undefined {
        let set = this.eulerDiagram.findSet(predicate);
        let node = !!set ? this.allNodes[this.eulerDiagram.allSets.indexOf(set)] : undefined;
        return node;
    }

    // TODO: doc... modifies this MMInfo's nodes in-place. Returns this MMInfo instance, but with refined node types
    addProps<U extends object>(callback: (node: TNode, nodes: TNode[], set: EulerSet, sets: EulerSet[]) => U) {

        // Map over all nodes, obtaining the additional properties, and assigning each back into its corresponding node.
        let sets = this.eulerDiagram.allSets;
        let nodes = this.allNodes.map((node, i) => {
            let newProps = callback(node, this.allNodes, sets[i], sets); // TODO: was... || {};
            return assign(node, newProps);
        });

        // Return the same instance, but with nodes cast to a more refined type.
        // The `nodes` variable is only used for type inference.
        return this as any as MMInfo<typeof nodes[0]>;
    }

    private constructor() { }

    private eulerDiagram: EulerDiagram;

    private decorators: Set<Function>;
}




// TODO: doc...
function combineMethodsAndDecorators(methods: Record<string, Function | Function[]>, decorators: Record<string, Function | Function[]>) {
    let result = {} as Record<string, Function[]>;

    for (let predicate of Object.keys(decorators)) {
        let chain = [] as Function[];
        result[predicate] = chain.concat(decorators[predicate]);
    }

    for (let predicate of Object.keys(methods)) {
        let chain = result[predicate] || [];
        result[predicate] = chain.concat(methods[predicate]);
    }
    return result;
}
