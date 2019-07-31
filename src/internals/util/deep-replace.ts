// TODO: doc...
export type DeepReplace<T extends object, Old extends object, New extends object> =
    {[K in keyof T]: DeepReplace2<T[K], Old, New>};




type DeepReplace2<T, Old extends object, New extends object> =
    T extends Old ? DeepReplace<New, Old, New> :
    T extends string | number | boolean | null | undefined | Function ? T :
    T extends Old[] ? Array<DeepReplace<New, Old, New>> :
    {[K in keyof T]: DeepReplace2<T[K], Old, New>};
