const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const TerserPlugin = require("terser-webpack-plugin");

const isDevelopment = process.env.NODE_ENV === "development";

const serversideConfig = {
  mode: "production",
  entry: "./src/serverside/index.js",
  target: "node",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "serverside.js",
  },
  externals: nodeExternals(),
  optimization: {
    splitChunks: false,
    minimize: true,
    minimizer: [
      new TerserPlugin({ parallel: true, terserOptions: { ecma: 6 } }),
    ],
  },
  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "src")],
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        include: path.resolve(__dirname, "src"),
        use: "babel-loader",
      },
    ],
  },
};

module.exports = serversideConfig;
