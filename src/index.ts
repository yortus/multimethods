import {Multimethod as MultimethodInstance, MultimethodConstructor} from './interface/multimethod';
import {createMultimethod} from './internals/create-multimethod';




export type Multimethod = MultimethodInstance;
export const Multimethod = createMultimethod as MultimethodConstructor;
export {next} from './interface/next';
export {Options} from './interface/options';
