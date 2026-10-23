# Implementation spec — Plus checkout v2

For the engineer or agent who builds this. It replaces the `/plus` purchase
flow (page, phone payment step, signed-out handling, success page) with the
design in this folder, **behind an A/B flag**, keeping today’s page as the
control. Read this file top to bottom, then open the stories it points to.
Everything here was checked against the code on 13 Oct 2026; paths are from
the repo root.

## 1. What you are building

One route, `/plus`. Desktop (≥ 1020px) is one page with two halves; phones and tablets get the same content as two steps on that route:

- **Plan half (ours):** back + logo, headline, big monthly price (struck $9.99 on annual), two radio buttons Annual / Monthly, “Everything in Free, plus:” and all ten features in two columns, read down the left column first (first three bold), the bill (Due today + renewal date), links “Buying for a team?” / “Give Plus as a gift”.
- **Payment half (Paddle):** “Payment · 🔒 Secure · Paddle”, Paddle’s inline one-page frame (restyled from the dashboard), then the “Try Plus for 30 days” refund note.
- **≥ 1020px** split screen; **< 1020px** two steps: plan (sticky “Continue · ”) → payment (collapsed order summary + “Change”, then Paddle).
- **States:** signed out (sign-in instead of the frame), already Plus, region unavailable, Paddle loading, processing, declined, success, iOS app (StoreKit), team, gift, sale, entry-point variants (`?ref=`).

Stories (Storybook › Plus Checkout):

| Story | Use it for |
|---|---|
| `1. The design › Interactive prototype` | The page. Controls switch every state; resize the window for breakpoints. |
| `2. Breakpoints` | 375 → 2560 side by side (real media queries, in iframes). |
| `3. Use cases` | 33 cases, each its own story, plus an overview grid. The acceptance list. |
| `4. Flow` | Entry → sign-in → pay → processing/declined → success, with events per step. |
| `5. Paddle` | What is Paddle’s and what is ours; settings; dashboard styling. (docs/PADDLE.md) |
| `6. Before & after` | Control vs variant, desktop and phone, and the A/B plan. (docs/AB-TEST.md) |
| `7. Evidence` | Data, experiments and research behind each choice. (docs/EVIDENCE.md) |
| `8. Showcase variants` | Five placements of the feature scenes. **B (“the list plays”) is the design since 15 Oct** and is the default in every story; A, C, D, E are kept for reference. |
| `9. After payment` | Thank-you page per purchase (personal, team, gift, iOS) vs today’s, and every email/message that follows (docs/EMAILS.md). |
| `0. Read me › Coverage` | Every production surface and state → covered / unchanged / decision (docs/COVERAGE.md). Check this before calling the build done. |

The reference code is in `packages/storybook/stories/plus-checkout/checkout/`.
It is plain props-in/markup-out on purpose: **port it, don’t rewrite it.** The
only file that must not be ported is `PaddleFrameMock.tsx` — production
mounts the real frame with the existing `PlusCheckoutContainer`.

## 2. Today’s flow (control — do not change it)

| Piece | File | Behaviour |
|---|---|---|
| Route | `packages/webapp/pages/plus/index.tsx` | `isIOSNative()` → `PlusIOS`; `useViewSize(ViewSize.Laptop)` → `PlusDesktop`, else `PlusMobile` |
| Layout | `packages/webapp/components/layouts/PlusLayout/PlusLayout.tsx` | waits for GrowthBook + router + auth; **signed out → `router.push(onboardingUrl)`, destination lost**; forces dark theme; Cloudinary background; `PlusHeader` (Back + logo) |
| Desktop | `packages/shared/src/components/plus/PlusDesktop.tsx` | `PlusProductToggle` + `PlusInfo` left, `PlusCheckoutContainer` + `PlusTrustRefund` right, `PlusApiShowcase` + `PlusFAQ` below; auto-opens checkout (`?selectedPlan`, gift → `giftOneYear`) |
| Phone | `packages/shared/src/components/plus/PlusMobile.tsx` → `packages/webapp/pages/plus/payment.tsx` | pick a cycle, Continue → `/plus/payment?pid=&gift=` with the frame alone |
| Success | `packages/webapp/pages/plus/success.tsx` | static “Payment successful”, links to Plus onboarding and the feed |
| Payment context | `packages/shared/src/contexts/payment/*` | `PaddleSubProvider` (web), `StoreKitSubProvider` (iOS), `ChromeExtensionProvider` (extension) |
| Paddle | `packages/shared/src/hooks/usePaddlePayment.ts` | `initializePaddle` (inline, one-page, dark, `.checkout-container`, height 500); `openCheckout` → `Checkout.open` or `Checkout.updateItems` when already open |
| Prices | `packages/shared/src/hooks/useProductPricing.ts`, `packages/shared/src/graphql/paddle.ts` | GraphQL `pricingPreview(type, locale, discountId)` — formatted server-side |

