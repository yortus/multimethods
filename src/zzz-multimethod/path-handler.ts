




/** A path handler provides a standarized means for transforming an address/request pair to a response. */
type PathHandler = (discriminant: string, request: Request) => (Response | PromiseLike<Response>);
export default PathHandler;
export interface Request {}
export interface Response {}
