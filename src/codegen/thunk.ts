




// TODO: explain calling convention...
export default Thunk;
type Thunk = (discriminant: string, resultSoFar: any, ...mmargs: any[]) => any;
