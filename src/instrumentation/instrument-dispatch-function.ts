import andThen from '../util/and-then';
import debug, {DISPATCH} from '../util/debug';
import {MMInfo, MMNode} from '../analysis';





// TODO: doc...
export default function instrumentDispatchFunction(mminfo: MMInfo<MMNode>, mm: Function) {
    let mmname = mminfo.options.name;
    function instrumentedDispatch(...args: any[]) {
        debug(`${DISPATCH} |-->| ${mmname}   discriminant='%s'   args=%o`, mminfo.options.toDiscriminant(...args), args);
        let getResult = () => mm(...args);
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
    return instrumentedDispatch;
}
