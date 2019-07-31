// TODO: doc...
export type Options<P extends unknown[] = unknown[], D extends Awaitable<string> = Awaitable<string>> =
    | Discriminator<P, D>
    | OptionsObject<P, D>;




// TODO: doc...
export interface OptionsObject<P extends unknown[] = unknown[], D extends Awaitable<string> = Awaitable<string>> {

    // TODO: doc...
    name?: string;

    discriminator?: Discriminator<P, D>;

    // TODO: temp testing...
    unhandled?: (...args: P) => unknown;

    // TODO: doc... advanced option...
    unreachable?: (pattern: string) => boolean;
}




// TODO: doc...
export type Discriminator<P extends unknown[] = unknown[], D extends Awaitable<string> = Awaitable<string>> = (...args: P) => D;




type Awaitable<T> = T | Promise<T>;
