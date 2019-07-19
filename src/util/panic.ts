import {debug} from './debug';




export function panic(message: string): never {
    debug(`${debug.FATAL} %s`, message);
    throw new Error(message);
}
