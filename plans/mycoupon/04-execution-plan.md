# MyCoupon — Execution Plan (Opus 5 agents)

Implementation is mock-first on this branch: real components with mock data, Storybook coverage of every use case/variant/state, plus a full in-product mockup page. No backend, no GraphQL, no feature flag yet (mock branch, like the google-cloud demo was).

Surface name in code: **Deals** (`Features/Deals/*` in Storybook, `/deals` in the webapp). "MyCoupon" stays the internal initiative name.

## File layout

```
packages/shared/src/features/deals/
  types.ts            # DealType, DealState, Deal, DealBrand, ClaimRecord — plain TS (no Zod: no external input)
  mockDeals.ts        # ~20 offers covering every type × state; brands with real logos
  components/         # one component per file, no barrel index
packages/storybook/stories/features/deals/
  deals.mocks.tsx     # withDeals() decorator factory + MOCK_USER (copy giveback.mocks.tsx shape)
  *.stories.tsx       # CSF3, titles 'Features/Deals/<surface>'
packages/webapp/pages/deals/index.tsx   # thin page, google-cloud-demo pattern
```

## Conventions (from repo recon — follow exactly)

- **Stories:** `import type { Meta, StoryObj } from '@storybook/react-vite'` (NOT `@storybook/react`). CSF3. `parameters: { layout: 'padded' | 'fullscreen', controls: { disable: true } }` for composed surfaces. AllStates stories = local `states: {label, node}[]` array rendered in a labeled grid with `data-testid`. Interactive playgrounds = `render:` function with real `useState`. Never set a `themes` parameter (fights the global decorator). Non-story files must not end in `.stories.tsx`.
- **Decorator:** copy `stories/features/giveback/giveback.mocks.tsx`: `withDeals(options)` returns a Decorator wrapping `QueryClientProvider` (retry:false, staleTime:Infinity) → `AuthContextProvider` (MOCK_USER) → `getLogContextStatic().Provider` (noops) → `<div className="bg-background-default p-6 text-text-primary">`.
- **DS imports:**
  - `Button, ButtonSize, ButtonVariant` from `@dailydotdev/shared/src/components/buttons/Button`
  - `Typography, TypographyTag, TypographyType, TypographyColor` from `.../components/typography/Typography`
  - `Card, CardTitle, CardTextContainer, CardImage, CardSpace` from `.../components/cards/common/Card`
  - `Modal` + `ModalKind/ModalSize` from `.../components/modals/common/Modal` and `.../common/types`
  - `SearchField` from `.../components/fields/TextField` siblings (`fields/SearchField`), `Pill` from `.../components/Pill`, `HorizontalScroll` from `.../components/HorizontalScroll/HorizontalScroll`
  - `InviteLinkInput` from `.../components/referral/InviteLinkInput`, `SocialShareList` from `.../components/widgets/SocialShareList`
  - Icons from `@dailydotdev/shared/src/components/icons`
- **Styling:** semantic tokens + `typo-*` only (`no-custom-color` lint rule). Brand accents via inline `style` constants in a `brands.ts` (google-cloud `brand.ts` technique). Grid: `grid grid-cols-1 gap-6 tablet:grid-cols-2 laptopXL:grid-cols-3` (gear directory). Page gutter: `mx-auto w-full max-w-6xl px-4 tablet:px-8 laptop:px-12` (GivebackPage). Cards: build on `Card` primitives, `min-h-card` + absolute-inset content for content-heavy grid cards. Motion: interface-feel rules — enter = opacity+4px translateY+slight blur, ~200ms ease-out; `tabular-nums` on counters; no gratuitous animation.
- **Copy:** no em dashes. Dev-brand, honest tone (see 01/02 docs). Affiliate disclosure line where relevant.
- **Comments:** none unless a genuine *why* constraint. Code self-documents.

## Webapp mockup page

`/deals` is not feed-shaped, so it renders locally without a backend (chrome held, children paint). Pattern:

```tsx
const DealsPage = (): ReactElement => (
  <> <NextSeo nofollow noindex title="Deals for devs" /> <DealsDirectoryPage /> </>
);
DealsPage.getLayout = getLayout;            // webapp components/layouts/MainLayout
DealsPage.layoutProps = { screenCentered: false };
```

Sidebar entry: add a "Deals" item (Gift/tag icon, `path: ${webappUrl}deals`, `isForcedLink: true`) to `packages/shared/src/components/sidebar/sections/DiscoverSection.tsx` menuItems (feeds v1 Discover + v2 Explore panel). Mock-branch only; productionization will gate it behind a flag.

## Agent breakdown (all Opus 5)

**Wave 0 — Foundation (sequential, everything depends on it)**
`types.ts`, `mockDeals.ts`, `brands.ts`, core primitives: `DealValueBadge`, `DealTypePill`, `DealCommunityProof` (upvotes/claims/"worked ✓ 2h ago"), `DealCard` (grid variant handling all 6 types × 7 states incl. countdown, locked meter, sold-out counter, promoted label), `DealCodeReveal` (claim → reveal → copy → "did it work?"). Plus `deals.mocks.tsx` decorator + `DealCard.stories.tsx` with the full AllStates matrix.

**Wave 1 — four parallel agents (disjoint files, consume foundation, never edit it)**
- **A. Directory:** `DealsHero` (search + savings ticker), `DealsFilterBar` (chips), `DealsRail` (Ending soon / Trending / New / For you via HorizontalScroll), `DealImpactWidget`, `DealsDirectoryPage` (full composition, right rail on desktop, logged-out variant) + directory stories incl. full-page playground and empty/search-no-results states.
- **B. Detail + wallet:** `DealDetailModal` (community comments mock, terms, similar deals, share bar slot), claim flow playground (all 6 types end-to-end), `MyCouponsWallet` (`/deals` claimed tab: active/used/expired, copy) + stories.
- **C. Growth:** `DealShareBar` (copy personalized link / X / WhatsApp with pre-composed dev-flavored tweet), `DealInviteUnlock` (0/2 avatar progress on locked exclusives), `DealBoostMeter` (communal tiered discount), `DealShareLanding` (logged-out `?ref=` page: sharer avatar + offer + join-to-claim wall), sharer-impact notification states + stories.
- **D. Sidecar (independent, storybook-only):** self-contained mocks under `stories/features/deals/sidecar/` — fake store backdrop, collapsed pill ("3 deals for this store"), expanded panel (companion visual language: `w-[22.5rem] rounded-tl-16 border-border-subtlest-quaternary bg-background-default`, fixed right), auto-apply theater (~4s scripted code-cycling → "WORKED −$18" celebration AND "You already have the best price" end states), per-store mute row, directory cross-sell footer.

**Wave 2 — integration**
- **E. Webapp:** `pages/deals/index.tsx`, sidebar entry, verify page composition compiles.
- Final verification (orchestrator): `node ./scripts/typecheck-strict-changed.js`, `pnpm --filter storybook build` (or dev smoke), lint on touched packages.

## Verification

- Storybook: `pnpm --filter storybook dev` → http://localhost:6006 → `Features/Deals/*`. Restart Storybook if new-file Tailwind classes are missing.
- Webapp: `pnpm --filter webapp dev` → `/deals` (renders without backend; sidebar chrome may stay held locally).
- `node ./scripts/typecheck-strict-changed.js` must pass on all changed files.

## Productionization later (out of scope for the mock)

GraphQL schema + claims backend, `deals_directory` GrowthBook flag (default false), real referral attribution via `ReferralCampaignKey`, OG image rendering per offer, extension sidecar wiring in `packages/extension/src/companion`, anti-abuse rules from `02-growth-loops.md`.
