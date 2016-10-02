var fs = require('fs');
var path = require('path');


// Add multimethods.js and multimethods.d.ts to our own node_modules folder, so it can require() itself (e.g. in tests).
fs.writeFileSync(path.join(__dirname, '../node_modules/multimethods.js'), `module.exports = require('..');`);
fs.writeFileSync(path.join(__dirname, '../node_modules/multimethods.d.ts'), `export * from '..';`);
