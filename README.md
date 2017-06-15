# Electron To Dos App

![Build Status](https://jdunkerley.visualstudio.com/_apis/public/build/definitions/c5590d99-e9b6-4375-9cac-ba78a8898dbb/2/badge)

An experiment in creating an Electron app in TypeScript to be a ToDos app!

## Developer Set Up

In order to build the code you need to have:

- [node](https://nodejs.org/en/) - tested against v7.10.0 but shouldn't be overly sensitive
- [yarn](https://yarnpkg.com)

To build and run the code:

```
yarn install
yarn run start
```

Included within the repository are the configuration to work within [Visual Studio Code](http://code.visualstudio.com/). You should be able to build and run within the editor. The following extensions are recommended:

- TSLint (adds real time linting of TypeScript)
- JavaScript Standard Style (adds eal time linting via StandardJS)
- Debugger for Chrome (allows debugging of the renderer process)
- yarn (allows running of yarn commands within the Command Palette)

## Code Structure

This is a pretty opinionated way of laying out an Electron application.

The main process entry point is `src/host/main.ts`.
Each sepearte page is represented by a `tsx` file in `src/gui`