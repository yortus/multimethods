import {MMNode} from '../../analysis';




// TODO: need this? get rid of it?
export interface EmitNode extends MMNode {
    isMatch: (discriminant: string) => {} | null;
    hasPatternBindings: boolean;
    getPatternBindings: (discriminant: string) => {[bindingName: string]: string};
}
