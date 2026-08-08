# MyCoupon — Product Spec (Deals for Devs)

Working name: **daily.deals** (internal: MyCoupon directory). A curated directory of developer-relevant coupons, credits, affiliate offers, gift cards, and free-months deals, native to daily.dev.

## 1. The user, in their own words

The thoughts and needs the design must answer, per persona:

**The tool hunter** ("I was going to pay for this anyway")
- "I'm about to subscribe to Cursor / buy a keyboard — does daily.dev have a code before I pay full price?"
- Needs: search by product/brand, obvious "how much do I save", one-click copy code / open link, confidence it still works.
- Concern: "Is this stale? Nothing worse than a dead code at checkout." → every offer shows freshness + community verification.

**The browser** ("show me what's hot")
- Scrolls the directory like a feed. Needs: trending/new/expiring rails, categories (AI tools, cloud credits, hardware, courses, coffee/gift cards), personalization from their followed tags (uses TypeScript → JetBrains/Vercel deals surface first).
- Concern: "Is this just ads?" → community upvotes/comments and honest "Promoted" labeling separate editorial from paid.

**The maximizer** ("I want the exclusive stuff")
- Wants deals nobody else gets. Needs: locked exclusive tiers, progress mechanics ("invite 2 friends to unlock 6 months of Linear"), streak-gated drops.
- This persona powers the growth loop — design the locked state to be *visible and enviable*, never hidden.

**The sharer** ("my followers would love this")
- Finds a 40% Cursor deal and wants credit for spreading it. Needs: one-tap share with a personal link, visible impact ("12 devs saved via your share"), tweet-ready card.

## 2. Offer taxonomy (drives the card model)

| Type | Example | Card CTA | Value display |
|---|---|---|---|
| `PROMO_CODE` | 30% off Keychron keyboard | **Copy code** (reveal-on-click) | `-30%` |
| `CREDIT` | $20 Cursor credit, $200 DigitalOcean | **Claim credit** | `$20 free` |
| `AFFILIATE_LINK` | Amazon mechanical keyboard deal | **Get deal** (external) | `-25%` |
| `FREE_MONTHS` | 3 months Linear / Monday.com free | **Start free** | `3 mo free` |
| `GIFT_CARD` | $10 Amazon / Starbucks card | **Redeem** | `$10` |
| `EXCLUSIVE` | daily.dev-only Vercel Pro deal | **Unlock** (may be gated) | `Members only` |

Offer states (every card must handle all): `available`, `claimed` (by me), `expiring` (<72h countdown), `expired`, `locked` (needs invites/streak/Plus), `sold_out` (limited-quantity pool exhausted), `promoted` (paid placement, labeled).

Community layer on every offer: upvote count, comments count, "✓ Worked" verifications with relative time ("verified 2h ago"), success rate, claims count ("312 devs claimed").

## 3. Pages and surfaces

1. **`/deals` — the directory.** Hero with search + savings ticker ("devs saved $48,231 this month"). Filter chips (category, type, expiring, exclusive). Rails: *Ending soon*, *Trending*, *New this week*, *For you* (tag-personalized), then the all-offers grid reusing feed-card sizing. Right rail (desktop): "Your impact" widget (claimed count, total saved, referral progress).
2. **Offer detail (modal over directory, like post modal).** Full description, terms, expiry, code reveal, community comments, "similar deals", share bar. Deep-linkable `/deals/[slug]` for SEO + shares.
3. **My coupons (`/deals/claimed` tab).** Everything I claimed: active codes with copy, used, expired. This is the wallet — the reason to come back.
4. **Sidebar entry.** "Deals" item in the v2 rail with a `New` dot; occasional feed card teaser ("New: 3 months of Linear free") that deep-links in.
5. **Public share landing.** `/deals/[slug]?ref=<user>` — logged-out visitors see the offer + who shared it ("Tsahi shared this deal with you") + signup wall to claim → the acquisition front door.
6. **Extension sidecar** (side initiative, see `03-companion-sidecar.md`).

## 4. Key interactions

- **Claim flow (promo code):** click Claim → code reveals with a copy-confirm micro-celebration → offer moves to "My coupons" → follow-up prompt "Did it work? ✓/✗" feeds the verification stat. Reveal-on-claim (not printed openly) is what makes claims measurable and exclusives scarce.
- **Claim flow (external/affiliate):** click opens partner link with our attribution + marks claimed; honest labeling ("daily.dev may earn a commission — it funds free stuff for devs").
- **Gift cards / limited pools:** claim decrements a visible counter ("7 of 50 left") — scarcity drives the growth loop.
- **Empty/edge states:** search-no-results (suggest categories + "request a deal" CTA), all-claimed, logged-out directory (browse fine, claim → signup wall), expired-deep-link (show revival options: similar live deals).

## 5. Trust rules (non-negotiable, from Honey's mistakes)

- **Pick first, monetize second (Wirecutter rule).** Offers carry a "Why it's worth it" reasoning blurb in community voice; "Community picks" are chosen on merit and can exist with zero commission. Promoted slots are a separate, labeled inventory and never influence picks or stats.
- Never claim attribution for value we didn't deliver; affiliate disclosure is plain-language and always visible.
- Promoted placements always labeled; community stats (votes, verifications) are never editable by partners.
- Dead codes get auto-buried by ✗ reports, not manually defended.
