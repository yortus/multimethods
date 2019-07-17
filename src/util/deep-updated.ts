// TODO: doc...
export type DeepUpdated<T extends object, Old extends object, New extends object> =
    {[K in keyof T]: DeepUpdated2<T[K], Old, New>};




type DeepUpdated2<T, Old extends object, New extends object> =
    T extends Old ? DeepUpdated<New, Old, New> :
    T extends string | number | boolean | null | undefined | Function ? T :
    T extends Old[] ? Array<DeepUpdated<New, Old, New>> :
    {[K in keyof T]: DeepUpdated2<T[K], Old, New>};
