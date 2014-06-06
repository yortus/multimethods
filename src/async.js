﻿var Promise = require('bluebird');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

function createAsync(options) {
    options.name = options.name || 'anonymous';
    options.notFound = options.notFound || (function () {
        return Promise.reject('ambiguous!');
    });
    var arity = options.params.length;

    var overrideTypes = [];
    var overrideImpls = [];

    var result = async(function mm() {
        if (arguments.length != arity)
            throw new Error(options.name + '(): expected ' + arity + ' arguments');
        var args = new Array(arity), types = new Array(arity);
        for (var i = 0; i < arity; ++i) {
            var arg = arguments[i];
            args[i] = arg;
            types[i] = await(options.params[i].typeFamily.typeof(arg));
        }

        var isEliminated = new Array(overrideTypes.length);
        for (var i = 0; i < overrideTypes.length; ++i) {
            var isValid = true, otypes = overrideTypes[i];
            for (var j = 0; isValid && j < arity; ++j) {
                var family = options.params[j].typeFamily;
                isValid = await(family.isa(types[j], otypes[j]));
            }
            isEliminated[i] = !isValid;
        }

        for (var i = 0; i < overrideTypes.length; ++i) {
            if (isEliminated[i])
                continue;
            for (var j = i + 1; j < overrideTypes.length; ++j) {
                if (isEliminated[j])
                    continue;

                var iWins = 0, jWins = 0;
                for (var k = 0; k < arity; ++k) {
                    var isa = options.params[k].typeFamily.isa;
                    var iType = overrideTypes[i][k], jType = overrideTypes[j][k];
                    var iIsAj = await(isa(iType, jType)), jIsAi = await(isa(jType, iType));
                    if (iIsAj && !jIsAi)
                        ++iWins;
                    if (jIsAi && !iIsAj)
                        ++jWins;
                }

                if (jWins > 0 && iWins === 0) {
                    isEliminated[i] = true;
                    break;
                }
                if (iWins > 0 && jWins === 0)
                    isEliminated[j] = true;
            }
        }

        var impl = null, isValid = true;
        for (var i = 0; isValid && i < overrideTypes.length; ++i) {
            if (isEliminated[i])
                continue;
            if (impl)
                isValid = false;
            else
                impl = overrideImpls[i];
        }
        if (!isValid || !impl)
            impl = options.notFound;

        return await(impl.apply(this, args));
    });

    result.override = function (types, impl) {
        if (types.length != arity)
            throw new Error(options.name + '.override(): expected ' + arity + ' types');

        overrideTypes.push(types);
        overrideImpls.push(impl);
    };

    return result;
}
exports.createAsync = createAsync;
//# sourceMappingURL=async.js.map
