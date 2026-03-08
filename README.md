# daily.dev App Suite

The web app and browser extension for [daily.dev](https://app.daily.dev). Both live in one pnpm monorepo so they share components and stay in sync.

<p align="center">
  <a href="https://circleci.com/gh/dailydotdev/apps">
    <img src="https://img.shields.io/circleci/build/github/dailydotdev/apps/main.svg" alt="Build Status">
  </a>
  <a href="https://github.com/dailydotdev/apps/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/dailydotdev/apps.svg" alt="License">
  </a>
  <a href="https://stackshare.io/daily/daily">
    <img src="http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat" alt="StackShare">
  </a>
  <a href="https://github.com/dailydotdev/apps/actions/workflows/e2e-tests.yml">
    <img src="https://github.com/dailydotdev/apps/actions/workflows/e2e-tests.yml/badge.svg?branch=main" alt="E2E Tests">
  </a>
</p>

## Tech stack

TypeScript, React 18, Next.js 15 (Pages Router), Tailwind CSS, TanStack Query v5, GraphQL with graphql-request, Jest.

## Packages

| Package | What it does |
|---------|-------------|
| [webapp](packages/webapp) | Next.js web application -- the main daily.dev site |
| [extension](packages/extension) | Browser extension (Chrome, Opera) built with Webpack |
| [shared](packages/shared) | Shared React components, hooks, design system, and utilities |
| [storybook](packages/storybook) | Component development and documentation |
| [eslint-config](packages/eslint-config) | Shared ESLint configuration |
| [eslint-rules](packages/eslint-rules) | Custom ESLint rules (e.g. color consistency) |
| [prettier-config](packages/prettier-config) | Shared Prettier configuration |

## Getting started

Prerequisites: Node 22.22 ([nvm](https://github.com/nvm-sh/nvm) users can run `nvm use`) and pnpm 9.14.4.

```bash
npm i -g pnpm@9.14.4
git clone https://github.com/dailydotdev/apps.git
cd apps
pnpm install
```

### Full local environment (Docker)

If you want a working API and database behind the frontend:

```bash
docker compose up
docker compose exec daily-api node ./bin/import   # seed sample data
```

### Development commands

```bash
pnpm --filter webapp dev          # web app with HTTPS
pnpm --filter webapp dev:notls    # web app without HTTPS (http://localhost:5002)
pnpm --filter extension dev       # Chrome extension
pnpm --filter storybook dev       # Storybook
```

## Running the extension locally

Chrome example:

1. Run `pnpm --filter extension dev` from the repo root.
2. Go to `chrome://extensions/` and turn on **Developer mode**.
3. Click **Load unpacked** and pick `packages/extension/dist/chrome`.
4. The extension appears in your toolbar. Disable the production extension if you have it installed -- they can conflict.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](https://github.com/dailydotdev/.github/blob/master/CONTRIBUTING.md) before opening a PR.

## License

AGPL-3.0. See [LICENSE](LICENSE).
