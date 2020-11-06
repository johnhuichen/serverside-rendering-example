# Setup

## create project

1. npm init

## code styling/hygienic setup

1. yarn add -D prettier eslint
1. yarn add -D eslint-config-prettier eslint-plugin-react eslint-config-airbnb eslint-plugin-prettier eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import
1. touch .eslintrc.json

```
{
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "extends": ["airbnb", "airbnb/hooks", "plugin:prettier/recommended"],
  "env": {
    "es2020": true,
    "browser": true
  },
  "globals": {
    "Promise": "off"
  },
  "rules": {
    "react/jsx-filename-extension": [1, { "extensions": [".js"] }],
    "prettier/prettier": "error"
  },
  "settings": {
    "import/resolver": {
      "node": {
        "paths": ["src"]
      }
    }
  }
}
```

1. touch .prettierrc.json

```
{
  "semi": true,
  "trailingComma": "es5"
}
```

# get React app running

## write React code

1. yarn add react react-dom
1. mkdir public
1. touch public/index.html

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>SSR Example</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

1. mkdir src
1. touch src/index.js src/Layout.js src/Router.js src/Route1.js src/Route2.js
1. update src/index.js

```javascript
import React from "react";
import ReactDom from "react-dom";

ReactDom.render(<div>Hello World</div>, document.getElementById("root"));
```

## add babel and webpack

1. yarn add -D @babel/core @babel/eslint-parser @babel/preset-env @babel/preset-react
1. yarn add -D webpack webpack-cli html-webpack-plugin terser-webpack-plugin babel-loader

## compiling React code using webpack and babel

1. touch babel.config.json

```
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

1. touch webpack.config.js

```
const reactConfig = require("./webpack.react.js");

module.exports = [reactConfig];
```

1. touch webpack.react.js

```
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const reactConfig = {
  mode: "production",
  entry: { app: "./src/index.js" },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].[contenthash].js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
    }),
  ],
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
    },
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

module.exports = reactConfig;
```
