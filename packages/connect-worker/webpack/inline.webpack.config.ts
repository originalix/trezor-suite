import webpack from 'webpack';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

import prod from './prod.webpack.config';

const config: webpack.Configuration = {
    target: 'web',
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
