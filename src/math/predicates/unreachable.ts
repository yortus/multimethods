import NormalPredicate from './normal-predicate';





type Unreachable = (predicate: NormalPredicate) => (boolean | undefined);
export default Unreachable;
