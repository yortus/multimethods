import {MMInfo} from '../mm-info';
import {andThen, debug} from '../util';




// TODO: doc...
export function instrumentMultimethod(multimethod: (...args: unknown[]) => unknown, mminfo: MMInfo) {
    let mmname = mminfo.options.name;
    function instrumentedDispatch(...args: unknown[]) {
        debug(
            `${debug.DISPATCH} |-->| ${mmname}   discriminant='%s'   args=%o`,
            mminfo.options.discriminator(...args),
            args
        );
        let getResult = () => multimethod(...args);
        return andThen(getResult, (result, error, isAsync) => {
            if (error) {
                debug(`${debug.DISPATCH} |<--| ${mmname}   %s   result=ERROR`, isAsync ? 'async' : 'sync');
            }
            else {
                debug(`${debug.DISPATCH} |<--| ${mmname}   %s   result=%o`, isAsync ? 'async' : 'sync', result);
            }
            debug('');
            if (error) throw error; else return result;
        });
    }
    instrumentedDispatch.toString = multimethod.toString;
    return instrumentedDispatch;
}
