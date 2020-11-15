# Setup

## Create project

npm init

## Code styling/hygienic setup

yarn add -D prettier eslint

yarn add -D eslint-config-prettier eslint-plugin-react eslint-config-airbnb eslint-plugin-prettier eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import

touch .eslintrc.json

```javascript
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

touch .prettierrc.json

```json
{
  "semi": true,
  "trailingComma": "es5"
}
```

## Write React code

yarn add react react-dom

mkdir public

touch public/index.html

```html
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

mkdir src

touch src/index.js

```javascript
import React from "react";
import ReactDom from "react-dom";

ReactDom.render(<div>Hello World</div>, document.getElementById("root"));
```

## Add babel and webpack

yarn add -D @babel/core @babel/eslint-parser @babel/preset-env @babel/preset-react

yarn add -D webpack webpack-cli html-webpack-plugin terser-webpack-plugin babel-loader

## Transpile React code using webpack and babel

touch babel.config.json

```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

touch webpack.config.js

```javascript
const reactConfig = require("./webpack.react.js");

module.exports = [reactConfig];
```

touch webpack.react.js

```javascript
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

## Run React locally

yarn add -D webpack-dev-server

add script to package.json

```diff
-  "scripts": {
-     "test": "echo \"Error: no test specified\" && exit 1"
-   },
+   "scripts": {
+     "webpack": "webpack",
+     "webpack-dev": "webpack serve"
+   },
```

## Write node.js and transpile using webpack

yarn add express regenerator-runtime

mkdir src/serverside

touch src/serverside/index.js

```javascript
import "regenerator-runtime/runtime";
import express from "express";

const app = express();

app.get("/", (req, res) => {
  console.log("received request!");
  res.send("Hello");
});

app.listen(8080, () => {
  console.log(`Server is listening on port 8080`);
});
```

yarn add -D webpack-node-externals

touch webpack.serverside.js

```javascript
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
```

update webpack.config.js

```javascript
const reactConfig = require("./webpack.react.js");
const serversideConfig = require("./webpack.serverside.js");

module.exports = [reactConfig, serversideConfig];
```

## Serve React app from Node.js

touch src/App.js

```javascript
import React from "react";

export default function App() {
  return <div>Hello world</div>;
}
```

update src/index.js

```diff
import React from 'react';
import ReactDom from 'react-dom';
+ import App from './App';

- ReactDom.render(<div>Hello World from react</div>, document.getElementById('root'));
+ ReactDom.render(<App />, document.getElementById('root'));
```

update src/serverside/index.js

```diff
import 'regenerator-runtime/runtime';
import express from 'express';
+ import handleRequestPage from './handleRequestPage';

const app = express();

- app.get('/', (req, res) => {
-  console.log('received request!');
-  res.send('Hello World from node.js');
- });

+ app.get('/', handleRequestPage);
+ app.get('/index.html', (req, res) => res.redirect('/'));

+ app.use(express.static('./build'));

+ app.get('*', handleRequestPage);

app.listen(8080, () => {
  console.log(`Server is listening on port 8080`);
});
```

yarn add promise

touch src/serverside/handleRequestPage.js

```javascript
import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import Promise from "promise";

import App from "App";

const file = fs.readFileSync("./build/index.html", "utf8");

function renderToStream() {
  const bodyStream = ReactDOMServer.renderToNodeStream(<App />);

  return {
    bodyStream,
  };
}

function handleRequestPage(req, res) {
  return new Promise((resolve) => {
    const body = [];
    const { bodyStream } = renderToStream();

    bodyStream.on("data", (chunk) => {
      body.push(chunk.toString());
    });

    bodyStream.on("error", (err) => {
      // eslint-disable-next-line
      console.log(err);

      res.status(500).send("Something went wrong. Please try again.");
      resolve();
    });

    bodyStream.on("end", () => {
      const html = file.replace(
        `<div id="root"></div>`,
        `<div id="root">${body.join("")}</div>`
      );

      res.send(html);
      resolve();
    });
  });
}

export default handleRequestPage;
```

## Setup webpack watcher and nodemon for local development

yarn add nodemon

add scripts in package.json

```diff
  ...
  "scripts": {
    "webpack": "webpack",
    "webpack-dev": "webpack serve",
+    "webpack-watch": "webpack -w",
+    "start-dev": "nodemon build/serverside.js"
  },
  ...
```

## Test if React features work

update src/App.js

