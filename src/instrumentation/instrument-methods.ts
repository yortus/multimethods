import {MMInfo, MMNode} from '../analysis';
import {NEXT} from '../sentinels';
import andThen from '../util/and-then';
import debug, {DISPATCH} from '../util/debug';
import isMetaMethod from '../util/is-meta-method';
import repeatString from '../util/string-repeat';





// TODO: doc...
export default function instrumentMethods(mminfo: MMInfo<MMNode>) {

    // Update all `exactMethods` elements in-place.
    mminfo.allNodes.forEach(node => {
        for (let i = 0; i < node.exactMethods.length; ++i) {
            let name = `${node.identifier}${repeatString('ᐟ', i)}`;
            node.exactMethods[i] = instrumentMethod(node.exactMethods[i], name);
        }
    });
}





// TODO: doc...
function instrumentMethod(method: Function, name: string) {
    let isMeta = isMetaMethod(method);
    let methodInfo = `method=${name}   type=${isMeta ? 'meta' : 'regular'}`;
    function instrumentedMethod(...args: any[]) {
        let next = isMeta ? args.pop() : null;
        let captures = args.pop();
        debug(`${DISPATCH} |-->| %s${captures ? '   captures=%o' : ''}`, methodInfo, captures);
        let getResult = () => isMeta ? method(...args, captures, next) : method(...args, captures);
        return andThen(getResult, (result, error, isAsync) => {
            let resultInfo = error ? 'result=ERROR' : result === NEXT ? 'result=NEXT' : '';
            debug(`${DISPATCH} |<--| %s   %s   %s`, methodInfo, isAsync ? 'async' : 'sync', resultInfo);
            if (error) throw error; else return result;
        });
    }
    if (isMeta) isMetaMethod(instrumentedMethod, true);
    return instrumentedMethod;
}
