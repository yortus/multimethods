




export default function processSpecialComments(source: string): string {



    // Keep only source lines between the /*<snip>*/ and /*</snip>*/ lines (if present).
    let snip = source.match(REGEX_SNIP);
    if (snip !== null) {
        let indent = snip[1];
        source = snip[2];

        // Adjust indentation
        source = source.split(/[\r\n]+/).map(line => line = line.substr(indent.length)).join('\n');
    }

    // Process 'keep' comments of the form /*! test to keep */
    source = source.replace(REGEX_ADD, '$1');
    return source;
}





// Recognises comments like /*!var*/ and capture the contents ('var' in this example).
const REGEX_ADD = /\/\*!(.*?)\*\//g;





// Recognises the /*<snip>*/ and /*</snip>*/ comment lines, capturing (1) the line indent and (2) the interior lines.
const REGEX_SNIP = /[\r\n]([ \t]*)\/\*<snip>\*\/[\r\n]+([\s\S]*?)\1\/\*<\/snip>\*\//;
