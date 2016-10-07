import Arity from './arity';
import {MultimethodError} from '../util';





// TODO: *import* this, don't export it...
export class Multimethod {
    add: any;
}
export interface Multimethod {
    (...args): any;
}





export default function createMultimethodClassImpl(staticArity?: Arity): typeof Multimethod {

    return <any> class Multimethod {
        constructor(options: {arity?: Arity}) {

            // If *both* arities given, they must match
            if (staticArity && options.arity && staticArity !== options.arity) {
                throw new MultimethodError(`arity mismatch`); // TODO: improve diagnostic message
            }

            // Use whichever arity is given. If neither arity is given, default to 'variadic'.
            let arity = staticArity || options.arity || 'variadic';

            // TODO: ...
            let instance = createMultimethod(arity, options);
            instance[CTOR] = Multimethod;
            return instance;
        }

        static [Symbol.hasInstance](value: any) {
            if (staticArity) {
                return value && value[CTOR] === Multimethod;
            }
            else {
                return value && value.hasOwnProperty(CTOR); // TODO: works for symbols?
            }
        }
    }
}





// TODO: ...
function createMultimethod(arity: Arity, options: {}) {
    // TODO: ...
    return <any> {};
}





// TODO: ...
const CTOR = Symbol('ctor');
