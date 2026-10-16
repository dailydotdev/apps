## Verdict: keep Paddle’s inline frame, restyle it, build the left half

The question was whether the new design’s payment half is something Paddle
supports, or whether we should keep the current implementation’s form and
fields. They are the same thing: **the form in production today is Paddle’s
inline one-page checkout** (an iframe). Its fields can’t be replaced by ours —
Paddle documents two checkout modes, overlay and inline, and neither lets us
draw our own card fields (owning card inputs would also put us in PCI scope). So the new design keeps the current implementation (`usePaddlePayment`
→ `Paddle.Checkout.open` into `.checkout-container`) and changes only what Paddle
lets us change:

1. **Dashboard styling** (Paddle › Checkout › Checkout configuration › Styling) — colours, borders, radius, focus, button, labels, padding. No deploy.
2. **Three `open()` settings** — hide the VAT link, the discount link, and lock the email.
3. **Everything outside the frame** — the whole plan half, the “Payment · Secure · Paddle” header, the refund note. Paddle says its inline frame “doesn’t include a breakdown of items or totals”, so the bill is ours by design.

The mock in this folder (`checkout/PaddleFrameMock.tsx`) is drawn from the
production frame, not from the earlier mock: method tiles in a row, Name on
card, one joined card block, the button, Paddle’s “$X now, then …” line and its
footer. Email and country don’t render because production prefills them.

## Element by element

| Element in the design | Whose | Can we get it? | How |
|---|---|---|---|
| Card / PayPal / wallet tiles in a row | Paddle | Yes, as today | Production already renders them as a row. Which wallets show is Paddle’s call: Apple Pay on Safari/iOS, Google Pay on Chrome/Android, PayPal in supported currencies. `allowedPaymentMethods` filters; order can’t be set. |
| Purple selected/focus border | Paddle | Yes | Dashboard styling: focus border + shadow colour `#BA56E1` (today green). |
| Name on card, card number with brands, MM/YY + CVV | Paddle | As today | Fixed fields and order. Can’t prefill the name. |
| White “Subscribe now”, dark text | Paddle | Colour yes; label as today | Dashboard: primary button `#FFFFFF`, text `#0F1218`, radius 10. The label is Paddle’s; production shows “Subscribe now”. Paddle’s 2024 compliance changelog says buttons may show the amount (“Pay $X”) — **check in sandbox** which one our account gets. |
| “$89.99 now, then $89.99/year from 8 Oct 2027.” | Paddle | Yes, Paddle prints it | Fixed wording. Our bill on the left says the same thing in more detail; that’s fine and expected. |
| “Sold by paddle … Terms · Privacy” footer | Paddle | Must stay | Restyle only. Must stay fully visible: the frame height must never clip it. |
| No email field | Paddle | Yes, as today | `customer.email` prefilled. Add `allowLogout: false` so it can’t be changed if it does render. |
| No country field | Paddle | Yes, as today | `customer.address.countryCode = geo.region` (production does this). US/CA etc. may still ask for a postcode. |
| No “Add VAT number” (personal) | Paddle | Yes | `showAddTaxId: purchase === 'team'`. |
| No “Add discount code” | Paddle | Yes | `showAddDiscounts: isSaleLive` (the sale prefills `discountId` anyway). |
| No “Save my card details” box | Paddle | Dashboard | Shown because saved payment methods are on. **Account-wide**: turning it off affects Cores and Recruiter checkouts too. Open decision. |
| Transparent frame on our page background | Paddle | Mostly | `frameStyle: background-color: transparent`, dashboard padding off (then `min-width: 286px`). Paddle doesn’t document an exact background colour; its dark theme sits on our `background-default` in production today without a seam. |
| “Payment · 🔒 Secure · Paddle” | Ours | — | Markup above the frame. |
| “Reminder email before it renews” row in the bill | Ours, about Paddle’s email | Region-dependent | Paddle emails it (can’t be turned off or edited) only for 180+ day plans in the EU 27, the UK and 11 US states, 7 or 30 days before. The row shows only there; see IMPLEMENTATION.md §5. |
| Plan half, bill, renewal date, struck price, sale | Ours | — | From `productOptions` (GraphQL `pricingPreview`, server-side Paddle preview). |
| “Try Plus for 30 days” refund note | Ours | — | Copy of `PlusTrustRefund`’s promise (30-day refund, no questions asked). |

## Settings for the new arm

```ts
// usePaddlePayment.ts — Paddle.Checkout.open for the new arm
paddle.Checkout.open({
  items: [{ priceId, quantity }],
  customer: { email: user.email, address: { countryCode: geo.region } },
  customData,          // unchanged: user_id, tracking_id, gifter_id
  discountId,          // unchanged: sale or ?d_id=
  settings: {
    allowLogout: false,
    showAddTaxId: isOrganization,
    showAddDiscounts: Boolean(discountId), // sale only
    // unchanged from initializePaddle: displayMode 'inline', variant 'one-page',
    // theme 'dark', frameTarget 'checkout-container'
    frameInitialHeight: 450,   // measure in sandbox; the footer must never clip
  },
});
// Cycle / seats change: unchanged — openCheckout() → paddle.Checkout.updateItems(items)
```

`Checkout.open` accepts per-call `settings`, so these can differ by arm. The
dashboard styling can’t — see below.

## Dashboard styling (one change, account-wide)

| Option group | Value |
|---|---|
| Font | The system font closest to the app (no web fonts) |
| Text | primary `#FFFFFF`, secondary `#A8B3CE`, labels 13px top-aligned |
| Inputs | background `rgba(168,179,206,.06)`, border `rgba(168,179,206,.2)`, radius 10 |
| Focus / selected | border `#BA56E1`, shadow `#BA56E1` |
| Primary button | background `#FFFFFF`, text `#0F1218`, radius 10, height 48, hover `#E8EAF0` |
| Links | `#A8B3CE`, 13px |
| Frame padding | off |
| Marketing consent | off |

**This is account-wide.** The same checkout configuration styles the Cores
checkout (`PaddleBuyCoresContext`) and the Recruiter checkouts
(`RecruiterPaymentContext/*`), and it can’t be split by experiment arm. Change
it **before** the A/B starts, as its own step, and check the other checkouts
the same day. The test then measures the page, not the button colour.

## Events → what the page does

| Paddle.js event | Page | Logged (existing) |
|---|---|---|
| `checkout.loaded` | skeleton → frame | `InitiateCheckout` |
| `checkout.items.updated` | `checkoutItemsLoading` false | — |
| `checkout.payment.selected` | — | `SelectCheckoutPayment` |
| `checkout.payment.initiated` | phase = processing; lock the cycle buttons | `InitiatePayment` |
| `checkout.payment.failed` | phase = declined (Paddle shows the message) | `ErrorPayment` |
| `checkout.error` | phase = declined | `ErrorCheckout` |
| `checkout.completed` | → `/plus/success` | `CompleteCheckout` |

`checkout.updated` isn’t handled today and isn’t needed: the bill is computed
from our own prices, which come from the same Paddle preview.

## Check in the sandbox before building

1. The button label for our account: “Subscribe now” (production today) or “Pay $X”.
2. The one-page frame height with email locked and no VAT/discount links, at 286px and at 512px wide — set `frameInitialHeight` to it.
3. Whether Apple Pay shows the native sheet inside the inline iframe on Safari (needs domain verification on app.daily.dev; without it Paddle opens a popup).
4. That the dark-theme frame background matches `background-default` with padding off (no visible box).
5. Express variant (`variant: 'express'`, wallets first) on phones — a later test, not this one.
