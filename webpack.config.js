const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');





module.exports = {

    mode: 'production',

    entry: './dist/commonjs/index.js',

    output: {
        filename: 'multimethods.min.js',
        path: path.resolve(__dirname, 'dist/umd'),
        library: 'multimethods',
        libraryTarget: 'umd'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ],
    },

    optimization: {
        minimizer: [new TerserPlugin({
            terserOptions: {
                mangle: {
                    reserved: ['__FUNCNAME__', '__VARARGS__']
                },
                compress: false,
                // TODO: compression still causes errors in UMD build. `test-page.html` fails if compression is enabled.
                // compress: {
                //     keep_fnames: true,
                //     sequences: false,
                //     conditionals: false,
                //     join_vars: false
                // }
            }
        })],
    },
};