```diff
import React from 'react';

export default function App() {
-  return <div>Hello world in App</div>;

+  const [showText, setShowText] = React.useState(false);
+  const handleToggle = React.useCallback(() => {
+    setShowText(!showText);
+  }, [showText]);
+
+  return (
+    <>
+      <button onClick={handleToggle} type="button">
+        Click Me
+      </button>
+      {showText && <div>Now you see me</div>}
+    </>
+  );
}
```

update src/index.js

```
import React from "react";
import ReactDom from "react-dom";
import App from "./App";

- ReactDom.render(<App />, document.getElementById("root"));
+ ReactDom.hydrate(<App />, document.getElementById("root"));
```

## Test if React router works

yarn add react-router-dom

update src/App.js

```diff
import React from 'react';
+ import { BrowserRouter, Route, Switch } from 'react-router-dom';
+ import Route1 from './Route1';
+ import Route2 from './Route2';

export default function Router() {
-  const [showText, setShowText] = React.useState(false);
-  const handleToggle = React.useCallback(() => {
-    setShowText(!showText);
-  }, [showText]);
-
-  return (
-    <>
-      <button onClick={handleToggle} type="button">
-        Click Me
-      </button>
-      {showText && <div>Now you see me</div>}
-    </>
-  );

+  return (
+    <BrowserRouter>
+      <Switch>
+        <Route path="/" exact component={Route1} />
+        <Route path="/second-page" exact component={Route2} />
+      </Switch>
+    </BrowserRouter>
+  );
}
```

touch src/Route1.js

```javascript
import React from "react";
import { Link } from "react-router-dom";

export default function Route1() {
  return (
    <>
      <Link to="/second-page">Go to the second page</Link>
      <div>This is the first page</div>
    </>
  );
}
```

touch src/Route2.js

```javascript
import React from "react";
import { Link } from "react-router-dom";

export default function Route2() {
  return (
    <>
      <Link to="/">Go to the first page</Link>
      <div>This is the second page</div>
    </>
  );
}
```

## Try it with npm run webpack-dev

update src/index.js, change `hydrate` to `render`

update webpack.react.js

```diff
  ...
+  devServer: {
+    historyApiFallback: true,
+  },
  ...
```

## Try it with npm run start-dev

You will see an error

```
Error: Invariant failed: Browser history needs a DOM
```

## Serving frontend from node.js

update src/index.js

```diff
import React from "react";
+ import { BrowserRouter } from "react-router-dom";
import ReactDom from "react-dom";
import App from "./App";

- ReactDom.hydrate(<App />, document.getElementById('root'));
+ ReactDom.hydrate(
+  <BrowserRouter>
+    <App />
+  </BrowserRouter>,
+  document.getElementById("root")
+);
```

update src/Router.js

```diff
import React from "react";
- import { BrowserRouter, Route, Switch } from 'react-router-dom';
+ import { Route, Switch } from "react-router-dom";
import Route1 from "./Route1";
import Route2 from "./Route2";

export default function Router() {
  return (
-    <BrowserRouter>
+    <>
      <Switch>
        <Route path="/" exact component={Route1} />
        <Route path="/foo" component={Route2} />
      </Switch>
-    <BrowserRouter>
+    </>
  );
}
```

update src/serverside/handleRequestPage.js

```diff
import React from "react";
import ReactDOMServer from "react-dom/server";
+ import { StaticRouter } from "react-router-dom";
import fs from "fs";
import Promise from "promise";

import App from "App";

const file = fs.readFileSync("./build/index.html", "utf8");

- function renderToStream() {
+ function renderToStream(req) {
+  const context = {};
-  const bodyStream = ReactDOMServer.renderToNodeStream(<App />);
+  const bodyStream = ReactDOMServer.renderToNodeStream(
+    <StaticRouter location={req.url} context={context}>
+      <App />
+    </StaticRouter>
+  );

  return {
    bodyStream,
+    context,
  };
}

function handleRequestPage(req, res) {
  return new Promise((resolve) => {
    const body = [];
-    const { bodyStream } = renderToStream();
+    const { bodyStream, context } = renderToStream(req);

+    if (context.url) {
+      res.redirect(context.url);
+      resolve();
+    }

    bodyStream.on("data", (chunk) => {
      body.push(chunk.toString());
    });

    bodyStream.on("error", (err) => {
      // eslint-disable-next-line
      console.log(err);

      res.status(500).send("Something went wrong. Please try again.");
      resolve();
    });

    bodyStream.on("end", () => {
      const html = file.replace(
        `<div id="root"></div>`,
        `<div id="root">${body.join("")}</div>`
      );

      res.send(html);
      resolve();
    });
  });
}

export default handleRequestPage;
```
