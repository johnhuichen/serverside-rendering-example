# Setup

## create project

1. npm init

## code styling/hygienic setup

1. yarn add -D prettier eslint
1. yarn add -D eslint-config-prettier eslint-plugin-react eslint-config-airbnb
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

# get React app running

## add babel and webpack

1. yarn add -D @babel/core @babel/eslint-parser @babel/preset-env @babel/preset-react
1. yarn add -D webpack webpack-cli

## write React code

1. mkdir src
1. touch src/index.js src/Layout.js src/Router.js src/Route1.js src/Route2.js
1. edit src/index.js
