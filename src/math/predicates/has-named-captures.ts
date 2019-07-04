import {Predicate} from './predicate';





export function hasNamedCaptures(predicate: Predicate) {
    // TODO: this may become unreliable in future; eg  if `{` can appear in escape sequences or comments...
    return predicate.indexOf('{') !== -1;
}
