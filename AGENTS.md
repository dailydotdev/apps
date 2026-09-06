# AGENTS.md

Gotchas and house conventions the code does not make obvious.

## Repo

pnpm monorepo for the daily.dev app suite:

- `packages/webapp`: Next.js Pages Router, not App Router (`app/` exists only for the service worker and the not-found page), deployed on Vercel.
- `packages/extension`: Chrome/Edge/Opera extension.
- `packages/shared`: components, hooks, GraphQL, design system. Code used by both surfaces lives here.
- `packages/storybook`, `packages/playwright`, eslint/prettier config packages.

## Verification

- Jest run outside the package scripts needs `NODE_ENV=test`, otherwise React/RTL run as a production build.
- Don't run `build` while a dev server runs; it breaks hot reload.
- Run `node ./scripts/typecheck-strict-changed.js` on changed `.ts`/`.tsx` files; package-wide strict tsc has unrelated backlog.
- CI has no webapp `next build`, so after shared changes run the full webapp tsc before pushing or Vercel catches what CI missed.
- After changing a shared component, run `pnpm --filter webapp test` too. Cross-package tests assert DOM structure and break silently otherwise.

## Conventions

- Write code that reads like the surrounding code: match its comment density, naming, and idioms. The reasoning behind a fix goes in the commit message, not a comment above the code.
- Tests exist to catch real regressions, not to raise coverage. Skip tests that duplicate an existing one or assert implementation details that break on harmless refactors.
- Import from source files, never through barrel `index.ts` files, and don't add new barrels.
- Queries are options-creator functions spread into `useQuery` (see `packages/shared/src/hooks/AGENTS.md`). Page or feature scoped state uses `createContextProvider` from `@kickass-coderz/react` (see `contexts/ActivePostContext.tsx`).
- GraphQL has no codegen. Types in `packages/shared/src/graphql/types.ts` and the domain files are hand-written; update them with the query you edit.
- Payment providers are per platform (`contexts/payment/index.tsx`): Paddle on web, StoreKit on iOS, a Chrome extension variant. Don't assume Paddle.
- Native iOS/Android wrappers run the webapp shell, so `isExtension`/`BootApp` can't tell them apart. Platform comes from `getDailyClientPlatform(version)` in `packages/shared/src/lib/func.ts`, never from an extension/webapp boolean.

## Feature flags (GrowthBook)

- Flags live in `packages/shared/src/lib/featureManagement.ts`. Never default an experiment flag to `true`: the default is the control value, and a truthy default ships the experiment to everyone on merge with no rollback short of a deploy.
- `useConditionalFeature` with `shouldEvaluate` so a flag is only evaluated when the component would render.
- When removing a flag, match the product request: delete the gated behavior or keep it permanently, and remove the discarded path's code and tests.

## Design system

- Semantic tokens (`text-primary`, `bg-surface-float`, `border-border-subtlest-tertiary`) and `typo-*` classes only; the `no-custom-color` ESLint rule blocks raw palette and hex colors, which also break theme switching.
- No raw `px` in arbitrary Tailwind values: the scale for multiples of 4, `rem` otherwise (`h-[1.125rem]`).
- One-off styles outside the token system go in `packages/shared/src/styles/custom.ts`.
- Full-screen media lightboxes need a dark overlay (`bg-overlay-primary-pepper`), not the Modal default `bg-overlay-quaternary-onion`. Close buttons over images use `ButtonVariant.Primary`; `Float` vanishes over photos.
- Dismissible banners/cards use the shared `CloseButton`, not a full-width text "Dismiss" button.
- CSS Grid feed: an item's intrinsic content height stretches the whole row even under `max-h-*`. Wrap content in an `absolute inset-0 flex flex-col` child and give the Card `min-h-card` (see `ArticleGrid.tsx`). Such constraints go on the grid variant of shared cards only.

## Product conventions

- Shared sections render on several surfaces (header popover and standalone page, regular and Plus); apply changes to every instance.
- Activity list modals (reposts, upvotes, history) reuse feed card primitives (`FeedItemContainer`, `PostCardHeader`): compact rows, no dominating images.
- User-facing limits get helper copy, not `3/5` counters, unless product asks for progress UI.
- Render what the query returns; backend access control decides visibility, not client heuristics like `source.public`.
- On search pages `MainFeedLayout` renders page `children` after the `<Feed>`; content above results goes through `searchChildren` in `layoutProps`.
- Tag labels render the backend `flags.title` or the raw value (`#react`), never client-derived casing; bare tag strings get titles from `tagTitlesQueryOptions`. A keyword's own page title (`<title>`, H1, JSON-LD) keeps the `formatKeyword` fallback for SEO.

## Interaction gotchas

- Infinite scroll: pass `fetchNextPage`, `canFetchMore` (from `hasNextPage`), and `isFetchingNextPage` as separate props; never derive `canFetchMore` from callback existence (see `InfiniteScrolling.tsx`).
- Portaled drawers/overlays must `stopPropagation` on the overlay click, otherwise `useOutsideClick` closes the parent modal (see `drawers/Drawer.tsx`).
- Next's scroll restoration is off, so the router scrolls to the top on every route change, back/forward included. `useScrollRestoration` restores the position itself and must wait for the feed to reach full height, or phones get stranded mid-feed.
- Markdown conversion: never run formatting regexes over already-generated HTML (image `src` URLs contain `_`).

## Node.js version upgrade checklist

Update `.nvmrc`, `Dockerfile`, `.github/workflows/e2e-tests.yml`, `.circleci/config.yml` (multiple spots), `packages/playwright/package.json` engines, the `volta` field in the root `package.json`, and `README.md`. Then `pnpm install` and commit the lockfile.

## Package guides

`packages/{webapp,extension,playwright}/AGENTS.md`, `packages/shared/src/{components,hooks}/AGENTS.md`.
