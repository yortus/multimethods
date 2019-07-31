// TODO: doc...
export type Options<P extends unknown[] = unknown[], D extends Awaitable<string> = Awaitable<string>> =
    | DiscriminatorFunction<P, D>
    | OptionsObject<P, D>;




// TODO: doc...
export interface OptionsObject<P extends unknown[] = unknown[], D extends Awaitable<string> = Awaitable<string>> {

    // TODO: doc...
    name?: string;

    discriminator?: DiscriminatorFunction<P, D>;

    // TODO: doc... advanced option...
    unreachable?: (pattern: string) => boolean;

    // TODO: temp testing...
    unhandled?: (discriminant: string) => unknown;
}




// TODO: doc...
export type DiscriminatorFunction<P extends unknown[], D extends Awaitable<string>> = (...args: P) => D;




type Awaitable<T> = T | Promise<T>;
