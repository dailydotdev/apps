# Coverage: production today vs this folder

Every surface and state of the Plus purchase, what production does today, and
where the new design covers it. **Covered** = a story shows it. **Unchanged** =
production keeps it as is (out of scope for this test). **Decision** = needs a
product answer (IMPLEMENTATION.md §9). Checked against the code on 16 Oct 2026.

## Entry into the checkout

| Surface | Today | New | Where |
|---|---|---|---|
| Upgrade links (ads Remove, Briefing, custom feeds, clickbait, folders, header, profile menu, sidebar, quests…) | All go to bare `/plus` | Same links + `?ref=`; the page leads with what was clicked | Covered · `3. Use cases › Entry point` |
| Signed-out visitor | Redirected to `/onboarding`, `/plus` lost | Plan stays; sign-in replaces the payment form; back to `/plus` after | Covered · `Signed out` |
| Browser extension | Extension modal links `/plus/payment?pid=` (works); the payment context builds a broken URL (`priceId=` instead of `pid=`) | Link to `/plus` — the same route works on every size | Covered by the page · fix noted in spec §8 |
| Marketing pop-up / phone drawer (`PlusMarketingModal`, `PlusMobileDrawer`) | Lead to `/plus` | Unchanged; they land on the new page | Unchanged |
| Onboarding funnel checkout (`FunnelOrganicCheckout`, a large share of buyers) | Renders PlusDesktop/PlusMobile/PlusIOS inline | Not part of this test | Unchanged |
| Gift picker (`GiftPlusModal`, from profile / comments / squads) | Pick a user → `/plus?gift=` | Unchanged; lands on the gift checkout | Unchanged · `Gift` |

## The checkout page

| State | Today | New | Where |
|---|---|---|---|
| Annual / Monthly | Radio list, $/month only | Two explicit buttons with yearly total; “3 months free” | Covered · `1. The design`, `Annual`, `Monthly` |
| Feature list | 9 rows, API first, ⓘ tooltips | 10 rows by usage, two columns read down; every row plays its scene on hover | Covered · `1. The design` (`featureList: plays`), `Static feature list (12 Oct)` |
| Prices loading | Grey radio blocks | Skeletons at real sizes; Paddle waits | Covered · `Prices loading` |
| Sale / discount (`plus_sale_campaign`, `?d_id=`) | Banner + discount in Paddle | Strip + struck price; discount prefilled | Covered · `Sale` |
| Team (`?type=team`) | Toggle + team size field | Seat stepper, per-member price, VAT field | Covered · `Team` |
| Gift (`?gift=`) | Gift radio + recipient chip | Recipient card, one-time price, no renewal | Covered · `Gift` |
| Already Plus | “You’re already a Plus member!” + Manage | Same, inside the payment half; gift link | Covered · `Already Plus` |
| Already Plus by gift | Manage hidden | Manage hidden, “Gifted by …” | Covered · `Already Plus, as a gift` |
| Already Plus via iOS, on web | Manage → Paddle portal (can’t manage an Apple subscription) | Not designed | **Decision** · spec §9 |
| Region unavailable | Message instead of the frame; no prices | Message in the payment half; prices hidden, features stay | Covered · `Region unavailable` |
| Renewal reminder row | — | Only where Paddle sends it (EU, UK, 11 US states, annual) | Covered · `Region` cases · US state is a **Decision** |
| Phones and tablets | Two pages: plan → `/plus/payment` (drops team, seats and, for Plus members, the gift) | Two steps on one route: plan + sticky “Continue · ” → payment with a collapsed summary and “Change”; Back works; nothing is dropped; iPhone home-indicator padding | Covered · `Phone · step 2 (payment)`, `2. Breakpoints`, `6. Before & after` |
| iOS app | `PlusIOS`, StoreKit | Same plan half, “Subscribe” opens Apple’s sheet | Covered · `iOS app` · out of the first test |

## Payment (Paddle frame)

| State | Today | New | Where |
|---|---|---|---|
| Loading | Grey `min-h` block | Skeleton at the frame’s size | Covered · `Paddle loading` |
| Card / PayPal / Apple Pay / Google Pay | Paddle tiles | Same, restyled from the dashboard | Covered · `PayPal`, `Safari`, `5. Paddle` |
| ZIP code (US, CA…) | Paddle asks | Same | Covered · `US visitor (ZIP code)` |
| VAT number / discount code | Always shown | VAT for team only; discount only during a sale | Covered · `Team`, `5. Paddle` |
| Save my card | Shown | Hidden in the design (account-wide setting) | **Decision** · spec §9 |
| 3-D Secure | Paddle handles | Same; our side stays locked | Covered · `Bank verification` |
| Processing | Paddle spinner | Same + cycle/seats/links locked | Covered · `Processing` |
| Declined | Paddle message | Same; plan half untouched | Covered · `Card declined` |
| Payment form blocked (ad blocker) | Empty box | Explanation + Try again | Covered · `Payment form blocked` |

## After payment

| Surface | Today | New | Where |
|---|---|---|---|
| Thank-you page | One generic “Payment successful” for all | Personal → set the Briefing; team → invite members; gift → nothing to do; iOS → Apple receipt | Covered · `9. After payment` (today’s page too) |
| Gift recipient | “Surprise! 🎁” pop-up next visit | Unchanged | Unchanged · `docs/EMAILS.md` |
| Emails | Paddle’s (receipt, confirmation, reminders, failed payment, cancel, refund) | Same; our copy now names only emails that exist | Covered · `9. After payment › Emails` |
| daily.dev’s own emails | Not in this repo | — | **Verify** in the API |

## Cross-cutting

| Area | Status |
|---|---|
| Analytics | Every existing event kept; `ref` added (spec §7). Feature hover in the list should log `ClickPlusFeature` like #6868 (spec §4). |
| A/B | Flag `plus_checkout_v2`, control = today, plan in `6. Before & after`. |
| Paddle dashboard styling | Account-wide; change before the test (`5. Paddle`). |
| Accessibility | One-tab-stop radios with arrows, list rows focusable, focus visible, reduced motion = still scenes, phone bar leaves the tab order when hidden. |
| Theme | Dark only, as today (`PlusLayout` forces dark). |
| Locale / currency | Prices are formatted server-side (`pricingPreview`), copy is English like today. |
| SEO | `/plus` keeps its SEO; `/plus/success` stays `noindex`. |
