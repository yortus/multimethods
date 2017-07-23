const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');





module.exports = {

    entry: './dist/commonjs/index.js',

    plugins: [
        new UglifyJSPlugin({
            uglifyOptions: {
                mangle: {
                    reserved: ['__FUNCNAME__', '__VARARGS__']
                },
                compress: {
                    keep_fnames: true,
                    sequences: false,
                    conditionals: false,
                    join_vars: false
                }
            }
        })
    ],

    output: {
        filename: 'multimethods.min.js',
        path: path.resolve(__dirname, 'dist/umd'),
        library: 'multimethods',
        libraryTarget: 'umd'
    }
};
