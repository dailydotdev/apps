# MyCoupon — World-Class Growth Benchmark

How the companies that actually make money in this category grow, and an honest scorecard of where daily.dev Deals stands. Companion to `05-deep-research-affiliate.md` (business mechanics) and `06-seo-aeo-agent-discovery.md` (search/AI spec).

## 1. The four growth archetypes

| Archetype | Exemplar | Engine | Revenue proof | Transferable to us? |
|---|---|---|---|---|
| **Editorial authority** | Wirecutter (NYT) | Independent picks with explained reasoning, compounding on a trusted domain | Real but smaller than the viral figure suggests: **$3.9M Wirecutter growth over six months**, which NYT attributes to promotion timing (the widely-quoted $75.5M is a blended line including commercial printing and office rent). See the correction in `00-research.md` | Yes culturally, but do not sell it as an SEO revenue proof |
| **Community supply** | Slickdeals, Pepper (HotUKDeals/Dealabs) | Members submit deals, community votes them to the front page; merchants pay for *deal review*, never placement | Category leader on near-zero content cost | Yes, this is our unfair advantage |
| **Browser utility** | Honey, Capital One Shopping, Karma, Coupert | Extension intercepts the purchase moment | Honey sold to PayPal for $4B | Partly, but now legally constrained |
| **Curated marketplace** | AppSumo, Join Secret, NachoNacho | Negotiated exclusive SaaS deals, often lifetime/credit-based | Sustained SaaS deal demand from devs and founders | Yes, for the exclusive tier |

**A caution before the strategic read:** the tidy story that "organic search is the revenue engine" did not survive fact-checking (see `00-research.md` section 2b). RetailMeNot, the organic-led incumbent, fell 27% month over month, while every *growing* site in the category is direct- or affiliate-led. SEO is necessary infrastructure and a compounding asset, but our real engine is distribution we already own: the audience, the extension, and the community.

**The strategic read:** Wirecutter proves the cultural model, Slickdeals proves the supply model, Honey proves the moment-of-purchase value but is now a cautionary tale, and AppSumo/Join Secret prove devs will hunt for tool credits. We are the only player that can run *all four* at once, because we already have the audience, the community, the extension, and the vendor relationships.

## 2. The growth techniques that actually work, ranked by evidence

1. **Organic search on genuinely independent picks.** Wirecutter publishes recommendations regardless of whether an affiliate relationship exists; picks come first, monetization second. Google's core updates have repeatedly rewarded this and punished thin coupon content. This is the single highest-leverage lever and it is a *content-governance* decision, not an engineering one.
2. **Community-submitted supply with bidirectional voting.** Pepper's "temperature" model lets a deal cool as well as heat. Upvote-only ranking cannot kill a stale deal, which is why our current model (upvotes only) will rot. Slickdeals also refuses retailer-posted deals outright.
3. **Deal health scoring, not a verified boolean.** SimplyCodes publishes the model worth copying: a score starts at 100 on verification, decays with time, and is weighted by community consensus and actual outcome data, producing 81.5% success across 33k merchants. Freshness is also a genuine AI-citation asset ("verified 2h ago" is a quotable statistic).
4. **Symmetric referral.** Rakuten's matching bonus (both sides get the same reward, referee must hit a spend threshold within 90 days) makes sharing feel like a gift rather than a shill.
5. **Identity-gated perk packs.** GitHub Student Pack gates 80+ offers behind verified student status; belonging to the community *is* the product. Our equivalent gates are account age, streak, and Plus.
6. **Evidence density for answer engines.** The one peer-reviewed study (GEO, KDD 2024, 10k queries) found citations, direct quotations, and statistics raise generative-engine visibility up to 40%. Our comments, claim counts, and verification timestamps are exactly this, currently rendered as UI chrome rather than quotable text.
7. **Refresh over publish.** 75% of AI-cited pages were updated within a year, and over a quarter of "fresh" cited pages were first published 2+ years ago. A deal page that updates its verification stamp continuously is structurally advantaged.

## 3. What the leaders do that we have not designed at all

- **Price-drop watchlists** (Honey Droplist, CamelCamelCamel, Keepa). The retention mechanic that converts a one-time coupon lookup into a returning relationship. We dropped it after research and never specced it.
- **Deal alerts and digests.** Slickdeals' alert system is its retention backbone. We have no notification or email design.
- **Cashback wallets with payout thresholds.** Rakuten/Honey share commission back as points. We have no user-facing economics at all.
- **Credit-expiry tracking.** Startup credits auto-bill at 12 to 24 months and nobody serves this. For a developer audience sitting on AWS/DigitalOcean/Vercel credits, a "your $200 credit expires in 21 days" alert is a genuinely novel, high-trust wedge.
- **Merchant-side operations.** Feeds, per-merchant terms as data (cookie window, hold days, channel allowlist), commission reconciliation, missing-credit claims.

## 4. Honest scorecard

| Dimension | World-class bar | Where we are | Gap |
|---|---|---|---|
| Editorial independence | Picks published regardless of commission | `isCommunityPick` + `whyPick` shipped | Small: needs a no-commission flag so we can *prove* it |
| Community supply | Members submit, community ranks | No submission flow at all; "Request a deal" is a dead button | **Large** |
| Deal quality | Decaying health score + outcomes | `worksRate` exists in the model and is **rendered nowhere**; verification is a pre-formatted string, not a timestamp | **Large** |
| Voting | Bidirectional | Upvote only, and the button has no accessible name | Medium |
| Organic search | Indexable, SSR, faceted URLs, JSON-LD | `noindex,nofollow`, client-only, filters in component state, no JSON-LD | **Critical** |
| AI/agent discovery | Raw-HTML content, evidence density, feed | Nothing renders for a non-JS crawler | **Critical** |
| Referral loop | Symmetric, activation-gated | Designed and built in Storybook, **not wired into the product** | Medium |
| Retention | Watchlists, alerts, digests | None | **Large** |
| Compliance | Click-to-act, three-place disclosure, no Amazon in extension | Disclosure present; sidecar is click-initiated; **Amazon store still in the sidecar mock** | Medium |
| Economics | Ledger with reversals, pending/confirmed states | No commission model at all | Large, backend-dependent |

## 5. Sequenced recommendation

**Now (mock-safe, this branch):** make the pages indexable and server-rendered with real category URLs; render the evidence (success rate, verification timestamp, claim counts, quoted comments) as text; add deal health decay and bidirectional voting to the model; wire the referral loop into the product; drop Amazon from the sidecar.

**Next (needs product decisions):** community deal submission with moderation, watchlists and expiry alerts, the credit-expiry wedge, notification and digest design.

**Later (backend):** affiliate network integration with a SubID schema decided up front, commission ledger with reversals, merchant terms as data, machine-readable offers feed for agents.