## 3. New files

Create `packages/shared/src/components/plus/checkout/` and port:

| From (storybook reference) | To (shared) | Notes |
|---|---|---|
| `checkout/parts.tsx` › `CycleChoice` | `PlusCycleChoice.tsx` | Use real `<input type="radio">` (visually hidden) inside labels so arrow keys move between options. Props from `ProductPricingPreview[]`, not the `Cycle` string. |
| `showcase/variants.tsx` › `SyncedChecklist` (+ `parts.tsx` › `checklistGridClass`) | `PlusFeatureChecklist.tsx` | **The list plays** (default since 15 Oct): items from a new `plusFeatureListCheckout` in `PlusList.tsx` (labels below). Two columns from `tablet:`, filled column by column; one column on phones. Every row is a button: hover/focus shows its scene in the window under the list and holds it; leaving resumes the 4.2s rotation. Grey highlight that hugs the label; checks stay green. The scenes come from PR #6868’s `PlusFeedBannerScenes` (six) + `showcase/moreScenes.tsx` (four: API limits, auto-translate, bonus quests, priority support) — move those four and the exported primitives into #6868 or right after it. Fallback without #6868: the static checklist (`featureList: static`, one screen at 1280×800). |
| `parts.tsx` › `PriceBlock`, `priceFor` | `PlusPriceBlock.tsx` | See §5 for each number’s source. |
| `parts.tsx` › `Bill`, `timelineFor` | `PlusBill.tsx` | Dates with `date-fns` `addYears`/`addMonths` from today, formatted with the user’s locale. |
| `parts.tsx` › `PanelHeader`, `RefundNote`, `BackButton`, `OtherPurchases`, `SaleStrip`, `GiftRecipient`, `SeatStepper` | same names, `Plus*` prefix | `SeatStepper` → reuse `PlusAdjustQuantity` logic (it already calls `openCheckout` with quantity and logs `SetOrgSize`). `GiftRecipient` → reuse `GiftingSelectedUser` data; “Change” opens `LazyModal.GiftPlus`. `SaleStrip` → `usePlusSale()` copy. |
| `checkout/panels.tsx` | `PlusSignInPanel.tsx`, `PlusMemberPanel.tsx`, `PlusAppStorePanel.tsx` | Unavailable → reuse `PlusUnavailable` copy inside the panel frame. Member panel → reuse `PlusPlus` (Manage subscription hidden for gifted Plus). |
| `checkout/CheckoutPage.tsx` | `PlusCheckoutV2.tsx` | The page body. Replace `PaddleFrameMock` with `<PlusCheckoutContainer />`. |
| `panels.tsx` › `SuccessPage` | `PlusSuccessV2.tsx` | Rendered by `/plus/success` when the flag is on. One next action per purchase (`SuccessKind`: personal → Briefing; team → invite members; gift → none; iOS → Apple receipt). Read the purchase from `checkout.completed` (`customData.gifter_id`, quantity, plan_type) and pass it in the URL (`/plus/success?kind=team`). |

Feature labels, in this order (the order is the data: usage, see Evidence):

