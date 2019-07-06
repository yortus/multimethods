import {Unreachable} from '../../math/predicates';





// TODO: similar to Options but with more defined typing
export interface Configuration {
    name: string;
    discriminator: (...args: any[]) => string | Promise<string>;
    unreachable: Unreachable;
    unhandled: (discriminant: string) => unknown;
}
