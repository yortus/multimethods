




// TODO: similar to Options but with more defined typing
export default interface NormalOptions {
    name: string;
    arity: number | undefined;
    async: boolean | undefined;
    strict: boolean;
    toDiscriminant: Function;
    methods: {[predicate: string]: Function[]};
}
