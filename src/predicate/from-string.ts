import parse from './parse';
import Predicate from './predicate';





export default function fromString(source: string): Predicate {

    // Parse the source string to test its validity. NB: may throw.
    parse(source);

    // If we get here, `source` is a valid predicate.
    return source as Predicate;
}
