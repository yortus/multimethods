import {NormalPredicate} from './normal-predicate';





export type Unreachable = (predicate: NormalPredicate) => (boolean | undefined);
