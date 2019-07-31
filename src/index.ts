import * as types from './interface/multimethod';
import {createMultimethod} from './internals/create-multimethod';




export type Multimethod = types.Multimethod;
export const Multimethod = createMultimethod as types.MultimethodStatic;
export {next} from './interface/next';
export {Options} from './interface/options';
