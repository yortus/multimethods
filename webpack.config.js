const path = require('path');
const webpack = require('webpack');
const PRODUCTION = true;





module.exports = {

    entry: './dist/commonjs/index.js',

    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ],

    output: {
        filename: 'multimethods.min.js',
        path: path.resolve(__dirname, 'dist/single-file')
    }
};
