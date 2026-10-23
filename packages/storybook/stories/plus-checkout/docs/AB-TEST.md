## A/B test plan

The new checkout ships behind a flag as an experiment. The current page is the
control and stays in the code untouched until the result is in.

### The flag

```ts
// packages/shared/src/lib/featureManagement.ts
export const featurePlusCheckoutV2 = new Feature('plus_checkout_v2', false);
```

- **Control (`false`)** — today: `PlusDesktop` ≥ 1020px, `PlusMobile` → `/plus/payment` below, signed-out → `/onboarding`.
- **Variant (`true`)** — the new page on every size, one route, signed-out sees the plan + sign-in.

### Who is in it

| In | Out (always control) |
|---|---|
| Web visitors to `/plus` — browser, Android app (it’s Chrome), signed in or not | iOS app (StoreKit: a different purchase path; run it as a second test) |
| Personal, Team (`?type=team`) and Gift (`?gift=`) | The onboarding funnel (`FunnelOrganicCheckout` reuses PlusDesktop/PlusMobile — don’t touch it) |
| | Plus members buying for themselves (they see “already Plus” in both arms) |
| | The extension’s own modal (it links to `/plus/payment`) |

Evaluate in `PlusLayout`, **before** its signed-out redirect, so signed-out
visitors are bucketed too (GrowthBook keys them by tracking id):

```ts
const { value: isV2 } = useConditionalFeature({
  feature: featurePlusCheckoutV2,
  shouldEvaluate: growthbookReady && isAuthReady && !isIOSNative() && !(user?.isPlus && !isTeamOrGift),
});
```

Exposure happens on `/plus` render — not on entry-point impressions.

### What we measure

Per exposed visitor, over the whole visit (cross-device is out of scope):

| Metric | Event | Why |
|---|---|---|
| **Primary: purchase rate** | `CompleteCheckout` (personal) | The decision. |
| Revenue per visitor | `CompleteCheckout.extra.localCost`, converted to USD | Annual vs monthly mix shifts revenue more than count. |
| Payment intent | `InitiatePayment` | The leading indicator. |
| Annual share | `CompleteCheckout.extra.cycle` | Should not drop below control. |
| Phone purchase rate | the above, viewport < 1020, Android app included | Phones buy through two steps today; too few to read alone, so watch as a guardrail. |
| By entry point | the above, split by `?ref` | Ads visitors should move most (the page now leads with “without ads”). |

Guardrails: `ErrorCheckout` / `ErrorPayment` rate, 30-day refund rate, time
from page view to `checkout.loaded`.

`SelectBillingCycle` is **not** comparable: the new page preselects Annual and
the control’s desktop auto-opens checkout too, so “picked a cycle” means
different things in each arm.

### How long

Size the test from the current /plus baseline (page views and purchase rate,
internal). Volume is small, so expect weeks to months: read `InitiatePayment`
and revenue per visitor first, and don’t call purchases early. Phones are too
few to read on their own — treat them as a guardrail.

### Order of operations

1. **Paddle dashboard styling first, for everyone** (white button, purple focus — see `5. Paddle`). It’s account-wide and can’t be split by arm. Check Cores and Recruiter checkouts the same day. Leave one week as the new baseline.
2. Ship the variant behind `plus_checkout_v2` at 0%. QA both arms in production with GrowthBook overrides.
3. 50/50 for web `/plus` visitors.
4. Decide. If it wins: remove the flag, delete `PlusDesktop` / `PlusMobile` / `/plus/payment` usage from `/plus` (keep `/plus/payment` while the extension still links to it), update the onboarding funnel separately. If it loses: remove the variant code; keep the dashboard styling only if the baseline week didn’t move.
