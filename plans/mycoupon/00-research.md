# MyCoupon — Research Deep-Dive

Research phase for the daily.dev coupon/deals directory initiative. Planned with Fable 5; implementation is executed by Opus 5 agents per `04-execution-plan.md`.

## 1. Honey (PayPal Honey) — how the category leader works

### Product mechanics

- **Auto-apply at checkout.** Honey detects the checkout page on ~30k supported stores, pops a modal ("Apply Coupons"), cycles through its code database live in front of the user with a progress animation, then lands on one of two celebratory outcomes: "You saved $X!" or the trust-building "You already have the best price." The *test-codes-in-front-of-you* animation is the core magic moment — the user watches the product work.
- **Deal discovery in the toolbar popup.** Clicking the extension icon on any store shows available codes, cashback rate, and recent success stats ("worked 2 hours ago", "saved $12 on average").
- **Droplist (price watch).** Users save items; Honey tracks prices for 30–120 days and emails on drops. This converts a one-time coupon lookup into a retained relationship.
- **Amazon price comparison.** On Amazon product pages Honey badges whether another seller/variant is cheaper.
- **Rewards flywheel.** Merchants pay Honey affiliate commissions; Honey shares a cut with users as points (Honey Gold → PayPal Rewards; ~1,000 pts = $10 gift card). Users feel paid to shop; Honey monetizes every activation.

### Business model

