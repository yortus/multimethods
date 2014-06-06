import references = require('references');
import _ = require('lodash');


/** TODO: doc.... */
export function create(options: Multimethods.Options): Multimethods.Multimethod {

    // Validate arguments.
    options.name = options.name || 'anonymous';
    options.notFound = options.notFound || (() => { throw new Error('ambiguous!'); });
    var arity = options.params.length;

    // Provide storage for all overrides that get added.
    var overrideTypes: any[][] = [];
    var overrideImpls: Function[] = [];

    // Create the multimethod.
    var result: Multimethods.Multimethod = <any> function mm() {

        // Validate arguments.
        if (arguments.length != arity) throw new Error(options.name + '(): expected ' + arity + ' arguments');
        var args = new Array(arity), types = new Array(arity);
        for (var i = 0; i < arity; ++i) {
            var arg = arguments[i];
            args[i] = arg;
            types[i] = options.params[i].typeFamily.typeof(arg);
        }

        // Eliminate overrides that cannot possibly match.
        var isEliminated: boolean[] = new Array(overrideTypes.length);
        for (var i = 0; i < overrideTypes.length; ++i) {
            var isValid = true, otypes = overrideTypes[i];
            for (var j = 0; isValid && j < arity; ++j) {
                var family = options.params[j].typeFamily;
                isValid = family.isa(types[j], otypes[j]);
            }
            isEliminated[i] = !isValid;
        }

        // Eliminate each override that is unambiguously inferior to any other override.
        for (var i = 0; i < overrideTypes.length; ++i) {
            if (isEliminated[i]) continue;
            for (var j = i + 1; j < overrideTypes.length; ++j) {
                if (isEliminated[j]) continue;

                var iWins = 0, jWins = 0;
                for (var k = 0; k < arity; ++k) {
                    var isa = options.params[k].typeFamily.isa;
                    var iType = overrideTypes[i][k], jType = overrideTypes[j][k];
                    var iIsAj = isa(iType, jType), jIsAi = isa(jType, iType);
                    if (iIsAj && !jIsAi) ++iWins;
                    if (jIsAi && !iIsAj) ++jWins;
                }

                if (jWins > 0 && iWins === 0) { isEliminated[i] = true; break; }
                if (iWins > 0 && jWins === 0) isEliminated[j] = true;
            }
        }

        // Get the remaining candidate, ensuring there is exactly one.
        var impl = null, isValid = true;
        for (var i = 0; isValid && i < overrideTypes.length; ++i) {
            if (isEliminated[i]) continue;
            if (impl) isValid = false; else impl = overrideImpls[i];
        }
        if (!isValid || !impl) impl = options.notFound;

        // Call the winning candidate and return its result.
        return impl.apply(this, args);
    }

    result.override = function(types, impl) {

        // Validate arguments.
        if (types.length != arity) throw new Error(options.name + '.override(): expected ' + arity + ' types');

        //TODO: ...
        overrideTypes.push(types);
        overrideImpls.push(impl);
    }

    return result;
}
