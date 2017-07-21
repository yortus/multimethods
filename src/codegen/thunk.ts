




// TODO: explain calling convention...
export default interface Thunk {
    (discriminant: string, resultSoFar: any, ...mmargs: any[]): any;
}
