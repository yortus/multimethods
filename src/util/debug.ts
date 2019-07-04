import * as debugFactory from 'debug';
import {assign} from './object-assign';




// TODO: remove was... const BG_BLUE = '\x1b[44m';
const BG_CYAN = '\x1b[46m';
const BG_RED = '\x1b[41m';
const BG_YELLOW = '\x1b[43m';
const FG_WHITE = '\x1b[37m';
const RESET = '\x1b[0m';




export const debug = assign(
    debugFactory('multimethods'),
    {
        // tslint:disable-next-line: no-console
        log: console.error.bind(console),
        VALIDATE: `${BG_YELLOW}${FG_WHITE}VALIDATE${RESET}`,
        DEOPT: `${BG_YELLOW}${FG_WHITE}DEOPT${RESET}`,
        DISPATCH: `${BG_CYAN}${FG_WHITE}DISPATCH${RESET}`,
        FATAL: `${BG_RED}${FG_WHITE}FATAL${RESET}`,
    }
);
