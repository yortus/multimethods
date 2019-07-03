//import {MMInfo, MMNode} from '../analysis';
import {Thunk} from './thunk';




// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
export let discriminator: (...args: any[]) => string | Promise<string> = undefined!;
export let selectThunk: (discriminant: string) => Thunk = undefined!;
export let emptyObject: {} = undefined!;
export let copyArray: (els: any) => any[] = undefined!;
export let unhandled: (discriminant: string) => unknown = undefined!;

// TODO: ...
// export let mminfo: MMInfo<EmitNode>;
// export interface EmitNode extends MMNode {
//     isMatch: (discriminant: string) => {} | null;
//     hasPatternBindings: boolean;
//     getPatternBindings: (discriminant: string) => {[bindingName: string]: string};
// }
