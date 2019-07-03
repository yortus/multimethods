import {Unreachable} from '../../math/predicates';





// TODO: similar to Options but with more defined typing
export default interface Configuration {
    name: string;
    arity: number | undefined;
    async: boolean | undefined;
    strict: boolean;
    discriminator: (...args: any[]) => string | Promise<string>;
    methods: {[predicate: string]: Function[]};
    unreachable: Unreachable;
    unhandled: (discriminant: string) => unknown;
}
