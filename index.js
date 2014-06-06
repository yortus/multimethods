module.exports = require('./src/index');


// If node was started with '--debugtests', run the tests programmatically now.
// This simplifies debugging/stepping through tests in some envs, eg NTVS.
if (process.argv.indexOf('--debugtests') !== -1) {
    var grunt = require('grunt');
    grunt.tasks(['test'], {}, function() {});
}
