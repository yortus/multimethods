export {default as create} from './create';
export {default as Options} from './options';
export {NEXT, AMBIGUOUS_DISPATCH, UNHANDLED_DISPATCH} from './sentinels';
export {meta} from './decorators';




// TODO: temp testing...
import {NEXT} from './sentinels';
export const next = NEXT as never;
export {Multimethod} from './multimethod-impl';
