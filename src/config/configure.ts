import Options, {WarningsOptions} from './options';
import {warn, setWarnBehaviour, RoutistError} from '../util';





// TODO: doc...
export default function configure(options: Options) {
    if (options.warnings !== void 0) {
        let behaviour = getWarnBehaviour(options.warnings);
        setWarnBehaviour(behaviour);
    }
}





// TODO: doc...
function getWarnBehaviour(options: WarningsOptions) {

    if (typeof options === 'function') {
        return options;
    }

    switch (options) {
        case 'default':
        case 'console': return message => console.warn(message);
        case 'off':     return message => {};
        case 'throw':   return message => { throw new RoutistError(message); }
        default:        throw new RoutistError(`Invalid value for 'warnings': ${options}`);
    }
}
