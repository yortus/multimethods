//TODO: review all comments in here...
import MultimethodOptions from '../multimethod-options';
import routeExecutorTemplate from './route-executor-template';
import Rule from '../impl/rule';
import Taxonomy, {TaxonomyNode} from '../../taxonomy';





// TODO: temp testing...
export interface WithRoute {
    route: Rule[];
};
export interface WithExecutors {
    source: string;
    entryPoint: string;
};





// TODO: ...
export default function computeAllExecutors(taxonomy: Taxonomy<WithRoute>, options: MultimethodOptions) {

    let augmentedTaxomony = taxonomy.augment(node => {

        let sources: string[] = [];
        sources.push(`// ========== EXECUTORS FOR ${node.pattern} ==========\n`);
        sources.push(...node.route.map(rule => {

            // Skip duplicates
            let isOriginalRule = rule.isMetaRule || taxonomy.get(rule.predicate) === node;
            if (!isOriginalRule) return;

            return getSourceCodeForRule(taxonomy, node, rule, options) + '\n';
        }));
        let source = sources.join('');

        // TODO: temp testing...
        let rules = node.route;
        let entryPointRule = rules.filter(rule => rule.isMetaRule).pop() || rules[0];
        let entryPoint = getNameForRule(taxonomy, node, entryPointRule);

        return <WithExecutors> { source, entryPoint };
    });
    return augmentedTaxomony;
}





// TODO: ...
function getSourceCodeForRule(taxonomy: Taxonomy<WithRoute>, node: TaxonomyNode & WithRoute, rule: Rule, options: MultimethodOptions) {
    let name = getNameForRule(taxonomy, node, rule);

    // TODO: to get copypasta'd code working... revise...
    let i = node.route.indexOf(rule);
    let rules = node.route;

    // TODO: start with the template...
    let source = routeExecutorTemplate.toString();

    source = normaliseSource(source);

    // TODO: temp testing...
    let downstreamRule = rules.filter((_, j) => (j === 0 || rules[j].isMetaRule) && j < i).pop();
    let getCaptures = `get${i ? 'Rule' + (i + 1) : ''}CapturesFor${node.pattern.identifier}`;
    let callMethod = `call${i ? 'Rule' + (i + 1) : ''}MethodFor${node.pattern.identifier}`;

    // TODO: ... all booleans
    source = eliminateDeadCode(source, {
        ENDS_PARTITION: i === rules.length - 1 || rules[i + 1].isMetaRule,
        HAS_CAPTURES: rule.predicate.captureNames.length > 0,
        IS_META_RULE: rule.isMetaRule,
        HAS_DOWNSTREAM: downstreamRule != null,
        IS_PURE_SYNC: options.timing === 'sync',
        IS_PURE_ASYNC: options.timing === 'async'
    });

    // TODO: ... all strings
    source = replaceAll(source, {
        METHOD_NAME: getNameForRule(taxonomy, node, rule),
        GET_CAPTURES: getCaptures,
        CALL_METHOD: callMethod,
        DELEGATE_DOWNSTREAM: downstreamRule ? getNameForRule(taxonomy, node, downstreamRule) : null,
        DELEGATE_NEXT: i < rules.length - 1 ? getNameForRule(taxonomy, node, rules[i + 1]) : null
    });

    // TODO: temp testing... specialise for arity...
    if (typeof options.arity === 'number') {
        let replacement = [...Array(options.arity).keys()].map(key => '_' + key).join(', '); // TODO: ES6 stuff here...
        source = source.replace(/\.\.\.MM_ARGS/g, replacement);
    }
    else if (options.emitES5) {
        source = downlevelES6Rest(source);
        source = downlevelES6Spread(source);
    }

    // TODO: temp testing...
    if (rule.predicate.captureNames.length > 0) {
        source = source + `\nvar ${getCaptures} = taxonomy.get('${node.pattern.normalized}').route[${i}].predicate.match;`
    }
    source = source + `\nvar ${callMethod} = taxonomy.get('${node.pattern.normalized}').route[${i}].method;`;

    // All done for this iteration.
    return source;
}





