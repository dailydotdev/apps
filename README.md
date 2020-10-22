
<div align="center">
  <h1>Daily Webapp</h1>
  <strong>The daily.dev webapp</strong>
</div>
<br>
<p align="center">
  <a href="https://circleci.com/gh/dailydotdev/daily-webapp">
    <img src="https://img.shields.io/circleci/build/github/dailydotdev/daily-webapp/master.svg" alt="Build Status">
  </a>
  <a href="https://github.com/dailydotdev/daily-webapp/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/dailydotdev/daily-webapp.svg" alt="License">
  </a>
  <a href="https://stackshare.io/daily/daily">
    <img src="http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat" alt="StackShare">
  </a>
</p>

A Next.js + React web application of daily.dev.
It utilizes the brand new incremental static generation feature of Next.js to deliver pages fast.

## Stack

* Node v14.3.0 (a `.nvmrc` is presented for [nvm](https://github.com/nvm-sh/nvm) users).
* NPM for managing dependencies.
* Next.js as a SSR (ISG) framework
* React
* styled-components for styling

## Project structure

* `__mocks__` - Global mocks.
* `__tests__` - There you can find all the tests and fixtures. Tests are written using `jest`.
* `components` - React and styled-components components that are used across the app.
* `graphql` - GraphQL types and queries.
* `icons` - SVG icons.
* `lib` - Common functions that are used across the app.
* `pages` - Contains the pages of the app. This is required by Next.js
* `public` - Files that should be publicly available and not processed by any way.
* `styles` - Styles variables, functions, and everything necessary to make this webapp look good.

## Local environment

Daily Webapp requires a running environment of daily.dev.
[Check out this guide](https://github.com/dailydotdev/daily#-running-dailydev-locally) of how to run daily.dev locally.

Finally run `npm run dev` to run the service and listen to port `5002`.


## Want to Help?

So you want to contribute to Daily Webapp and make an impact, we are glad to hear it. :heart_eyes:

Before you proceed we have a few guidelines for contribution that will make everything much easier.
We would appreciate if you dedicate the time and read them carefully:
https://github.com/dailydotdev/.github/blob/master/CONTRIBUTING.md
