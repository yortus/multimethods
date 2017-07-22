import {Emitter} from '../codegen';
import instrumentDispatchFunction from './instrument-dispatch-function';
import instrumentMethods from './instrument-methods';





// TODO: doc...
export default function instrument(emit: Emitter) {

    // Replace all the methods with instrumented ones in-place in the mminfo structure.
    instrumentMethods(emit.env);

    // Replace the emitter's `generate` method with one that returns an instrumented dispatch function.
    let oldGenerate = emit.generate.bind(emit);
    emit.generate = () => instrumentDispatchFunction(emit.env, oldGenerate());
}
