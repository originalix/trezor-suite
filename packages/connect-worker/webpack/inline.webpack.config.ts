import webpack from 'webpack';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

import prod from './prod.webpack.config';

const config: webpack.Configuration = {
    target: 'webworker',
    mode: 'production',
    entry: {
        'trezor-connect-worker': path.resolve(__dirname, '../src/index.ts'),
        'trezor-connect-worker.min': path.resolve(__dirname, '../src/index.ts'),
    },
    output: {
        filename: '[name].js',
        // path: path.resolve(__dirname, '../build'),
        // packages/connect-examples/extension-suite/vendor/trezor-connect-worker.js
        path: path.resolve(__dirname, '../../connect-examples/extension-suite/vendor'),
        publicPath: './',
        library: 'TrezorConnect',
        libraryTarget: 'umd',
        libraryExport: 'default',
    },

    module: prod.module,
    resolve: prod.resolve,
    performance: prod.performance,
    plugins: [
        // provide fallback for global objects.
        // resolve.fallback will not work since those objects are not imported as modules.
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            Promise: ['es6-promise', 'Promise'],
            process: 'process/browser',
        }),
    ],

    optimization: {
        minimizer: [
            new TerserPlugin({
                exclude: /trezor-connect-worker.js/,
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
};

export default config;
