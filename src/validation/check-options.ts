import {Options} from '../options';
import {fatalError} from '../util';





// TODO: doc...
export function checkOptions(options: Options): void {

    // `name` must be either undefined, or conform to [A-Za-z$_][A-Za-z$_0-9]* (ie a simple JS indentifier).
    if (options.name !== undefined) {
        let isValid = typeof options.name === 'string';
        isValid = isValid && /[A-Za-z$_][A-Za-z$_0-9]*/.test(options.name);
        if (!isValid) return fatalError.INVALID_NAME_OPTION(options.name);
    }

    // `toDiscriminant` must be either undefined, or else a function.
    if (options.discriminator !== undefined) {
        let isValid = typeof options.discriminator === 'function';
        if (!isValid) return fatalError.INVALID_DISCRIMINATOR_OPTION();
    }

    // `unreachable` must be either undefined, or else a function.
    if (options.unreachable !== undefined) {
        let isValid = typeof options.unreachable === 'function';
        if (!isValid) return fatalError.INVALID_UNREACHABLE_OPTION();
    }
}
