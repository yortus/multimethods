import {Pattern} from './pattern';




/**
 * A pattern in normal form. Normal patterns use a subset of the full pattern DSL syntax [1]. Every pattern corresponds
 * to exactly one normal form that defines the same set of values. Two distinct patterns that define the same set of
 * values are guaranteed to have the same normal form.
 * [1] TODO: ...
 */
export type NormalPattern = Pattern & { __normalPatternBrand: any };
