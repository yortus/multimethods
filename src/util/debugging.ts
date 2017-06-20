import * as debug from 'debug';





export namespace construct {
    export const log = debug('multimethods:construct');
    export const enabled = log.enabled;
}





export namespace dispatch {
    export const log = debug('multimethods:dispatch');
    export const enabled = log.enabled;
}
