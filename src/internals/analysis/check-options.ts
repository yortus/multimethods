import {Options} from '../../interface/options';
import {panic} from '../util';




// TODO: doc...
export function checkOptions(options: Options): void {
    options = typeof options === 'function' ? {discriminator: options} : {...options};

    // `name` must be either undefined, or conform to [A-Za-z$_][A-Za-z$_0-9]* (ie a simple JS indentifier).
    if (options.name !== undefined) {
        let isValid = typeof options.name === 'string';
        isValid = isValid && /[A-Za-z$_][A-Za-z$_0-9]*/.test(options.name);
        if (!isValid) {
            return panic(`Expected a valid identifier or undefined value for options.name, but found ${options.name}.`);
        }
    }

    // `toDiscriminant` must be either undefined, or else a function.
    if (options.discriminator !== undefined) {
        let isValid = typeof options.discriminator === 'function';
        if (!isValid) return panic(`Expected a function or undefined value for options.discriminator.`);
    }

    // `unreachable` must be either undefined, or else a function.
    if (options.unreachable !== undefined) {
        let isValid = typeof options.unreachable === 'function';
        if (!isValid) return panic(`Expected a function or undefined value for options.unreachable.`);
    }
}
