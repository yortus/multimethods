import {EulerDiagram, EulerSet} from '../math/sets';
import {MMInfo} from '../mm-info';
import {Options} from '../options';
import {DeepUpdated, deepUpdateInPlace} from '../util';
import {createConfiguration} from './configuration';
import {checkMethodsAndDecorators, checkOptions} from './validation';
import {pass1} from './pass-1';
import {pass2} from './pass-2';
import {pass3} from './pass-3';




// TODO: temp testing
interface Config {
    options: Options;
    methods: Record<string, Function | Function[]>;
    decorators: Record<string, Function | Function[]>;
}




export interface MMInfoEx<TNode extends object = EulerSet> extends MMInfo<TNode> {
    map<UNode extends object>(callback: (node: TNode) => UNode): MMInfoEx<DeepUpdated<UNode, TNode, UNode>>;
}




// TODO: temp testing
export function makeMMInfo(options: Options, methods: Record<string, Function | Function[]>, decorators: Record<string, Function | Function[]>) {
    checkOptions(options); // NB: may throw
    checkMethodsAndDecorators(methods, decorators); // NB: may throw
    let mminfo0 = makeMMInfo2({options, methods, decorators});

    let mminfo1 = pass1(mminfo0);
    let mminfo2 = pass2(mminfo1);
    let mminfo3 = pass3(mminfo2);
    return mminfo3;
}




// TODO: temp testing
function makeMMInfo2(config: Config): MMInfoEx {

    let cfg = createConfiguration(config.options);
    let allMethods = combineMethodsAndDecorators(config.methods, config.decorators);
    let decorators = new Set(Object.keys(config.decorators).reduce(
        (decs, predicate) => decs.concat(config.decorators[predicate]),
        [] as Function[]
    ));

    let ed = new EulerDiagram(Object.keys(allMethods), cfg.unreachable);
    let allNodes = ed.allSets;
    let rootNode = allNodes[ed.allSets.indexOf(ed.universalSet)];

    let mminfo: MMInfo<EulerSet> = {
        config: cfg,
        allMethods,
        allNodes,
        rootNode,
        isDecorator: m => decorators.has(m),
        findNode(predicate) {
            let set = ed.findSet(predicate);
            let node = !!set ? this.allNodes[ed.allSets.indexOf(set)] : undefined;
            return node;
        },
    };

    let map = makeMapMethod(mminfo);
    return {...mminfo, map};
}




function makeMapMethod<TNode extends object>(mminfo: MMInfo<TNode>) {
    return <UNode extends object>(callback: (node: TNode) => UNode): MMInfoEx<DeepUpdated<UNode, TNode, UNode>> => {

        // 1. map each old node to its new node
        let oldNodes = mminfo.allNodes;
        let newNodes = new Set<UNode>();
        let mapped = oldNodes.reduce(
            (map, oldNode) => {
                let newNode = callback(oldNode);
                newNodes.add(newNode);
                map.set(oldNode, newNode);
                return map;
            },
            new Map<TNode, UNode>()
        );

        // 2. for each new node, deep-replace old node refs with new node refs
        // TODO: create a NEW mminfo... this just mutates the existing one and returns it...
        type VNode = DeepUpdated<UNode, TNode, UNode>;
        let x = {
            allNodes: oldNodes.map(n => mapped.get(n)! as unknown as VNode),
            rootNode: mapped.get(mminfo.rootNode)! as unknown as VNode,
        };
        deepUpdateInPlace(x, mapped);


        let result: MMInfo<VNode> = {
            config: mminfo.config,
            allMethods: mminfo.allMethods,
            allNodes: x.allNodes,
            rootNode: x.rootNode,
            isDecorator: mminfo.isDecorator,
            findNode(predicate) {
                let old = mminfo.findNode(predicate);
                let node = !!old ? result.allNodes[mminfo.allNodes.indexOf(old)] : undefined;
                return node;
            },
        };
        return {...result, map: makeMapMethod(result)};
    };
}




// TODO: doc...
function combineMethodsAndDecorators(methods: Record<string, Function | Function[]>, decorators: Record<string, Function | Function[]>) {
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
