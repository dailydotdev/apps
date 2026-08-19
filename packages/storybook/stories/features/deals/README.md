# Deals (MyCoupon)

A curated directory of developer coupons, credits, gift cards and free-months
offers, native to daily.dev. Internal initiative name: MyCoupon. Product surface
name in code: Deals.

This branch is mock-first: real components, mock data, no backend, no GraphQL,
no feature flag. Specs and the agent breakdown live in `plans/mycoupon/`.

Foundation lives in `packages/shared/src/features/deals/` (types, `mockDeals.ts`,
`components/`). Run `pnpm --filter storybook dev` and open `Features/Deals/*`.
Restart Storybook after adding story files so new Tailwind classes compile.
