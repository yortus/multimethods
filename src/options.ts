import {Unreachable} from './math/predicates';





// TODO: doc...
export interface Options {

    // TODO: doc...
    name?: string;

    discriminator?: Function;

    // TODO: doc... advanced option...
    unreachable?: Unreachable;

    // TODO: temp testing...
    unhandled?: (discriminant: string) => unknown;
}
