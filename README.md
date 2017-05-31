# ReadMe #

Having spent a few days experimenting with setting up a build process for creating an Electron-based thought I would put together a post describing the setup. First, a disclaimer that this is still a work in progress and as with everything within the JavaScript world it seems like there are a thousand ways to do it and this is just one way. Secondly, I am by no means an expert and this is just the process I wanted to create - I am sure there are improvements that can be made and would value suggestions!

So my requirements are:

* Want to use [Electron](https://electron.atom.io/) for creating a simple (or not…) desktop application
* Want to use [TypeScript](http://www.typescriptlang.org/) for the majority of the code
* Where I have to use JavaScript code, want to have it linted by [standardjs](https://standardjs.com/)
* Want the TypeScript code to be linted by [ts-lint](https://palantir.github.io/tslint/) but conforming to consistent rules with standardjs
* Want to use [WebPack](https://webpack.js.org/) (version 2) to control the build process
* Want the output code to ES5, so will use [babel](https://babeljs.io/) to transpile from ES6 to ES5
* Want to [React](https://facebook.github.io/react/) and `tsx` on the front end
* Want to use the [Jest](https://facebook.github.io/jest/) unit testing framework
* **Want to have one place to control how TypeScript / TSX is linted and built, one place to control how JavaScript / JSX is linted and build and one place to run all the tests!**

Additional development environment goals:

* Want to have a CI build process hosted within [Visual Studio Team Services](https://www.visualstudio.com/team-services/)
* Want to have the code hosted within GitHub
* Be able to run the build and tests within [Visual Studio Code](https://code.visualstudio.com/)

The diagram below shows the end goal for the build process we are going to create.

![Final Build Process](assets/buildprocess.jpg?raw=true)

## Importing the packages... ##

In this guide, I am using [yarn](https://yarnpkg.com/en/) but the same process will work with `npm` as well. Let's start by creating an empty project by running and completing the wizard:

```js
yarn init
```

Next, import all the packages we need for the build as development dependencies:

*For compiling and linting TypeScript (WebPack, TSLint, TypeScript)*

```js
yarn add webpack tslint-config-standard tslint-loader ts-loader tslint typescript -D
```

*For transpiling and linting ES2015 code (Babel, Babel Presets, StandardJS)*

```js
yarn add babel-core babel-loader babel-preset-es2015 babel-preset-react standard standard-loader -D
```

## Setting Up The Build Process ##

In order to set this up, we need to set up a fair few pieces. Let's start by getting the TypeScript process set up to build a file from the `src` directory to the `dist` folder. To configure the TypeScript compile, add a new file called `tsconfig.json` to the root folder of the project with the following content:

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

In order to set up tslint to be consistent with StandardJS, add another new file to the root directory called `tslint.json` with the following content:

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

This makes tslint follow the same configuration as StandardJS. I found the whitespace settings were causing me some errors hence needing to add the additional configuration over `tslint-config-standard`.

Next configure WebPack to compile TypeScript files (`ts` or `tsx` extensions) found in the `src` folder and output to the `dist` folder. The structure I use here is a little different from the standard as we will need two parallel configurations when we come to the Electron set up. Create a file called `webpack.config.js` and add the following:

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
        loader: 'ts-loader'
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

The first rule tells WebPack to run tslint at the prebuild step, before then moving on run the TypeScript compiler. The resolve option adds the TypeScript extensions into WebPack so it will look for both JavaScript and TypeScript files (including JSX or TSX files).

To add the build command to yarn or npm, add the following code to the `packages.json`. This is assuming you don't have `scripts` section already, if you do merge it in.

```js
  "scripts": {
    "build": "webpack --config webpack.config.js"
  },
```

### Visual Studio Code Set Up ###

In order to run this build from within Visual Studio Code, the next step is to configure the task and also set up the workspace environment appropriately.

![Visual Studio Build Notifications](assets/vsCodeNotification.jpg?raw=true)

Press `Ctrl-Shift-B` and then click `Configure Build Task`. Choose `npm` as a starting point, and then replace the default `tasks` array with:

```js
    "tasks": [
        {
            "taskName": "build",
            "args": ["run", "build"],
            "isBuildCommand": true
        }
    ]
```

If using `yarn`, then change the command from `npm` to `yarn`.

The last part of setting up the editor is to add a `settings.json` within the `.vscode` folder (which should have been created for the `tasks.json` file) specifying number of spaces and line endings to match the linting settings:

```js
{
    "editor.tabSize": 2,
    "files.eol": "\n"
}
```

**A restart of Visual Studio Code might be required in order for it to pick up these changes.**

### Testing the build ###

There are three ways to run the build (and all will do the same):

* From within the root directory of the project, run `yarn run build` (or `npm run build`)
* From within the root directory of the project, run `.\node_modules\.bin\webpack`
* Press `Ctrl-Alt-B` within Visual Studio Code

As there is no code yet, running the build will just result in an error:

![WebPack Build Output](assets/webPackError.png?raw=true)

To test the build set up, create a `src` directory and add a `main.ts` file, with the following content (note the empty line at the end):

```js
export class SimpleClass {
  Add(a: number, b: number): number {
    return a + b
  }
}

const simpleClass: SimpleClass = new SimpleClass()
console.log(simpleClass.Add(2, 3))

```

If all is working you should get output like:

```bash
ts-loader: Using typescript@2.3.3 and D:\Repos\ToDosElectron\tsconfig.json
Hash: c35650ba72c226225609
Version: webpack 2.6.1
Time: 3554ms
  Asset     Size  Chunks             Chunk Names
main.js  2.91 kB       0  [emitted]  main
   [0] ./src/main.ts 73 bytes {0} [built]
```

The `dist` folder should be created and a `main.js` file should exist. To test this, run `node dist/main.js` in the root folder. The output should be 5.

## Setting Up Babel ##

Looking at the `main.js` file, the output is ES2015 styled (this will be surrouned by a fair amount of WebPack boilerplate):

```js
class SimpleClass {
    Add(a, b) {
        return a + b;
    }
}
/* harmony export (immutable) */ __webpack_exports__["SimpleClass"] = SimpleClass;

const simpleClass = new SimpleClass();
console.log(simpleClass.Add(2, 3));
```

The next goal is to use babel-js to convert from this to the older versions. As of Babel 6, a `.babelrc` file is used to tell it what 'presets' to load. The following will tell it to understand both ES2015 and React:

```js
{
  "presets": ["es2015", "react"]
}
```

WebPack also needs to be told to call Babel. The loader setting in each rule can take an array of loaders which are loader in reverse order. Replacing `loader: 'ts-loader'` with `loader: ['babel-loader', 'ts-loader']` makes WebPack run the TypeScript code through the TypeScript compiler and then the Babel compiler.

After re-running the build the new `main.js` will be back to old style JavaScript:

```js
var SimpleClass = exports.SimpleClass = function () {
    function SimpleClass() {
        _classCallCheck(this, SimpleClass);
    }

    _createClass(SimpleClass, [{
        key: "Add",
        value: function Add(a, b) {
...
```

Having set up Babel for the second step in TypeScript build, need to also configure it for compiling JavaScript files. Additionally, StandardJS should be used as a linter for JavaScript files. To do this add the following 2 rules section of the `webpack.config.js`:

```js
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'standard-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      }
```

## Electron ##

So far the process above doesn't have any settings to deal with Electron. Electron adds a few additional complications we need to deal with. The following command will add the core Electron package and the type definitions for Electron and Node. It also add the HTML WebPack plugin which I will use to generate a place holder `index.html` for the UI side of Electron.

```js
yarn add electron html-webpack-plugin @types/electron @types/node -D
```

An Electron application consists of two processes:

* **Main**: This is a NodeJS based script which serves as the entry point into the application. It is responsible for instantiating the `BrowserWindows` instances and also manages various applicaiton life cycle events
* **Renderer**: This is a Chromium based browser. It is the User Interface part of the application. It has the same kind of structure you would expect if you use Chrome. One master process and each `WebView` is it's own process.

The two process share some APIs and communicate between each other over uning interprocess communication. There is a great amount of detail on this [Electron's process post](https://medium.com/@ccnokes/deep-dive-into-electrons-main-and-renderer-processes-7a9599d5c9e2).

As we have two process we are wanting to build output for we need to adjust the `webpack.config.js` file to handle this. For the two processes there are two different [`target`](https://webpack.js.org/configuration/target/) settings needed - `electron-main` and `electron-renderer`. If the configuration file exports an array then WebPack will interrupt each of the objects as parallel build processes. Replace the `module.exports` section of the configuration with:

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = [
  Object.assign(
    {
      target: 'electron-main',
      entry: { main: './src/main.ts' }
    },
    commonConfig),
  Object.assign(
    {
      target: 'electron-renderer',
      entry: { gui: './src/gui.ts' },
      plugins: [new HtmlWebpackPlugin()]
    },
    commonConfig)
]
```

This will pick up the `main.ts` file and compile this as the Electron main process. It also will compile a `gui.ts` to be the Electron renderer process. The `HtmlWebpackPlugin` will create an `index.html` automatically that includes a reference to the compiled `gui.js`.

WebPack also defaults to substituting the `__dirname` which is useful within Electron. This can be stopped by adding a setting to the `commonConfig` object:

```js
  node: {
    __dirname: false
  },
```

Now to put together the `main.ts` script to create the Electron app and `BrowserWindow`:

```js
import { app, BrowserWindow } from 'electron'
declare var __dirname: string
let mainWindow: Electron.BrowserWindow

function onReady() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })

  const fileName = `file://${__dirname}/index.html`
  mainWindow.loadURL(fileName)
  mainWindow.on('close', () => app.quit())
}

app.on('ready', () => onReady())
app.on('window-all-closed', () => app.quit())
console.log(`Electron Version ${app.getVersion()}`)

```

For the UI side, a simple `gui.ts` writing the node version out to the document:

```js
document.getElementsByTagName('body')[0].innerHTML = `node Version: ${process.versions.node}`

```

The last adjustment is to add a new task the `packages.json` file. The `prestart` entry makes it build it as well.

```js
    "prestart": "yarn run build",
    "start": "electron ./dist/main.js",
```

If you run `yarn run start` hopefully an electron window will appear with the node version displayed in it:

![Electron App](assets/electronApp.jpg)

## Adding React ##

- Adding React and Types
- Initial TSX page...

## Unit Tests ##

- Jest 
- Directory search
- Watch mode implications...

## Visual Studio Team Services ##

- Setting up a build within VSTS
- Jest-Junit

## Future Improvemnts ##

Currently, I don't have a good solution for watching tests. 