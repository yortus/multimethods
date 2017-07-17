import parse from './dsl-parser';
import Predicate from './predicate';





// TODO: revise old comment below...
//     // /**
//     //  * A string that is visually similar to the normalized form of this predicate, but is a valid `IdentifierPart*`
//     //  * as per the ECMAScript grammar (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-names-and-keywords).
//     //  * Different normalized forms are guaranteed to have different return values from this function.
//     //  */
export default function toIdentifierParts(predicate: Predicate): string {

    // TODO: ...
    let ast = parse(predicate);
    return ast.identifier;
}
