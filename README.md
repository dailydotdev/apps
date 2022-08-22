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

* NPM for managing dependencies.
* Node v16.15.0 (a `.nvmrc` is presented for [nvm](https://github.com/nvm-sh/nvm) users).
* [lerna](https://github.com/lerna/lerna) for managing the monorepo.

## Projects

### eslint-config

Shared settings for eslint for all the projects in this repo.

### extension

The browser extension project. Includes webpack configuration for browser extensions and the dedicated components just for the extension.

### prettier-config

Shared settings for prettier for all the projects in this repo.

### shared

The main project with most of the components that are used in the applications. Every component that need to be used in both platforms should be placed in this project. This includes the design system components, custom hooks, and many more.

### webapp

The web app project. It is a Next.js project and it has more pages than the extension. Such as registration page, article page, profile page, etc.
For more information [click here](https://github.com/dailydotdev/apps/tree/master/packages/webapp).

## Local Environment

To spin up a full-blown local environment, we use [Garden](https://garden.io/). It deploys the required services to a local/remote kuberentes cluster.

### Prerequisites

* Install garden using their [getting started tutorial](https://docs.garden.io/getting-started/1-installation). Make sure to follow step 3 to provision a local kubernetes cluster.
* Git clone this repo: `git clone git@github.com:dailydotdev/apps.git`.
* Git clone the [api](https://github.com/dailydotdev/daily-api) and [gateway](https://github.com/dailydotdev/daily-gateway) services for hot reloading support (optional).

### Deploy

It's time to spin up the environment using garden. Run the following in the apps repo using your favorite terminal:
* `garden deploy`. Deploys all services, runs migrations, and everything needed.
* `garden exec api "node bin/import.js"`. Seeds the database with sample data.

You should see your ingress URL in the terminal if everything is done correctly.
<img width="446" alt="image" src="https://user-images.githubusercontent.com/1993245/185791096-bf90cae0-b0e4-4a32-bb60-1fb5ce7ca360.png">

Put the ingress URL in your browser and viola, you should see the webapp running in all its glory. 🤯

### Port forwarding

If you want to connect to the database or any other service, we can use the kubectl port forward command.
For example, if we want to connect to postgres: `kubectl --context docker-desktop -n apps-default port-forward service/postgres 5432:5432` (make sure to use the right context).

Now you can use your favorite SQL client to connect to postgres using `localhost:5432`.

### Hot reload

Garden supports hot reload (code synchnronization in garden's terms), which makes local development so better!
Follow these steps to enable hot reload:
* Clone the api and gateway repos before you proceed as mentioned above.
* Run: `garden link source api ../daily-api`. Make sure to adjust the api repo path according to your setup.
* Run: `garden link source gateway ../daily-gateway`. Make sure to adjust the gateway repo path according to your setup.
* Open `project.garden.yml` in the apps repo and uncomment the definition of the dev variable (lines 13-14).
* Run: `garden dev`

That's it! Now anything you change will get synchronized into the kubernetes service and will reload it. 🧙‍♂️

### Garden Dashboard

Garden comes with a built-in dashboard that can show you the status of the deployment and logs of each service.
Run `garden dashboard` and it will generate a URL that you can use to access the dashboard.

If you use `garden dev`, it will automatically run the dashboard as well.

### Update Remote Dependencies

By default, garden will not make sure your dependencies (api, gateway, and db services) are up-to-date with the latest source.
It uses whatever is available from the last time it fetched them.

To update everything, run: `garden update-remote all`. Think of it as the equivalent of `git pull` for garden.

### Teardown

To teardown the environment and delete everything. Run: `garden delete environment`.


## Want to Help?

So you want to contribute to daily.dev app suite and make an impact, we are glad to hear it. :heart_eyes:

Before you proceed we have a few guidelines for contribution that will make everything much easier.
We would appreciate if you dedicate the time and read them carefully:
https://github.com/dailydotdev/.github/blob/master/CONTRIBUTING.md

## Bootstrap Project

After cloning the project, please make sure to run the following commands to bootstrap the project:
```
npm i -g lerna
lerna bootstrap
```

## Firefox Review

* Install node v16.15.0 and npm v8.5.5
* Install `lerna` as a global package `npm i -g lerna` 
* Bootstrap project `lerna bootstrap`
* Change working directory to extension project `cd packages/extension`
* Build Firefox version `npm run build:firefox`
* Firefox build should be located at `dist`
