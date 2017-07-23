import * as debugFactory from 'debug';





const debug = debugFactory('multimethods');
debug.log = console.error.bind(console);
export default debug;





// TODO: remove was... const BG_BLUE = '\x1b[44m';
const BG_CYAN = '\x1b[46m';
const BG_RED = '\x1b[41m';
const BG_YELLOW = '\x1b[43m';
const FG_WHITE = '\x1b[37m';
const RESET = '\x1b[0m';





export const VALIDATE = `${BG_YELLOW}${FG_WHITE}VALIDATE${RESET}`;
// TODO: remove was... export const EMIT = `${BG_BLUE}${FG_WHITE}EMIT${RESET}`;
export const DEOPT = `${BG_YELLOW}${FG_WHITE}DEOPT${RESET}`;
export const DISPATCH = `${BG_CYAN}${FG_WHITE}DISPATCH${RESET}`;
export const FATAL = `${BG_RED}${FG_WHITE}FATAL${RESET}`;
