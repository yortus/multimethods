import instrumentDispatchFunction from './instrument-dispatch-function';
import instrumentMethods from './instrument-methods';
import {Emitter} from "../codegen";





export default function instrument(emit: Emitter) {
    instrumentMethods(emit.env);
    let oldBuild = emit.build.bind(emit);
    emit.build = () => instrumentDispatchFunction(emit.env, oldBuild());
}