```
Presidential Briefing · Custom feeds · Ad-free · AI-cleaned titles · Bookmark folders ·
Keyword filters · Higher API rate limits · Auto-translate your feed · Bonus quest slots ·
Priority support
```

## 4. Wiring

1. **Flag** — add `featurePlusCheckoutV2 = new Feature('plus_checkout_v2', false)` to `packages/shared/src/lib/featureManagement.ts`. Evaluation rules and exclusions: docs/AB-TEST.md.
2. **`PlusLayout`** — evaluate the flag before the signed-out redirect. Variant: no redirect, no `PlusHeader` (the page has its own back + logo), no Cloudinary image (the page paints its own gradient). Control: unchanged.
3. **`/plus` page** — variant renders `PlusCheckoutV2` for every viewport (no `PlusDesktop`/`PlusMobile` split, no `/plus/payment` hop). iOS stays on `PlusIOS` (out of the test).
4. **Checkout open** — on mount (signed in, can buy): `openCheckout({ priceId: annual })`, same as `PlusDesktop` today, honouring `?selectedPlan`, `?type=team`, `?gift=`. Cycle change → `openCheckout({ priceId })` (→ `updateItems`, unchanged). Seats → `openCheckout({ priceId, quantity })`.
5. **Paddle settings** for the variant — `allowLogout: false`, `showAddTaxId: isOrganization`, `showAddDiscounts: Boolean(discountId)` (docs/PADDLE.md). Pass them from `openCheckout` so the control is unaffected.
6. **Phase from events** — expose a `phase` from `usePaddlePayment` (`loading` until `checkout.loaded`, `processing` on `checkout.payment.initiated`, `declined` on `checkout.payment.failed` / `checkout.error`, back to `ready` on `checkout.payment.selected` or any item update). **`blocked`** when `checkout.loaded` hasn’t fired 10s after `Checkout.open` (usually an ad/privacy blocker) → our message + Try again (re-open). 3-D Secure happens inside Paddle; treat it as `processing` (the `authenticating` story only shows what the person sees). The page locks the cycle, seats and purchase links while processing. While `isPricesPending`, render the skeletons (`Prices loading` story) and don’t open Paddle.
7. **Signed out** — `PlusSignInPanel` buttons call `showLogin({ trigger: AuthTriggers.Plus })` (as `UpgradeToPlus` does). After auth the user is still on `/plus`; the effect in step 4 opens checkout. Keep `?ref`, `?type`, `?gift` across auth.
8. **Phones and tablets (< 1020px): two steps on one route** (decided 16 Oct: the common pattern — Spotify, YouTube, NYT, Netflix and Stripe-hosted SaaS separate plan and payment — and today’s two-page phone flow converts). Step 1 is the plan half with a sticky bar (price today, cycle, **Continue**). Step 2 is `router.push({ query: { ...query, step: 'payment' } }, undefined, { shallow: true })`: Back + logo, `OrderSummary` (title, renewal line, due today, **Change** → back to step 1, **Details** expands the full bill), then Paddle and the refund note. The browser Back button returns to step 1 with everything kept (cycle, type, seats, gift, ref live in the query). Scroll to top and move focus to the step on change. Open Paddle when step 2 mounts (its container must be visible); cycle/seat changes happen on step 1, so step 2 always opens with the final items. Signed out: step 2 shows the sign-in panel (or open `showLogin` straight from Continue). iOS app: no step 2 — the bar’s **Subscribe** opens Apple’s sheet. Already Plus, unavailable, prices loading, success: no bar, one column. Retire `/plus/payment` for this arm (keep it for the extension until its link moves to `/plus`).
   The bar’s bottom padding is `max(0.75rem, env(safe-area-inset-bottom))` for the iPhone home indicator, step 1 keeps `pb-28` so the bar never covers the last links, and the bar’s button is locked while processing.
