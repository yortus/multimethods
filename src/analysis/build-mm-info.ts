import {EulerDiagram, EulerSet} from '../math/sets';
import {MMInfo, NodeInfo} from '../mm-info';
import {Options} from '../options';
import {assign, DeepReplace} from '../util';
import {Configuration} from './configuration';
import {createConfiguration} from './configuration';




// TODO: temp testing
interface Config {
    options: Options;
    methods: Record<string, Function | Function[]>;
    decorators: Record<string, Function | Function[]>;
}

// TODO: temp testing
export function buildMMInfo(config: Config) {
    return new PartialMMInfo(config);
}




export type NodeProps = keyof NodeInfo;




// TODO: doc...
export class PartialMMInfo<P extends NodeProps = never> implements MMInfo<{}> {

    constructor(config: Config) {
        let cfg = createConfiguration(config.options);
        let allMethods = combineMethodsAndDecorators(config.methods, config.decorators);
        let decorators = Object.keys(config.decorators).reduce(
            (decs, predicate) => decs.concat(config.decorators[predicate]),
            [] as Function[]
        );

        let ed = new EulerDiagram(Object.keys(allMethods), cfg.unreachable);
        this.config = cfg;
        this.allMethods = allMethods;
        this.decorators = new Set(decorators);
        this.allNodes = ed.allSets.map(() => ({} as any)); // TODO: remove cast to any
        this.rootNode = this.allNodes[ed.allSets.indexOf(ed.universalSet)];
        this.eulerDiagram = ed;
    }

    config: Configuration;

    allMethods: Record<string, Function[]>; // TODO: doc includes all regular methods and all decorators

    allNodes: Array<PartialNode<P>>;

    rootNode: PartialNode<P>;

    isDecorator(m: Function): boolean {
        return this.decorators.has(m);
    }

    findNode(predicate: string): PartialNode<P> | undefined {
        let set = this.eulerDiagram.findSet(predicate);
        let node = !!set ? this.allNodes[this.eulerDiagram.allSets.indexOf(set)] : undefined;
        return node;
    }

    // TODO: doc... modifies this MMInfo's nodes in-place. Returns this MMInfo instance, but with refined node types
    addProps<U extends NodeProps>(callback: (node: PartialNode<P>, nodes: Array<PartialNode<P>>, set: EulerSet, sets: EulerSet[]) => {[K in U]: DeepReplace<NodeInfo[K], NodeInfo, PartialNode<P>>}) {

        // Map over all nodes, obtaining the additional properties, and assigning each back into its corresponding node.
        let sets = this.eulerDiagram.allSets;
        this.allNodes.forEach((node, i) => {
            let newProps = callback(node, this.allNodes, sets[i], sets); // TODO: was... || {};
            assign(node, newProps);
        });

        // Return the same instance, but with nodes cast to a more refined type.
        // The `nodes` variable is only used for type inference.
        return this as any as PartialMMInfo<P | U>;
    }

    private eulerDiagram: EulerDiagram;

    private decorators: Set<Function>;
}




export type PartialNode<P extends keyof NodeInfo> = {[K in P]: DeepReplace<NodeInfo[K], NodeInfo, PartialNode<P>>};




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
