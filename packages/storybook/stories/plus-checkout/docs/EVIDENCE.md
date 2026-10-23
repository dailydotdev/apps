# Evidence

Why the page looks the way it does. Internal analytics (funnel, experiment
results, feature usage) were reviewed with the team and are kept out of this
public repo; this page records the conclusions and the public research.

## What our own data said (conclusions only)

- **Leading with the API lost.** Plus pages that pitched API access first lost their experiments; the public API is free since September 2026, so Plus only raises its limits. The new page leads with ad-free and the Briefing.
- **The leak is the plan decision**, not the payment form: most visitors never pick a billing cycle.
- **Most buyers pick Annual** → Annual is preselected.
- **Order the list by usage.** Presidential Briefing, custom feeds and ad-free are what members use most and what buyers touched before paying; the list follows that order, and the first three lead.
- **Entry points differ a lot.** The ad “Remove” link sends the most people and converts worst; feed settings, the Briefing and account settings convert far better. The page swaps the lead features to match the entry point (`?ref=`), as Duolingo swaps its paywall’s first bullet per entry point.
- **Phones do buy, through two pages** (plan → payment), and the payment page converts well once reached. Phones and tablets therefore keep two steps; desktop is one page.
- **The onboarding funnel** sells a large share of Plus and never shows `/plus`; it is out of scope for this test.

## What other subscription pages do (17 products, sourced)

The full table with links is below this text. What it showed:

- Price is public before login on most; nearly every public CTA hits a login gate next. Price first, account at the CTA → our signed-out state keeps the plan and asks for sign-in in place of the frame.
- On phones, almost everyone separates the plan page from payment (Spotify, YouTube, NYT, Netflix, Figma; Stripe-hosted checkouts for Notion, Medium, Perplexity). Stripe Checkout’s mobile page puts a collapsible order summary above the payment form → our phone step 2.
- An explicit order summary next to payment is documented for Notion, Copilot and YouTube; Stripe Checkout’s split (summary left, form right) is the most copied desktop layout → the split screen.
- “Everything in Free, plus:” as the list lead-in (Discord, Medium, Perplexity, ChatGPT, Mobbin, Notion); a struck anchor price next to the real one (Spotify, Medium, Strava); the free-trial line under the price (Strava, YouTube, Spotify) — we have no trial, so the 30-day refund takes that slot (“Try Plus for 30 days”).
- A sticky bar that restates the offer while you scroll (Strava, Twitch) → our phone bar.
- Perplexity bolds two hero lines above five quiet ones → our three bold features.
- Mobbin’s published A/B: one primary paywall action and a quiet secondary beat two equal buttons — +29% pricing-page visits, **+19% paid**. → One white button; team and gift are text links.
- Confirmation screens are undocumented everywhere; email receipts are. → Our success page does one thing per purchase.

## Checkout research (public)

- Baymard: a well-optimized multi-step checkout does about as well as one page; what hurts is the number of fields and the effort ([one-page checkout](https://baymard.com/blog/one-page-checkout), [form fields](https://baymard.com/blog/checkout-flow-average-form-fields)).
- Stripe: “collapse the order summary but keep it easily expandable” on mobile ([one-step checkout](https://stripe.com/resources/more/one-step-checkout)); Apple Pay added +10% conversion in Stripe’s A/B ([Sessions 2024](https://stripe.com/sessions/2024/a-look-under-stripes-hood-using-data-to-demystify-payments)).
- Shopify and Paddle moved to one-page checkouts by default without publishing numbers.

## Paddle

See `5. Paddle` (docs/PADDLE.md). In short: the frame is Paddle’s and stays
Paddle’s; we change its dashboard styling and three settings, and build
everything on the left ourselves.

## Sources

- Paddle: [Brand inline checkout](https://developer.paddle.com/build/checkout/brand-customize-inline-checkout), [Build inline checkout](https://developer.paddle.com/build/checkout/build-branded-inline-checkout), [Paddle.Checkout.open](https://developer.paddle.com/paddlejs/methods/paddle-checkout-open), [updateCheckout](https://developer.paddle.com/paddlejs/methods/paddle-checkout-updatecheckout), [events](https://developer.paddle.com/paddlejs/events/overview), [one-page changelog](https://developer.paddle.com/changelog/2024/one-page-inline-checkout), [compliance changelog](https://developer.paddle.com/changelog/2024/inline-checkout-compliance-changes), [Apple Pay](https://developer.paddle.com/concepts/payment-methods/apple-pay), [emails customers receive](https://www.paddle.com/help/manage/your-customers/which-emails-will-customers-receive-on-paddle-billing).
- Production screenshot of app.daily.dev/plus (Oct 2026) in `public/plus-checkout/today.jpg`.
