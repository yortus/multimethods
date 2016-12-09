import NormalisedPredicate from './normalised-predicate';
import parse from './parse';
import Predicate from './predicate';





// TODO: ...
export default function Normalise(predicate: Predicate): NormalisedPredicate {

    // TODO: ...
    let ast = parse(predicate);
    return ast.signature as NormalisedPredicate;
}
