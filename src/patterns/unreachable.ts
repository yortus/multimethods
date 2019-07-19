import {NormalisedPattern} from './normalised-pattern';




export type Unreachable = (pattern: NormalisedPattern) => (boolean | undefined);
