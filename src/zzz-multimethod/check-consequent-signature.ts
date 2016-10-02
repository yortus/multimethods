// TODO: add support for things marked 'not supported yet' below (do a ctrl+F to find them...)
import {warn} from '../util';
import Pattern from '../pattern';
const consequentSignatureGrammar: { parse(text: string): SignatureInfo; } = require('./consequent-signature-grammar');





/**
 * Checks that the consequent function's signature conforms to expectations:
 * (1) it declares no more than three parameters.
 * (2) it declares at least two parameters if the specified pattern contains named captures.
 * (3) each parameter is either a simple identifier or a single-level object destructuring pattern:
 *   (3a) no default values (not supported yet)
 *   (3b) no identifier remapping in destructuring patterns (not supported yet)
 *   (3c) no rest parameter (not supported yet)
 *   (3d) no other destructuring eg nesting or arrays (not supported yet)
 * (4) if the second parameter is an object destructuring pattern, then it must:
 *   (4a) contain a simple list of identifiers
 *   (4b) contain an identifier for each named capture in the specified pattern
 *   (4c) NOT contain any identifier that is NOT a named capture in the specified pattern 
 */
export default function checkConsequentSignature(consequent: Function, pattern = Pattern.ANY): void {

    // Parse the consequent function's parameter list. Only identifiers and basic object destructuring are supported.
    let ast: SignatureInfo;
    try {
        ast = consequentSignatureGrammar.parse(consequent.toString());
    }
    catch (ex) {
        warn(`Unexpected consequent function signature. Parameters are expected to be either simple identifiers or single-level object destructuring patterns.`);
    }

    // Validate the parameters generally.
    if (ast.length > 3) warn(`Expected consequent function to declare no more than three parameters.`);
    if (pattern.captureNames.length > 0 && ast.length < 2) warn(`Expected consequent function to declare at least two parameters when the pattern contains named captures.`);

    // If the `captures` (2nd) parameter is destructured, the names *must* exactly match named captures from `pattern`.
    if (ast.length >= 2 && Array.isArray(ast[1])) {
        let paramNames = ast[1] as string[];
        validateNames(pattern, paramNames);
    }
}





/** Holds the information associated with a successfully parsed consequent signature. */
type SignatureInfo = Array<string | string[]>;





/**
 * Asserts that the given pattern's capture names are valid and entirely match the given parameter names:
 * - None of the pattern's capture names may match a reserved name.
 * - Every parameter name must correspond exactly to a capture name from the pattern.
 * - Every capture name from the pattern must correspond exactly to a parameter name.
 */
function validateNames(pattern: Pattern, paramNames: string[]) {
    let rnames = reservedNames;
    let pnames = paramNames;
    let cnames = pattern.captureNames;
    let list = (ar: string[]) => `'${ar.join("', '")}'`;

    // We already know the capture names are valid JS identifiers. Now also ensure they don't clash with reserved names.
    let badCaptures = cnames.filter(cname => rnames.indexOf(cname) !== -1).map(s => `'${s}'`).join(', ');
    let ok = badCaptures.length === 0;
    if (!ok) warn(`Use of reserved name(s) ${badCaptures} as capture(s) in pattern '${Pattern}'`);

    // Ensure all capture names appear among the consequent's parameter names (i.e. check for unused capture names).
    let excessCaptures = cnames.filter(cname => pnames.indexOf(cname) === -1).map(s => `'${s}'`).join(', ');
    ok = excessCaptures.length === 0;
    if (!ok) warn(`Consequent is missing parameter(s) for capture(s) ${excessCaptures} from pattern '${pattern}'`);

    // Ensure every parameter name matches a capture name (i.e. check for unsatisfied params).
    let excessParams = pnames.filter(pname => cnames.indexOf(pname) === -1).map(s => `'${s}'`).join(', ');
    ok = excessParams.length === 0;
    if (!ok) warn(`Consequent has excess parameter(s) ${excessParams} not captured by pattern '${pattern}'`);
}





/**
 * Lists identifiers that may *not* be used for named captures. Currently, there are no reserved names.
 */
const reservedNames = [];
