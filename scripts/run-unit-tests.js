




// Tell mocha where the test files are.
// TODO: was... restore... process.argv.push('built/test/unit/**/*.js');
process.argv.push('dist/test/**/*.js');
// process.argv.push('dist/test/**/*{relationship,intersecting}*.js');
// process.argv.push('dist/test/**/intersecting*.js');
// process.argv.push('dist/test/**/constructing-an-euler*.js');
// process.argv.push('dist/test/**/constructing-equivalent-euler*.js');
// process.argv.push('dist/test/**/constructing-*-euler*.js');
// process.argv.push('dist/test/**/{intersecting,constructing-an-euler}*.js');
// process.argv.push('dist/test/**/*{intersecting,euler}*.js');

// Tell mocha *not* to call process.exit() when tests have finished.
process.argv.push('--no-exit');

// Tell mocha to lengthen its per-test timeout to 10 minutes (allows interactive debugging of tests).
process.argv.push('--timeout', '600000');

// Run the tests.
require('../node_modules/mocha/bin/_mocha');
