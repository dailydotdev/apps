# MyCoupon — Play Points review and fine-tuning

A review pass against Google Play Points and the team's Cores idea. **Scope discipline: this doc adds no new pages, flows or surfaces.** Everything here either sharpens something we already built or is explicitly deferred.

## The team's idea, and why it fits

> "Apparently with my Google Play store I can buy boost on TikTok. We can probably do something similar with our cores and advertisers. Imagine buying one month of Cursor with x amount of cores. It's a new ad placement."

This is right, and it lands on a gap we already have. Our `DealLock` supports exactly one unlock path: invite N friends. That is a single-purpose field pretending to be a model. Cores are already in the product (`user.balance.amount`), and the exclusive tier is already the place where "you must do something to get this" lives.

So the change is small: **generalise the lock from invites into unlock methods**, one of which is Cores. No new page, no new flow, one new CTA state on a card we already render.

What it unlocks commercially, in one line each:
- **A Cores sink.** Cores today are mostly earned and given as awards. A month of Cursor for Cores is the first thing worth *spending* them on that has real outside value.
- **The ad placement.** The advertiser funds the offer and pays for placement; the user pays in Cores. The advertiser gets qualified intent, the user gets a real product, and we never have to charge the user money.
- **A cleaner exclusivity ladder.** Invite-to-unlock is viral but slow. Cores-to-unlock is instant for engaged users. Offering both on the same deal lets people choose time or currency.

## What Play Points does that we should copy, sharply

1. **State the resolution rule, not just the restriction.** Play Points says "The highest earn rate will be applied" *before* you ask. We have a `DoesNotStack` caveat that says what fails but never what wins. One sentence per caveat that resolves the ambiguity is strictly better than a warning.
2. **Separate the deadline to start from the window to use.** "Start by Aug 13" plus "for 14 days" are two different clocks, shown as two different things. We collapse both into `expiresAt`, and our `CreditExpires` caveat carries the second clock as prose. Make the claim-by deadline explicit where it differs from the offer end.
3. **Show the cost next to the thing, always.** Play Points never makes you tap to find the price. If a deal costs Cores, the cost belongs on the row beside the value, in the same visual unit, not revealed on the detail page.

## What Play Points does that we should NOT copy now

- **The tier ladder (Silver → Gold, earn rate per tier).** We already have streaks, reputation and Plus. Adding a fourth progression system would be a second economy competing with the first three. If exclusivity needs a gate beyond invites and Cores, reuse streak or Plus rather than inventing tiers.
- **The earn side (boost multipliers, sponsored earn rates).** This is a genuinely good ad placement and genuinely out of scope here. It belongs to whoever owns Cores economics, not to a deals directory. Noted and parked.
- **Three top-level tabs (Earn / Use / Perks).** Our directory has one job. A "costs Cores" filter chip expresses the same split at a fraction of the cost.

## What we are changing (the whole list)

1. `DealLock` becomes a set of unlock methods: invites (as today) and Cores. A deal may offer either or both. The locked CTA reflects what is actually available, and shows the Cores cost inline.
2. Caveats gain a resolution sentence where one exists, so `DoesNotStack` explains which discount wins.
3. `claimByAt` becomes explicit where the deadline to claim differs from the offer's own end date.

That is the complete change set. Everything else in this document is either a reason or a deliberate no.