9. **Success** — `checkout.completed` already pushes `/plus/success`. Variant renders `PlusSuccessV2`: “Welcome to Plus”, receipt line, one next action → the Briefing (`briefingUrl`; confirm where the schedule is set before linking deeper), secondary “Go to my feed”. Keep `clearMarketingCta` from today’s page.
10. **Entry points** — add `?ref=<id>` to these links (no visual change). The page maps `ref` → lead features and headline (`entryCopy` in parts.tsx); unknown → default.

| `ref` | Components |
|---|---|
| `ads` | `cards/ad/common/RemoveAd.tsx` |
| `brief` | `features/briefing/components/BriefPlusUpgradeCTA.tsx`, `components/post/brief/BriefPostContent.tsx` |
| `custom-feed` | `feeds/FeedSettingsButton.tsx`, `feeds/FeedSettings/useFeedSettingsEdit.tsx`, `feeds/FeedSettings/FeedSettingsEditHeader.tsx`, `feeds/FeedSettings/sections/FeedSettingsAISection.tsx` |
| `clickbait` | `modals/ClickbaitShieldModal.tsx`, `post/common/PostClickbaitShield.tsx` → `PostUpgradeToPlus.tsx` |
| `bookmarks` | `plus/BookmarkFoldersStrip.tsx`, `modals/bookmark/BookmarkFolderModal.tsx`, `modals/soon/BookmarkFolderSoonModal.tsx` |

(Paths under `packages/shared/src/components/` unless they start with `features/`.)

## 5. Where every number comes from

