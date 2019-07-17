import {Options} from '../options';
import {Dict} from '../util';
import {pass1} from './pass-1';
import {pass2} from './pass-2';
import {pass3} from './pass-3';
import {checkMethodsAndDecorators, checkOptions} from './validation';




// TODO: temp testing
export function analyse(opts: Options, methods: Dict<Function | Function[]>, decorators: Dict<Function | Function[]>) {
    checkOptions(opts); // NB: may throw
    checkMethodsAndDecorators(methods, decorators); // NB: may throw

    let mminfo1 = pass1(opts, methods, decorators);
    let mminfo2 = pass2(mminfo1);
    let mminfo3 = pass3(mminfo2);
    return mminfo3;
}