// TODO: ...
function getNameForRule(taxonomy: Taxonomy<WithRoute>, node: TaxonomyNode & WithRoute, rule: Rule) {
    let ruleNode = taxonomy.get(rule.predicate.normalized);
    let ruleIndex = ruleNode.route.indexOf(rule);

    if (rule.isMetaRule) {
        return `tryMetaRule${ruleIndex ? ruleIndex + 1 : ''}For${ruleNode.pattern.identifier}Within${node.pattern.identifier}`;
    }
    else {
        return `tryRule${ruleIndex ? ruleIndex + 1 : ''}For${ruleNode.pattern.identifier}`;
    }
}





// TODO: ... doc: 4-space indents, no blank lines, '\n' line endings
function normaliseSource(source: string): string {
    // TODO: verify/fix 4-space indents. Otherwise hard-to find bugs may creep in if devs alter the template function
    // TODO: -or- don't assume 4-space indents anymore?
    let lines = source.split(/[\r\n]+/); // NB: this removes blank lines too
    lines = lines.filter(line => !/^\s*\/\//.test(line)); // Remove comment lines
    let dedentCount = lines[1].match(/^[ ]+/)[0].length - 4;
    lines = [].concat(lines.shift(), ...lines.map(line => line.slice(dedentCount)));
    source = lines.join('\n');
    return source;
}





// TODO: assumes consistent 4-space block indents, simple conditions... relax any of these?
function eliminateDeadCode(source: string, consts: {[name: string]: boolean}): string {
    const MATCH_IF = /^(\s*)if \((\!?)([a-zA-Z$_][a-zA-Z0-9$_]*)\) {$/;
    const MATCH_ELSE = /^(\s*)else {$/;
    let inLines = source ? source.split('\n') : [];
    let outLines: string[] = [];
    while (inLines.length > 0) {
        let inLine = inLines.shift();

        let matches = MATCH_IF.exec(inLine);
        if (!matches || !consts.hasOwnProperty(matches[3])) {
            outLines.push(inLine);
            continue;
        }

        let indent = matches[1];
        let isNegated = matches[2] === '!';
        let constName = matches[3];
        let isElided = consts[constName] === isNegated;
        let blockLines: string[] = [];
        let blockClose = indent + '}';

        while ((inLine = inLines.shift()) !== blockClose) {
            blockLines.push(inLine.slice(4));
        }

        if (!isElided) {
            outLines = outLines.concat(eliminateDeadCode(blockLines.join('\n'), consts));
        }

        // TODO: handle 'else' blocks...
        if (inLines.length > 0 && MATCH_ELSE.test(inLines[0])) {
            inLines[0] = `${indent}if (${isNegated ? '' : '!'}${constName}) {`;
        }
    }

    return outLines.join('\n');
}





// TODO: ...
function replaceAll(source: string, replacements: {[identifier: string]: string}): string {
    let identifiers = Object.keys(replacements);
    let regexs = identifiers.map(id => new RegExp(id.replace(/\$/g, '\\$'), 'g'));
    for (let i = 0; i < identifiers.length; ++i) {
        let id = identifiers[i];
        let regex = regexs[i];
        let replacement = replacements[id];
        source = source.replace(regex, replacement);
    }
    return source;
}





// TODO: ...
function downlevelES6Rest(source: string): string {
    // TODO: ensure no other kinds of rest left behind afterward...

    // Matches (non-arrow) function headers with a rest argument
    const REGEX = /function([^(]*)\((.*?),\s*\.\.\.[^)]+\)\s*{\n(\s*)/gi;

    // ES5 equivalent for initialising the rest argument MM_ARGS
    const REST = `for (var MM_ARGS = [], len = arguments.length, i = 2; i < len; ++i) MM_ARGS.push(arguments[i]);`;

    return source.replace(REGEX, (substr, funcName: string, firstArgs: string, indent: string) => {
        return `function ${funcName}(${firstArgs}) {\n${indent}${REST}\n${indent}`;
    });
}





// TODO: ...
function downlevelES6Spread(source: string): string {
    // TODO: ensure no other kinds of spreads left behind afterward...

    // Matches argument list of function calls where the final argument is a spread expression
    let REGEX = /\(([^(]*?),\s*\.\.\.([^)]+)\)/gi;

    return source.replace(REGEX, (substr, firstArgs: string, finalSpreadArg: string) => {
        return `.apply(null, [${firstArgs}].concat(${finalSpreadArg}))`;
    });
}
