import parse from './dsl-parser';
import Predicate from './predicate';





/** Asserts `source` is a valid predicate string and returns it. Throws otherwise. */
export default function toPredicate(source: string): Predicate {

    // Parse the source string to assert its validity. NB: may throw.
    parse(source);

    // If we get here, `source` is a valid predicate.
    return source as Predicate;
}
