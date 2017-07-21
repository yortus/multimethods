import instrumentDispatchFunction from './instrument-dispatch-function';
import instrumentMethods from './instrument-methods';
import {Emitter} from "../codegen";





// TODO: doc...
export default function instrument(emit: Emitter) {

    // Replace all the methods with instrumented ones in-place in the mminfo structure.
    instrumentMethods(emit.env);

    // Replace the emitter's `build` method with one that returns an instrumented dispatch function.
    let oldBuild = emit.build.bind(emit);
    emit.build = () => instrumentDispatchFunction(emit.env, oldBuild());
}
