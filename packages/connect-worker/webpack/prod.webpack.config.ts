import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

// Generate additional files hosted on https://connect.trezor.io/X/

const config: webpack.Configuration = {
    target: 'node',
    mode: 'production',
    entry: {},
    output: {},
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-typescript'],
                    },
                },
            },
        ],
    },
    resolve: {
        modules: ['node_modules'],
        mainFields: ['browser', 'module', 'main'],
        extensions: ['.ts', '.js'],

        // From https://github.com/trezor/trezor-suite/blob/develop/packages/connect-iframe/webpack/prod.webpack.config.ts#L72
        fallback: {
            fs: false, // ignore "fs" import in fastxpub (hd-wallet)
            https: false, // ignore "https" import in "ripple-lib"
            vm: false, // ignore "vm" imports in "asn1.js@4.10.1" > crypto-browserify"
            util: require.resolve('util'), // required by "ripple-lib"
            assert: require.resolve('assert'), // required by multiple dependencies
            crypto: require.resolve('crypto-browserify'), // required by multiple dependencies
            stream: require.resolve('stream-browserify'), // required by utxo-lib and keccak
            events: require.resolve('events'),
        },
    },
    performance: {
        hints: false,
    },
    plugins: [
        // provide fallback for global objects.
        // resolve.fallback will not work since those objects are not imported as modules.
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            Promise: ['es6-promise', 'Promise'],
            process: 'process/browser',
        }),
        new HtmlWebpackPlugin({
            chunks: ['webusb'],
            filename: 'webusb.html',
            template: path.join(__dirname, '../src/webusb/webusb.html'),
            inject: true,
            minify: false,
        }),
        new HtmlWebpackPlugin({
            chunks: ['extensionPermissions'],
            filename: 'extension-permissions.html',
            template: path.join(__dirname, '../src/webextension/extension-permissions.html'),
            inject: true,
            minify: false,
        }),
    ],
    optimization: {
        emitOnErrors: true,
        moduleIds: 'named',
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                    mangle: {
                        reserved: [
                            'Array',
                            'BigInteger',
                            'Boolean',
                            'Buffer',
                            'ECPair',
                            'Function',
                            'Number',
                            'Point',
                            'Script',
                            'events',
                        ],
                    },
                },
            }),
        ],
    },
};

export default config;
