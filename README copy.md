# node-red-contrib-xray

## Build

Use a current version of [Node.js](https://nodejs.org/en/). Install the dependencies, run the tests, and compile the TypeScript code with [yarn](https://yarnpkg.com/lang/en/) or npm:

```shell
$ yarn
$ yarn test
$ yarn build
```

## Releasing to NPM
https://productmgt-dc.herokuapp.com/
https://itnext.io/building-micro-frontend-applications-with-angular-elements-34483da08bcb
https://github.com/angular-extensions/elements
https://angular.io/guide/elements

Commit all changes and run the following:

```shell
$ npm login
$ npm version <update_type>
$ npm publish
```

… where `<update_type>` is one of `patch`, `minor`, or `major`. This will update the `package.json`, and create a tagged Git commit with the version number.

https://github.com/lapwinglabs/x-ray-phantom
- - -

Copyright Ethan Brooks, 2019

