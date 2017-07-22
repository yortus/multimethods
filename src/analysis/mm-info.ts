import {EulerDiagram, EulerSet} from '../math/sets';
import assign from '../util/object-assign';
import {NormalOptions} from './normalisation';





// TODO: doc...
export default class MMInfo<TNode> {

    static fromOptions(options: NormalOptions) {
        let ed = new EulerDiagram(Object.keys(options.methods));
        let mminfo = new MMInfo<{}>();
        mminfo.options = options;
        mminfo.allNodes = ed.allSets.map(() => ({}));
        mminfo.rootNode = mminfo.allNodes[ed.allSets.indexOf(ed.universalSet)];
        mminfo.eulerDiagram = ed;
        return mminfo;
    }

    options: NormalOptions;

    allNodes: TNode[];

    rootNode: TNode;

    findNode(predicate: string): TNode | undefined {
        let set = this.eulerDiagram.findSet(predicate);
        let node = !!set ? this.allNodes[this.eulerDiagram.allSets.indexOf(set)] : undefined;
        return node;
    }

    // TODO: doc... modifies this MMInfo's nodes in-place. Returns this MMInfo instance, but with refined node types
    addProps<U>(callback: (node: TNode, nodes: TNode[], set: EulerSet, sets: EulerSet[]) => U) {

        // Map over all nodes, obtaining the additional properties, and assigning each back into its corresponding node.
        let sets = this.eulerDiagram.allSets;
        let nodes = this.allNodes.map((node, i) => {
            let newProps = callback(node, this.allNodes, sets[i], sets) || {};
            return assign(node, newProps);
        });

        // Return the same instance, but with nodes cast to a more refined type.
        // The `nodes` variable is only used for type inference.
        return this as any as MMInfo<typeof nodes[0]>;
    }

    private constructor() { }

    private eulerDiagram: EulerDiagram;
}
