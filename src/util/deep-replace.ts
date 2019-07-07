export type DeepReplace<T, Old, New> =
    T extends Old ? New :
    T extends string | number | boolean | null | undefined | Function ? T :
    {[K in keyof T]: DeepReplace<T[K], Old, New>};
