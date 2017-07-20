import assign from '../util/object-assign';
import {NormalOptions} from './normalise-options';
import {EulerDiagram, EulerSet} from '../math/sets';





// TODO: doc...
export default class MMInfo<TNode extends {[x: string]: any}> {
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

    // TODO: doc... modifies this MMInfo's nodes in-place. Returns this MMInfo instance, but with refined type info.
    addProps<U extends {[x: string]: any}>(callback: (node: TNode, nodes: TNode[], set: EulerSet, sets: EulerSet[]) => U) {
        let nodes2 = addProps(this.allNodes, this.eulerDiagram.allSets, callback);
        return this as any as MMInfo<typeof nodes2[0]>;
    }

    private constructor() { }

    private eulerDiagram: EulerDiagram;
}





/** Internal helper function used to implement MMInfo#addProps. */
function addProps<T extends {[x: string]: any}, U extends {[x: string]: any}>(nodes: T[], sets: EulerSet[], callback: (node: T, nodes: T[], set: EulerSet, sets: EulerSet[]) => U) {

    // Map over the new nodes, obtaining the additional properties, and assigning them into their corresponding node.
    let nodes2 = nodes.map((node, i) => {
        let newProps = callback(node, nodes, sets[i], sets) || {};
        return assign(node, newProps);
    });

    // Return the same nodes, but cast to a more refined type.
    return nodes2;
}
