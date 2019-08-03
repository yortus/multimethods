import {Decorators, Methods} from '../../interface/multimethod';
import {OptionsObject} from '../../interface/options';




export interface InternalOptions extends Required<OptionsObject> {

    unreachable: never; // TODO: ...

    methods: Methods;

    decorators: Decorators;
}
