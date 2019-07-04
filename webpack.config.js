const path = require('path');




module.exports = {

    mode: 'production',

    entry: './dist/commonjs/index.js',

    output: {
        filename: 'multimethods.js',
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
        // Minimisation messes up multimethod source code templates and codegen, so it is disabled.
		minimize: false
	},
};
