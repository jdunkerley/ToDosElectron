# ReadMe #

Having spent a few days experimenting with setting up a build process for creating an Electron-based thought I would put together a post describing the setup. First, a disclaimer that this is still a work in progress and as with everything within the JavaScript world it seems like there are a thousand ways to do it and this is just one way. 

My requirements:
* Want to use [Electron](https://electron.atom.io/) for creating a simple (or not…) desktop application
* Want to use [TypeScript](http://www.typescriptlang.org/) for the majority of the code
* Where I have to use JavaScript code, want to have it linted by [standardjs](https://standardjs.com/)
* Want the TypeScript code to be linted by [ts-lint](https://palantir.github.io/tslint/) but conforming to consistent rules with standardjs
* Want to use [WebPack](https://webpack.js.org/) (version 2) to control the build process
* Want the output code to ES5, so will use [babel](https://babeljs.io/) to transpile from ES6 to ES5
* Want to [React](https://facebook.github.io/react/) and [Redux](http://redux.js.org/) on the front end
* Want to use the [Jest](https://facebook.github.io/jest/) unit testing framework

Additional development environment goals:
* Want to have a CI build process hosted within [Visual Studio Team Services](https://www.visualstudio.com/team-services/)
* Want to have the code hosted within GitHub
* Be able to run the build and tests within [Visual Studio Code](https://code.visualstudio.com/)

In this guide, I am using [yarn](https://yarnpkg.com/en/) but the same process should work with npm as well. Let's start by creating an empty project by running:

```js
yarn init
```

The diagram below shows the end goal for the build process we are going to create.

![Final Build Process](assets/buildProcess.jpg)

## Setting Up The TypeScript Build ##

In order to set this up, we need to set up a fair few pieces. Let's start by getting the TypeScript process set up to build a file from the `src` directory to the `dist` folder.

```js
yarn add webpack tslint-config-standard tslint-loader ts-loader tslint typescript -D
```

This will add webpack, tslint and typescript into the project as development dependencies. The next step is to configure the TypeScript compiler and tslint linter. Add a new file called `tsconfig.json` to the root folder of the project with the following content:

```js
{
    "compileOnSave": false,
    "compilerOptions": {
        "target": "es2015",
        "moduleResolution": "node",
        "pretty": true,
        "newLine": "LF",
        "allowSyntheticDefaultImports": true,
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "sourceMap": true,
        "skipLibCheck": true,
        "allowJs": true,
        "jsx": "preserve"
    }
}
```

This tells the TypeScript compiler not to compile on save (as we are going to use WebPack) and to be strict (as this is a 'greenfield' project).

*Compiler Options:*

|Setting|Value|Description|
|----|:---:|---|
|target|es2015|Specify output ECMAScript version to be ES2015 (ES6)|
|moduleResolution|node|Determine that modules get resolved consistently with Node.js system|
|pretty|true|Stylise errors and messages with colour and context|
|newLine|LF|Use Linux style line endings|
|allowSyntheticDefaultImports|true|Allows for a nicer (in my opinion) syntax for importing defaults|
|strict|true|Enables strict type checking|
|noUnusedLocals|true|Report errors if local variable unused|
|noUnusedParameters|true|Report errors if parameter unused|
|sourceMap|true|Generate a corresponding .map file|
|skipLibCheck|true|Skip type checking of all .d.ts files (type definition files)|
|allowJs|true|Allow JavaScript files to be compiled|
|jsx|preserve|Preserve means we produce a jsx file leaving the JSX mark up unchanged|

Next  set up tslint to be consistent with StandardJS. Add another new file to the root directory called `tslint.json` with the following content:

```js
{
  "extends": "tslint-config-standard",
  "rules": {
    "indent": [true, "spaces"],
    "ter-indent": [true, 2],
    "space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "never",
      "asyncArrow": "ignore"
    }]
  }
}
```

This makes tslint follow the same configuration as StandardJS. I found the space indentation was causing me some errors hence needing to add the additional configuration over `tslint-config-standard`.

Next, configure Webpack to compile TypeScript files (`ts` or `tsx` extensions) found in the `src` folder and output to the `dist` folder. The structure I use here is a little different from the standard as we will need two parallel configurations when we come to the Electron set up. Create a file called `webpack.config.js` and add the following:

```js
const path = require('path')

const commonConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      },
      {
        test: /\.tsx?$/,
        loader: ['ts-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
  }
}

module.exports = Object.assign(
  {
    entry: { main: './src/main.ts' }
  },
  commonConfig)
```

Now we need to configure the build command within `packages.json`. Add the following block, assuming you don't have `scripts` section already (merge into it if you do):

```js
  "scripts": {
    "build": "webpack --config webpack.config.js"
  },
```

### Visual Studio Code Set Up ###

In order to run this build from within Visual Studio we need to configure the task and also set up the workspace environment appropriately. 

[[assets/vsCodeNotification.jpg|alt=Visual Studio Build Notifications]]

Press `Ctrl-Shift-B` and then click `Configure Build Task`. Choose `npm` as a starting point. Replave the `tasks` array with:

```js
    "tasks": [
        {
            "taskName": "build",
            "args": ["run", "build"],
            "isBuildCommand": true
        }
    ]
```

You can also change the command from `npm` to `yarn` if you prefer. At this point, you should be able to build the project by pressing `Ctrl-Shift-B` but as there is no code yet it will just result in an error:

[[assets/webPackError.png|alt=WebPack Build Output]]

The last part of setting up the editor is to add a `settings.json` within the `.vscode` folder (which should have been created for the `tasks.json` file) specifying number of spaces and line endings to match the settings:

```js
{
    "editor.tabSize": 2,
    "files.eol": "\n"
}
```

