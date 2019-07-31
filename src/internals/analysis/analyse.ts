import {Decorators, Methods} from '../../interface/multimethod';
import {Options} from '../../interface/options';
import {makeCompleteOptions, validateSuppliedMethodsAndDecorators, validateSuppliedOptions} from './options';
import {pass1} from './pass-1';
import {pass2} from './pass-2';
import {pass3} from './pass-3';




// TODO: temp testing
export function analyse(opts: Options, methods: Methods, decorators: Decorators) {

    validateSuppliedOptions(opts); // NB: may throw
    validateSuppliedMethodsAndDecorators(methods, decorators); // NB: may throw

    let options = makeCompleteOptions(opts);

    let mminfo1 = pass1(options, methods, decorators);
    let mminfo2 = pass2(mminfo1);
    let mminfo3 = pass3(mminfo2);
    return mminfo3;
}