- Revenue = affiliate commission on referred purchases. The extension attributes the sale to Honey by touching the checkout flow.
- Merchants partner with Honey to *control* which codes are surfaced (they'd rather show a mild sanctioned code than have users find deep codes elsewhere) — merchant-sanctioned supply is a feature, not a bug.

### Cautionary lessons (the 2024–25 controversy)

- Honey was widely criticized for **last-click affiliate hijacking** (replacing creators' affiliate attribution even when it offered no coupon) and for hiding better codes at merchants' request. In 2025 it stopped taking credit when it provides no coupon/reward.
- **Design consequence for us:** attribution must be honest (only claim it when we actually delivered value), and the UI must never pretend to search when results are pre-limited. Trust is the entire asset — daily.dev's community brand would be damaged much faster than a standalone utility's.

## 2. Adjacent models worth stealing from

- **Rakuten refer-a-friend:** symmetric matching bonus ($30–50 to both sides, referee must spend the same amount within 90 days), unlimited referrals. Symmetry is the key psychological unlock — sharing feels like a gift, not a shill.
- **GitHub Student Developer Pack:** 80+ curated offers (DigitalOcean credit, free domains, Azure credit) gated behind identity (verified student). Gating access behind *belonging to the community* makes the directory itself a reason to join — this maps perfectly to daily.dev (offers gated behind account / streak / reputation).
- **Join Secret / AppSumo / NachoNacho:** SaaS deal marketplaces prove devs/founders actively hunt for tool credits and lifetime deals; their weakness is zero community context ("is this tool actually good?"). daily.dev has the discussion layer they lack — a deal card with real dev comments is a differentiator no coupon site has.

## 2b. Wirecutter — the trust-first editorial commerce model

The other pole of the category (vs Honey's utility pole), and the closer cultural fit for daily.dev:

- **⚠️ CORRECTED — do not use the $75.5M figure as a Wirecutter number.** The source post (Glenn Gabe, Aug 2026, on NYT Q2 earnings) says affiliate revenue rose 7.1% to $75.5M and ties it to Wirecutter surging with the May core update. Checking [NYT's actual Q2 2026 10-Q](https://www.sec.gov/Archives/edgar/data/71691/000007169126000034/nyt-20260630.htm): **$75.5M is a blended "Affiliate, licensing and other" line** that includes commercial printing and **$6.7M of office rent**. **Wirecutter-attributable growth was $3.9M over six months**, and NYT itself attributes it to *promotion timing*, not search. Gabe's separate May 2026 core-update post never mentions Wirecutter. So the tweet is a plausible correlation asserted over a number that is not what it appears to be.
- **What survives the correction:** Wirecutter is still a real, durable affiliate business and still the right *cultural* model (independent picks, explained reasoning). What does **not** survive is using it as proof that organic search alone drives affiliate revenue. Counterweight from the same research: **every growing site in this category is direct- or affiliate-led, and RetailMeNot — the organic-search-led incumbent — fell 27% month over month.** Treat SEO as necessary infrastructure and a compounding asset, not as the growth strategy on its own. Our distribution advantage (existing audience, extension, community) is the actual engine.
- **Pick first, monetize second.** Wirecutter's editorial team picks products with total independence; the commerce team only then attaches affiliate links. They publish recommendations even when no affiliate program exists. Their head of revenue: trust is the *only* differentiator, and explaining the reasoning behind a pick is what converts a visitor into a loyal reader.
- **SEO compounding (with the caveat above):** deals and review content attached to a genuinely trusted domain holds up in core updates, while standalone coupon farms get crushed. The US publisher coupon category is now literally dead — CNN, LA Times and WSJ coupon subdomains return NXDOMAIN and Wired's returns 410. daily.dev's domain plus real community signals is a defensible position, but the evidence for "trusted domain wins" is the *survival* of editorial properties, not a proven revenue surge.
- **Direct merchant relationships** beat affiliate networks (better terms, better control) — a BD playbook note for us.
- **Attribution theft targets the trusted, too:** Glenn Gabe documented the Phia app overriding Wirecutter's referral codes with its own (cookie stuffing) — the same scheme Honey ran against creators. We must be on the honest side of attribution AND defend our own links against downstream hijackers.

**Design consequences adopted in the spec:** every offer carries a "Why it's worth it" reasoning blurb (Wirecutter's explain-the-pick rule, adapted to community voice); a "Community picks" tier exists independent of monetization (picks are never pay-to-play; promoted slots are separate and labeled); deal pages are indexable editorial objects, not thin coupon pages.

## 2c. PartnerStack — the network we actually run on

daily.dev's affiliate program is on **PartnerStack**, so its marketplace is not just inspiration, it is the shape of the supply we will be listing. Two things in its [program directory](https://market.partnerstack.com/) are worth copying and one is worth resisting.

- **The category browser sits between the hero and the grid.** The page opens on "Explore. Earn. Excel.", then a category browser, then the listings. Discovery is a two-step: pick a shelf, then read the shelf. We adopted this literally — `DealsCategoryGrid` renders above the results list on `/deals`.
- **The reward is the bolded line on every card.** A PartnerStack listing is logo, name, a two-sentence description, and then the money in bold: *"Earn $100 + up to 20% recurring commission."* No category tag, no secondary metadata competing with it. Our category tiles carry the same hierarchy: cover, name, then the best saving in the category in bold green, then the count.
- **Where we go further than they do: the cover is a photograph.** PartnerStack lists software, so a logo is the whole picture. Half our catalogue is objects, so a category that sells them is photographed — up to three products in a mosaic around a hero, ordered by claims, because a shelf is recognised by the things on it people actually bought. A category that sells subscriptions falls back to its brand marks on a panel tinted by the lead brand, at the size the photos would have been, so the row stays a row. We never fill the gap with stock photography of something we are not selling.
- **Alongside categories it offers Featured / Trending / Recently added** as collection entry points. We do not copy these as a second row: our tab strip already carries Expiring and Exclusive, and Trending is a badge on the rows.
- **What not to copy:** PartnerStack's own top-level marketing page has no marketplace filters at all — discovery there is guided by a nav dropdown. That works for 250 B2B programs sold to affiliates; it fails for a reader who arrived from search wanting one keyboard discount.

**Catalogue consequence:** the mix skews to what devs actually buy with their own money — hardware and gadgets lead, courses second, dev tools and SaaS present but no longer the bulk. `getDealCategorySummaries` sorts the browser by shelf weight rather than alphabetically, so the catalogue's centre of gravity is the first thing on screen.

## 3. Why daily.dev wins this category (thesis)

1. **Audience-offer fit is unfair.** Devs already trust daily.dev for tool discovery; a Cursor credit or JetBrains discount inside the feed is native content, not an ad.
2. **Community proof.** Every offer can carry upvotes, "worked ✓ 2h ago" verifications, and comments — Honey's success-rate stat plus Reddit's trust layer in one card.
3. **Existing growth rails.** Streaks, referral infra (`/settings/invite`), profiles, and the extension distribution are already built; coupons plug into them instead of starting cold.
4. **Two-sided flywheel:** more devs → better conversion data → better/exclusive offers negotiated → more reason to join → more devs. Exclusive "only on daily.dev" offers are the moat.

## 4. Sources

- [9to5Google — Honey affiliate update](https://9to5google.com/2025/03/13/honey-affiliate-update/)
- [Business Model Analyst — Honey business model](https://businessmodelanalyst.com/honey-business-model/)
- [Snazzy Solutions — PayPal Honey affiliate-link controversy](https://www.snazzy.solutions/blog/tech-scams/exposing-the-paypal-honey-scam-and-how-to-prevent-affiliate-theft)
- [PayPal — Complete guide to using PayPal Honey](https://www.paypal.com/us/money-hub/article/guide-to-using-paypal-honey)
- [Chrome Web Store — PayPal Honey](https://chromewebstore.google.com/detail/honey-automated-coupons-r/bmnlcjabgnpnenekpadlanbbkooimhnj)
- [FinanceBuzz — PayPal Honey review (Droplist, Rewards)](https://financebuzz.com/honey-app-review)
- [CNBC Select — Honey browser extension review](https://www.cnbc.com/select/honey-browser-extension-review/)
- [Rakuten blog — refer-a-friend mechanics](https://www.rakuten.com/blog/how-to-maximize-rakutens-refer-a-friend-program/)
- [Frequent Miler — Rakuten symmetric referral bonus](https://frequentmiler.com/rakuten-3k-30-referral-bonus-for-both-sides-is-back/)
- [GitHub Student Developer Pack](https://education.github.com/pack)
- [TechBullion — software deal sites 2026 (Join Secret, AppSumo, RocketHub, NachoNacho)](https://techbullion.com/the-10-best-software-deals-sites-to-save-big-in-2026/)
- [Glenn Gabe on X — Q2 2026: Wirecutter affiliate revenue $75.5M, +7.1%, tied to the May core update surge](https://x.com/glenngabe/status/2084988500340883550) (the post that prompted this section)
- [NYT Q2 2026 earnings coverage](https://www.nytimes.com/2026/08/05/business/media/new-york-times-earnings-q2.html)
- [Glenn Gabe on X — earlier NYT/Wirecutter affiliate revenue data](https://x.com/glenngabe/status/1920100859360199120)
- [The Drum — Wirecutter on commerce journalism and editorial independence](https://www.thedrum.com/opinion/cha)
- [Awin — the "Wirecutter effect"](https://www.awin.com/us/how-to-use-awin/wirecutter-affiliate-partner-success)
- [Keywee — how Wirecutter grows affiliate revenue](https://keywee.co/blog/four-ways-wirecutter-growing-affiliate-revenue/)
- [Adweek — Wirecutter × Google Shopping partnership](https://www.adweek.com/media/wirecutter-google-partner-procrastinating-gift/)
