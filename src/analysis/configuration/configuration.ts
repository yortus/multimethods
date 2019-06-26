import {Unreachable} from '../../math/predicates';





// TODO: similar to Options but with more defined typing
export default interface Configuration {
    name: string;
    arity: number | undefined;
    async: boolean | undefined;
    strict: boolean;
    discriminator: Function;
    methods: {[predicate: string]: Function[]};
    unreachable: Unreachable;
}
