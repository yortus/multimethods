




// TODO: explain calling convention...
type Thunk = (discriminant: string, resultSoFar: any, ...mmargs: any[]) => any;
export default Thunk;
