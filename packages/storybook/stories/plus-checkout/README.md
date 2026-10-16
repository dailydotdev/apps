# Plus checkout v2

The redesigned `/plus` checkout: one design, every use case, every breakpoint,
and the spec to build it. Storybook only — no product code changes in this PR.
It ships later as an A/B test against today’s page.

> **Built.** The production version lives in `packages/shared/src/components/plus/checkout/` behind the `plus_checkout_v2` flag (story `10. Built` renders it). On a PR preview, add `?checkout=v2` to `/plus` to see it.
>
> **Building more of it?** Read `IMPLEMENTATION.md` in this folder (Storybook: `0. Read me › Implementation spec`). It lists every file to create and change, where each number on screen comes from, the Paddle settings, the flag, and the acceptance checks.

## The design

Split screen on the app’s primary background. Left, the plan: headline, big
monthly price, Annual / Monthly as two explicit radio buttons (“3 months free”
on Annual), all ten Plus features in two columns with the three that sell it
first and bold, and a bill that says what is charged today and when it renews.
Right, payment: Paddle’s inline checkout restyled from the dashboard (white
“Subscribe now”, purple selection), then the 30-day refund. Phones get the same
checkout as two steps on one address — the plan with a sticky “Continue · ”, then payment with a collapsed order summary — the way Spotify, YouTube, NYT and Stripe-hosted checkouts do it (16 Oct).

## Storybook › Plus Checkout

| Story | What’s there |
|---|---|
| `0. Read me` | This overview, the implementation spec, and **Coverage**: every production surface and state mapped to a story or a decision |
| `1. The design` | The page as a clickable prototype; controls for every state; resize to see breakpoints |
| `2. Breakpoints` | 375, 420, 768, 1024, 1280, 1440, 1920, 2560 — live, side by side |
| `3. Use cases` | 33 cases (incl. prices loading, payment form blocked, bank verification, ZIP, gifted Plus, team/iOS thank-you): plan, entry points (`?ref=`), sale, gift, team, signed out, already Plus, region unavailable, loading, processing, declined, PayPal, Safari, success, gift sent, iOS app, renewal-reminder regions, Paddle express — plus an overview of all |
| `4. Flow` | Today’s flow vs the new one; each step with what runs and what’s logged; a click-through from load to success |
| `5. Paddle` | Is the design possible in Paddle? Yes — it is Paddle’s frame, restyled. What’s Paddle’s, what’s ours, settings, dashboard values, what to check in sandbox |
| `6. Before & after` | Production today (the control, built from production components) vs the new page, desktop and phone, and the A/B test plan |
| `7. Evidence` | The data and research behind each choice, 17 sourced subscription flows |
| `8. Showcase variants` | PR #6868’s animated feature scenes placed five ways. **B — the list plays — is the design since 15 Oct** and the default everywhere; A, C, D, E stay for reference |
| `10. Built (production component)` | The shared production components with mocked prices and auth |
| `9. After payment` | Thank-you page per purchase (personal, team, gift, iOS) next to today’s, and every email/message that follows |

## Files

| File | What |
|---|---|
| `IMPLEMENTATION.md` | The build spec |
| `docs/PADDLE.md`, `docs/AB-TEST.md`, `docs/EVIDENCE.md` | Rendered in stories 5, 6, 7 |
| `checkout/` | Reference implementation of the design — props in, markup out, ready to port to `packages/shared/src/components/plus/checkout/` |
| `checkout/PaddleFrameMock.tsx` | A drawing of Paddle’s frame. **Not to be ported**: production mounts the real one |
| `cases.ts` | The list of use cases every story reads |
| `today.tsx`, `mocks.tsx` | Today’s page from production components, and the providers they need |
| `showcase/` | Story 8: `Stage.tsx` is #6868’s tabs + window without the banner chrome; `variants.tsx` the five placements. Scenes come from shared (`PlusFeedBannerScenes` + `checkout/PlusCheckoutScenes`) |
| `data.ts`, `flowsSourced.ts` | Prices, the feature list in usage order, funnel numbers; the sourced competitor flows |

## Decisions (Tsahi, 8–15 Oct 2026)

- Split screen (Layout 2c) on the **primary background**, payment half on our dark surface.
- Cycle as **two explicit radio buttons**, the selected one in brand purple.
- **All ten features**, a plain checklist in **two columns, read down the left column first** (14 Oct); Briefing, Custom feeds and Ad-free first and bold; **Priority support** last.
- **White** “Subscribe now” (the design system’s primary on dark); card tile with the credit-card icon.
- Keep only this design; earlier layouts, colour reviews and the competitor gallery are in git history (commit `8784a3c75`).
- The bill’s **“Reminder email” row shows only where Paddle really sends one**: annual plans in the EU, the UK and 11 US states (13 Oct).
- **The feature list plays** (showcase B, 15 Oct): every row shows its scene on hover, rotates on its own, grey highlight, green checks. Needs #6868.
- Ship as an **A/B test** with today’s page as the control.

Open product decisions are listed in `IMPLEMENTATION.md` §9.
