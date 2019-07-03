import {Thunk} from './thunk';




// TODO: these are replacement placeholders.
// TODO: explain each of these in turn...
export let __MM_NAME__: string = undefined!;
export let __MM_ARITY__: number = undefined!;
export let __MM_PARAMS__: unknown[] = undefined!;
export let __THUNK_NAME__: string = undefined!;

// TODO: revise comment...
/*
refers to the first method in the next more-specific partition (see JSDoc notes at top
of this file). It is substituted in as the value of `forward` when a meta-method is called.
*/
export let __INNER_THUNK__: Thunk = undefined!;

// TODO: revise comment...
/* used for cascading evaluation, i.e. when the thunk's corresponding method signals it went unhandled. */
export let __OUTER_THUNK__: Thunk = undefined!;

export let __GET_PATTERN_BINDINGS__: (discriminant: string) => {} = undefined!;
export let __METHOD__: (...args: any[]) => any = undefined!; // Method signature, NB: context is passed last!

export let __HAS_PATTERN_BINDINGS__: boolean = undefined!;
export let __HAS_INNER_METHOD__: boolean = undefined!;
export let __HAS_OUTER_METHOD__: boolean = undefined!;
export let __NO_THIS_REFERENCE_IN_METHOD__: boolean = undefined!;
