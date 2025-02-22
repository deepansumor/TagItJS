const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

// Common Configuration
const commonConfig = {
    entry: path.resolve(__dirname, "src", "tagIt.ts"),
    output: {
        path: path.resolve(__dirname, "dist"),
        library: "TagIt",
        libraryTarget: "var",
        globalObject: "typeof self !== 'undefined' ? self : this",
        libraryExport: "default",
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
};

// Development Build Configuration
const devConfig = {
    ...commonConfig,
    mode: "development",
    output: {
        ...commonConfig.output,
        filename: "tagIt.js",
    },
    devtool: "source-map", // Enable source maps for debugging
    plugins: [
        new webpack.DefinePlugin({
            ENABLE_LOG: JSON.stringify(true), // Enable logging in dev mode
        }),
    ],
};

// Production Build Configuration
const prodConfig = {
    ...commonConfig,
    mode: "production",
    output: {
        ...commonConfig.output,
        filename: "tagIt.min.js",
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    plugins: [
        new webpack.DefinePlugin({
            ENABLE_LOG: JSON.stringify(false), // Disable logging in production
        }),
    ],
};

// Export both configurations
module.exports = [devConfig, prodConfig];
