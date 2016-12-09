import parse from './parse';
import Predicate from './predicate';





// TODO: ...
export default function makeIdentifier(predicate: Predicate): string {

    // TODO: ...
    let ast = parse(predicate);
    return ast.identifier;
}
