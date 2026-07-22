# AGENTS.md

Guidance for AI coding agents in this repo. Kept intentionally lean: only reusable lessons and facts that are hard to discover from the code.

## Project Overview

pnpm monorepo for the daily.dev app suite:

- `packages/webapp`: Next.js 15 with **Pages Router (NOT App Router / Server Components)**, deployed on Vercel
- `packages/extension`: browser extension (Chrome/Edge/Opera), built with Rspack
- `packages/shared`: shared components, hooks, GraphQL, design system (the heart of the codebase)
- `packages/storybook`, `packages/playwright`, plus eslint/prettier config packages

Stack: Node v24.18, pnpm 10.33.4, React 18, TypeScript, TanStack Query v5 (mutations use `isPending`, not `isLoading`), graphql-request, Tailwind with a custom design system, Jest, GrowthBook for flags/experiments.

We're a startup: favor pragmatic solutions, code will change, don't over-engineer. Write tests that validate functionality, not coverage metrics.

## Commands and Verification

```bash
pnpm --filter webapp dev          # webapp HTTPS (dev:notls for HTTP)
pnpm --filter extension dev:chrome
pnpm --filter <package> test|lint|lint:fix
```

- When running Jest manually (`pnpm exec jest` or a direct file path), set `NODE_ENV=test`, otherwise React/RTL run under a production build.
- Do NOT run `build` while a dev server is running (it breaks hot reload). Build only at the end to verify compilation.
- For changed `.ts`/`.tsx` files, run `node ./scripts/typecheck-strict-changed.js` before finishing. Package-wide strict tsc has unrelated backlog; the changed-file guard is the signal.
- After touching a shared component, run the dependent packages' tests too (`pnpm --filter webapp test`), not just `shared`. Cross-package tests query DOM structure (`nextElementSibling`, `closest`) and break silently otherwise.

## Where Code Goes

- Used by both webapp AND extension → `packages/shared` (`src/components|hooks|graphql|contexts|features|lib`)
- Webapp only → `packages/webapp` (`pages/`, `components/layouts/`)
- Extension only → `packages/extension/src` (`newtab/`, `companion/`, `background/`)
- Shared utilities live in `packages/shared/src/lib/` (`func.ts`, `strings.ts`, `links.ts`, domain files). Search for an existing helper before writing one; never copy-paste a helper into multiple files.

## Code Style

- Early returns over if-else; handle errors/guards first, happy path last.
- Comments only explain *why* (constraints, gotchas, trade-offs), never *what*.
- Fail fast on violated invariants with a thrown error; no silent no-op fallbacks.
- **Always derive types from Zod schemas with `z.infer`**; never hand-write a type that duplicates a schema.
- **No barrel `index.ts` files.** Import directly from the source file. When you see an existing barrel, delete it and fix imports.
- Don't extract single-use code into helpers; extract only when logic is reused.
- When a hook callback grows unreadable, split it into small single-purpose named helpers and keep the main callback high-level.
- Delete dead code, unused exports, and duplicate type definitions. Don't create two components with the same name in different places.
- Don't add context-specific props to shared primitives when the behavior can be scoped in the parent list/container.

## Design System

- Use semantic tokens (`text-primary`, `bg-surface-float`, `border-border-subtlest-tertiary`) and `typo-*` classes. The custom `no-custom-color` ESLint rule blocks raw palette colors and hex values, which also break theme switching.
- Custom breakpoints: mobileL/mobileXL/tablet/laptop/laptopL/laptopXL/desktop (see `packages/shared/tailwind/AGENTS.md`).
- Dismissible banners/cards use the shared `CloseButton` icon pattern, not a full-width text "Dismiss" button, unless explicitly requested.

## Feature Flags (GrowthBook)

- Flags live in `packages/shared/src/lib/featureManagement.ts`. **NEVER default an experiment flag to `true`**: the default is the control/off value, and a truthy default ships the experiment to 100% of users on merge with no rollback short of a deploy. Preview locally by toggling the flag in GrowthBook/devtools, not by changing the committed default.
- Use `useConditionalFeature` with `shouldEvaluate` so the flag is only evaluated when the component would actually render.
- When removing a flag, match the product request explicitly: either delete the gated behavior or keep it permanently, and remove dead code/tests for the discarded path. Don't assume gated UI becomes always-on.

## Platform Detection

The "calling platform" is not just extension vs webapp. Native iOS/Android wrappers run the webapp shell, so `isExtension`/`BootApp` can't distinguish them; the native platform is surfaced via the app version (`useWebappVersion`). Use the shared `getDailyClientPlatform(version)` helper in `packages/shared/src/lib/func.ts`. Never reduce platform to an `isExtension ? 'extension' : 'webapp'` boolean.

## Layout and CSS Lessons

