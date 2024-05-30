<div align="center">
  <h1>daily.dev App Suite</h1>
  <strong>Everything you see on daily.dev 👀</strong>
</div>
<br>
<p align="center">
  <a href="https://circleci.com/gh/dailydotdev/apps">
    <img src="https://img.shields.io/circleci/build/github/dailydotdev/apps/master.svg" alt="Build Status">
  </a>
  <a href="https://github.com/dailydotdev/apps/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/dailydotdev/apps.svg" alt="License">
  </a>
  <a href="https://stackshare.io/daily/daily">
    <img src="http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat" alt="StackShare">
  </a>
</p>

<p align="center">
  <a href="https://gitpod.io/#https://github.com/dailydotdev/apps/">
    <img src="https://gitpod.io/button/open-in-gitpod.svg" alt="Open in Gitpod">
  </a>
</p>

This monorepo contains daily.dev's application suite. The repo includes the web app and the extension, along with shared components for the two.
The decision was made to allow faster iterations and to keep features parity in both platforms.

## Technology

* Node v18.16.0 (a `.nvmrc` is presented for [nvm](https://github.com/nvm-sh/nvm) users).
* [pnpm](https://pnpm.io/workspaces) for managing the monorepo and dependencies.

## Projects

### eslint-config

Shared ESLint settings for all the projects in this repo.

### extension

The browser extension project. Includes webpack configuration for browser extensions and the dedicated components just for the extension.

### prettier-config

Shared Prettier settings for all the projects in this repo.

### shared

The main project contains most of the components used in the applications. Every component that needs to be used on both platforms should be placed in this project. This includes the design system components, custom hooks, and many more.

### webapp

The web app project. This is a Next.js project and has more pages than the extension, such as a registration page, post page, profile page, etc. For more information [click here](https://github.com/dailydotdev/apps/tree/master/packages/webapp).

## Local Environment

To spin up a local environment, we suggest using GitPod. Everything is already configured and should work out of the box.
We have a GitPod button above, click on it and let's roll!

## Want to Help?

So you want to contribute to daily.dev app suite and make an impact, we are glad to hear it. :heart_eyes:

Before you proceed we have a few guidelines for contribution that will make everything much easier.

We would appreciate if you dedicate the time and read them carefully:
https://github.com/dailydotdev/.github/blob/master/CONTRIBUTING.md

## Bootstrap Project

After cloning the project, please make sure to run the following commands to bootstrap the project:

```bash
npm i -g pnpm@8.15.7
pnpm install
```

### Run Extension Locally
Example for Chrome:
- Run `pnpm --filter extension dev:chrome` in the root directory
- Open Chrome and go to `chrome://extensions/`
- Enable `Developer mode` in the top right corner
- Click on `Load unpacked` and select the `packages/extension/dist/chrome` folder
- The extension should be loaded and you should be able to see it in the extensions list
- Enable the extension, don't forget to disable it when you are done
- Disable the production extension if you have it installed as it might cause conflicts
