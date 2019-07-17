import {Options, OptionsObject} from '../options';
import {Dict, fatalError} from '../util';
import {checkMethodsAndDecorators} from './check-methods-and-decorators';
import {checkOptions} from './check-options';
import {defaultDiscriminator} from './default-discriminator';
import {pass1} from './pass-1';
import {pass2} from './pass-2';
import {pass3} from './pass-3';




// TODO: temp testing
export function analyse(opts: Options, methods: Dict<Function | Function[]>, decorators: Dict<Function | Function[]>) {

    checkOptions(opts); // NB: may throw
    checkMethodsAndDecorators(methods, decorators); // NB: may throw

    let options = getCompleteOptions(opts);

    let mminfo1 = pass1(options, methods, decorators);
    let mminfo2 = pass2(mminfo1);
    let mminfo3 = pass3(mminfo2);
    return mminfo3;
}




function getCompleteOptions(options: Options): Required<OptionsObject> {
    options = typeof options === 'function' ? {discriminator: options} : {...options};

    return {
        name: options.name || `Ɱ${++multimethodCounter}`,
        discriminator: options.discriminator || defaultDiscriminator,
        unreachable: options.unreachable || function alwaysReachable() { return false; },
        unhandled: options.unhandled || fatalError.UNHANDLED,
    };
}




// TODO: doc...
let multimethodCounter = 0;
