import {Predicate} from '../../set-theory/predicates';





// TODO: doc...
export default interface MMInfo {
    name: string;

    arity: number | undefined;
    async: boolean | undefined;
    strict: boolean;
    toDiscriminant: Function;
    methods: {[predicate: string]: Function[]};

    nodes: MMNode[];
    root: MMNode;
}





// TODO: doc...
export interface MMNode {
    predicate: Predicate;
    methods: Function[];
    fallback: MMNode|null;

    identifier: string;
    isMatch(discriminant: string): object/*truthy*/|null/*falsy*/; // TODO: use like a boolean...
    getCaptures(discriminant: string): {[captureName: string]: string};

    thunkName: string;
    thunkSource: string;

    children: MMNode[];
}