- Text truncation in flex layouts: put the ellipsis on the text element itself and make the nearest flex item shrinkable with `min-w-0` (plus `flex-1` when it should fill). `truncate` on the whole row does not work.
- In `flex-col items-center` layouts, a `max-w-*` cap needs an explicit `w-full` too, otherwise the element shrinks to content and jumps in width when children change.
- When fixing missing padding/margins, don't re-disable them at larger breakpoints (`laptop:mx-0`) unless desktop edge-to-edge is explicitly requested, and keep spacing consistent across sibling sections. Verify mobile and desktop before shipping.
- Floating controls over positioned siblings (e.g. a close button over an `<img>` with `relative`): render the control AFTER the content in JSX AND give it an explicit `z-*`. z-index alone is fragile in stacking-context edge cases.
- Overlay tint tiers exist (`primary` ~64% down to `quaternary` ~24%). Match the tier to the surface: full-screen media lightboxes need a dark neutral like `bg-overlay-primary-pepper`, not the Modal default `bg-overlay-quaternary-onion`.
- Close buttons overlaid on images/media: `ButtonVariant.Primary` (solid), not `Float` (~8% opacity surface that disappears over photos).
- In the CSS Grid feed, an item's intrinsic content height stretches the whole row even when `max-h-*` caps visual height. For content-heavy grid cards, wrap the content in an `absolute inset-0 flex flex-col` child and give the Card `min-h-card` (see `ArticleGrid.tsx`).
- Shared card components with `grid`/`list` variants: apply height/scroll constraints (`min-h-0 overflow-y-auto`, `flex-1`) only to the grid variant; list cards fit content naturally.
- Drag overlays/tooltips that read async query data must handle `undefined`/empty without crashing. Don't render owner-visible empty drag containers/categories unless explicitly required.

## UI and Product Lessons

- If a bug report names a specific component or screen, change only that target. Confirm the surface before implementing.
- Keep scope tight: no unrelated behavioral/SEO changes in a design-iteration commit.
- Add new content inside existing page sections/components. Don't create parallel wrapper components or duplicate section headers.
- Reuse existing feed/list card primitives (`FeedItemContainer`, `PostCardHeader`, etc.) before inventing modal-specific list items. Activity list modals (reposts/upvotes/history) are metadata-first: compact rows, no dominating content images.
- Don't hide accessible data with presentation heuristics (e.g. masking on `source.public`); rely on backend access control and render what the query returns.
- Wrong value in truncated/collapsed UI: fix only the computation (derive from the full dataset) while rendering the exact same subset and keeping "Show More" gating identical. Don't change the collapse unit as a side effect. Assert collapsed↔expanded parity in a test.
- When adding an optional feature to a shared component, gate any new wrapper/DOM on the new prop so existing consumers keep their original DOM.
- Shared sections often render on multiple surfaces (e.g. a header popover AND a standalone page, regular AND Plus instances). Apply per-section UI changes to every instance.
- On search pages, `MainFeedLayout` renders page `children` AFTER the `<Feed>`. Content above feed results goes through the `searchChildren` prop (via `layoutProps`).
- Feed promos between nav and feed belong in the content flow (pushing content down), not absolutely positioned on sticky nav, unless overlay behavior is explicitly requested.
- Match existing horizontal gaps on both sides when adding buttons near search fields or other controls.

## Forms and Interaction Lessons

- Always set explicit `type` on `<button>` in forms (`type="button"` for close/back/cancel). Browser default is `submit`.
- Infinite scroll: pass `fetchNextPage`, `canFetchMore` (from `hasNextPage`), and `isFetchingNextPage` as separate props. Never derive `canFetchMore` from callback existence (`!!onScrollEnd`). Gate with `canFetchMore && !isFetchingNextPage` (see `InfiniteScrolling.tsx`).
- Paginated dropdowns with a pre-selected value not in page one: insert a placeholder entry up front and dedupe by `id` when the real item loads. Never `findIndex(...) || 0` (silently selects the first item); use `?? -1`.
- Portaled drawers/overlays must `stopPropagation` on the overlay click, otherwise `useOutsideClick` closes the parent modal (see `BaseDrawer`).
- Tooltip requests: wrap the real interactive hover target with the tooltip component. A native `title` attribute is not a substitute.
- When renaming visible copy, update text-asserting tests (`findByText`) in the same PR.
- In markdown conversion utilities, never run formatting regexes across already-generated HTML (e.g. image `src` URLs containing `_`). Add regression tests for URL edge cases.
- For one-off contrast/readability fixes, swap tokens at the component level; don't change global tokens in `base.css` unless asked.

## SEO and Data

- When changing SEO/gating/noindex logic, preserve existing `undefined`/nullable behavior unless explicitly changed, and verify field names against the typed GraphQL model, not ticket prose.

## State Management

Server data → TanStack Query. Global app state → React Context. Local UI state → `useState`. Forms → react-hook-form + Zod.

## Pull Requests

- Conventional commit messages (`fix:`, `feat:`, `chore:`). Concise PR descriptions.
- Before opening a PR, run `git diff --name-only origin/main...HEAD` and confirm every changed file belongs to the task.

## Node.js Version Upgrade Checklist

Update: `.nvmrc`, `Dockerfile`, `.github/workflows/e2e-tests.yml`, `.circleci/config.yml` (multiple spots), `packages/playwright/package.json` engines, and this file. Then `pnpm install` and commit lockfile changes.

## Package-Specific Guides

- `packages/shared/AGENTS.md` (+ `src/components|hooks|contexts|graphql|features/AGENTS.md`, `tailwind/AGENTS.md`)
- `packages/webapp/AGENTS.md`
- `packages/extension/AGENTS.md`
- `packages/storybook/AGENTS.md`
- `packages/playwright/AGENTS.md`