| On screen | Source |
|---|---|
| Big price, annual (`$7.49`) | annual product `price.monthly.formatted` |
| Struck price (`$9.99`) | monthly product `price.formatted` (annual only) |
| Big price, monthly | monthly product `price.formatted` |
| Annual sub-line “$7.49/mo · $89.99 billed yearly” | annual `price.monthly.formatted` · `price.formatted` |
| “3 months free” | annual `metadata.caption.copy` — set it in the pricing metadata (today it says “Popular”), so it can change without a deploy. Don’t hard-code. |
| Due today | selected product `price.formatted` (× seats for team; gift → `giftOneYear`) |
| Sale price + struck | products fetched with the sale `discountId` (already how `pricingPreview` works) vs. without |
| Renewal date | today + 1 year / 1 month, user locale |
| “By <date> · Reminder email before it renews” | Only when `getsRenewalReminder()` is true: annual (not gift, not iOS) **and** `geo.region` is in the EU 27 or GB, or the US with one of 11 states. Date = renewal − 7 days, worded “by” because Paddle sends it 7 **or** 30 days before depending on location and doesn’t publish which. Lists: `paddleReminderCountries` / `paddleReminderUsStates` in data.ts, from [Paddle’s location list](https://www.paddle.com/help/manage/your-customers/enhanced-billing-notifications-location-list). Port both as constants next to the bill. |
| Currency | `currency.code` / `symbol` from the same products — never assume USD |
| Tax note | static copy; Paddle computes tax inside the frame |

## 6. Breakpoints

App screens: `mobileL` 420 · `tablet` 656 · `laptop` 1020 · `laptopL` 1360 · `desktop` 1976.

| Width | Layout |
|---|---|
| < 656 | Two steps. Step 1: one column, 16px gutters, cycle buttons stacked, features one column, sticky Continue bar. Step 2: summary + Paddle. |
| 656–1019 | Two steps, max 576px centred. Cycle buttons side by side, features two columns. |
| ≥ 1020 | Two full-height halves. Plan content max 544px, aligned to the centre line; payment max 512px. Cycle buttons wrap if the half is narrow (1024). |
| 1280×800 | Reference: the whole page with no scroll. |
| ≥ 1360 | More padding; caps keep line length. |

Paddle’s minimum frame width is 286px (padding off). The narrowest payment column is 343px (375 phone).

## 7. Logging

Keep every existing event unchanged (`SelectBillingCycle`, `InitiateCheckout`,
`SelectCheckoutPayment`, `InitiatePayment`, `ErrorPayment`, `ErrorCheckout`,
`CompleteCheckout`, `SetOrgSize`, `GiftSubscription`, `PageScroll`). Add one
field, so results split by entry point: `extra.ref` on `SelectBillingCycle` and
`CompleteCheckout` when the page was opened with `?ref=`. GrowthBook records the
arm. The playing list logs `ClickPlusFeature` (`target_id: PlusPage`, `extra.feature` with
the production feature ids, as #6868 does) **once per feature per visit** on hover/focus/click,
not on the automatic rotation — so “which feature did buyers look at” reads like the feed banner.

## 8. Known bugs to fix or avoid on the way

1. `ChromeExtensionProvider.openCheckout` builds `/plus/payment?priceId=&giftToUserId=&discountId=`, but the page reads `pid` / `gift` → bounces to `/plus`. (`PlusExtension` uses `?pid=` and works.)
2. `/plus/payment` has no `GiftUserContext`: a Plus member gifting on a phone gets “already Plus” and no frame. (Gone in the variant: no `/plus/payment`.)
3. Phone “Continue” drops Team and seats (no `type`/`quantity` in the URL). (Gone in the variant.)
4. `updateItems` swaps items only; `customData` and the discount are set at `open`. Re-open, don’t update, if either changes.
5. The onboarding funnel (`FunnelOrganicCheckout`) renders `PlusDesktop`/`PlusMobile`/`PlusIOS` directly — leave them intact.
6. Signed-out redirect drops the destination (fixed in the variant by not redirecting).
7. `?d_id=` overrides any sale discount for every Paddle checkout.

## 9. Open decisions (need a product answer before or during the build)

| # | Decision | Default in the design |
|---|---|---|
| 1 | US states: boot `geo` has only the country (`geo.region`), so US visitors get no reminder row even in NY or CA. Add the IP-derived state to boot (`geo.subdivision`) to show it there? Elsewhere outside Paddle’s list, send our own reminder email so every annual bill can show the row? | Row shown in the EU and UK only; US hidden until the state is known. Stories: `Outside Paddle’s reminder regions`, `US state with a reminder (New York)`. |
| 2 | Turn off Paddle’s saved payment methods (removes “Save my card details”)? Account-wide. | Hidden in the design; confirm Cores/Recruiter don’t need it. |
| 3 | Keep an FAQ below the fold? | None. |
| 4 | Paddle’s express variant (wallets first) on phones? | Not in this test. Story: `Phone, Paddle express`. |
| 5 | iOS app gets the new plan half (StoreKit button)? | Designed (`iOS app` story), out of this test. |
| 6 | A member who subscribed on iOS opens `/plus` on the web: “Manage subscription” goes to the Paddle portal, which can’t manage an Apple subscription. Send them to Apple’s settings instead? | Not designed; production has the same gap. |
| 7 | Paddle Retain (failed-payment emails) and Checkout Recovery (abandoned-checkout emails): on or off? | Unknown — check the Paddle dashboard (docs/EMAILS.md). |
| 8 | Does daily.dev send its own email after a purchase or to a gift recipient? | Not in this repo; the new pages promise none. |

## 10. Acceptance

- Every story in `3. Use cases` matches in production at 375, 768, 1024, 1280 and 1440.
- At 1280×800 the variant shows plan, bill and Paddle’s button with no scroll.
- Keyboard: Tab reaches back, cycle radios (arrow keys switch), seats, links, then the frame; focus visible everywhere.
- Switching cycle never reloads the frame (`updateItems`), never double-charges, and is locked while processing.
- Signed-out → sign in → back on `/plus` with the same cycle, type and gift.
- The reminder row appears for annual in DE/FR/GB, never for monthly, gift, iOS, US without a state, IL, IN or BR. Unit-test `getsRenewalReminder`.
- Control arm is pixel-identical to today (compare with `6. Before & after › Today`).
- Unit tests for price/bill derivation (annual, monthly, team × seats, gift, sale, non-USD) and for `ref` → lead mapping.
