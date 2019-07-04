import {MMInfo, MMNode} from '../analysis';
import {andThen} from '../util/and-then';
import debug, {DISPATCH} from '../util/debug';




// TODO: doc...
export function instrumentMultimethod(multimethod: (...args: unknown[]) => unknown, mminfo: MMInfo<MMNode>) {
    let mmname = mminfo.config.name;
    function instrumentedDispatch(...args: unknown[]) {
        debug(
            `${DISPATCH} |-->| ${mmname}   discriminant='%s'   args=%o`,
            mminfo.config.discriminator(...args),
            args
        );
        let getResult = () => multimethod(...args);
        return andThen(getResult, (result, error, isAsync) => {
            if (error) {
                debug(`${DISPATCH} |<--| ${mmname}   %s   result=ERROR`, isAsync ? 'async' : 'sync');
            }
            else {
                debug(`${DISPATCH} |<--| ${mmname}   %s   result=%o`, isAsync ? 'async' : 'sync', result);
            }
            debug('');
            if (error) throw error; else return result;
        });
    }
    instrumentedDispatch.toString = multimethod.toString;
    return instrumentedDispatch;
}
