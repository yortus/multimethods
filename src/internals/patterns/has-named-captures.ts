import {Pattern} from './pattern';




export function hasNamedCaptures(pattern: Pattern) {
    // TODO: this may become unreliable in future; eg  if `{` can appear in escape sequences or comments...
    return pattern.indexOf('{') !== -1;
}
