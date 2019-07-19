import {NormalPattern} from './normal-pattern';




export type Unreachable = (pattern: NormalPattern) => (boolean | undefined);
