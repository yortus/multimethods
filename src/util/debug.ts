import * as debugFactory from 'debug';





const debug = debugFactory('multimethods');
debug.log = console.error.bind(console);
export default debug;





const BG_CYAN = "\x1b[46m";
const BG_RED = "\x1b[41m";
const BG_MAGENTA = "\x1b[45m";
const BG_YELLOW = "\x1b[43m";
const FG_WHITE = "\x1b[37m";
const RESET = "\x1b[0m";





export const EMIT = `${BG_YELLOW}${FG_WHITE}EMIT${RESET}`;
export const DEOPT = `${BG_MAGENTA}${FG_WHITE}DEOPT${RESET}`;
export const DISPATCH = `${BG_CYAN}${FG_WHITE}DISPATCH${RESET}`;
export const FATAL = `${BG_RED}${FG_WHITE}FATAL${RESET}`;
