




// TODO: doc...
interface Options {
    warnings?: WarningsOptions;
}
export default Options;





// TODO: doc...
export type WarningsOptions = 'default' | 'off' | 'console' | 'throw' | ((message: string) => void);