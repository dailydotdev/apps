# MyCoupon — Search, Answer-Engine and Agent Discovery Spec

Companion to `00-research.md` (why this category), `01-product-spec.md` (what we build) and `02-growth-loops.md` (how it spreads). This document covers the acquisition channel that is supposed to fund all of it.

Research date: **7 August 2026.** Every claim is sourced inline. Anything that could not be verified from a primary document is marked ⚠️.

---

## 0. Executive summary

### 0.1 The premise in `00-research.md` does not survive verification

`00-research.md` opens the Wirecutter section with: *"affiliate revenue (Wirecutter) rose 7.1% to $75.5M in a single quarter, and he tied it directly to search visibility."* We pulled NYT's actual [Form 10-Q for Q2 2026](https://www.sec.gov/Archives/edgar/data/71691/000007169126000034/nyt-20260630.htm) (filed 5 Aug 2026) from SEC EDGAR. **The claim is wrong on three independent counts:**

1. **$75.5M is not Wirecutter affiliate revenue.** The line item is *"Affiliate, licensing and other"* — $75,452K, up 7.1% from $70,479K. NYT defines it as licensing, Wirecutter affiliate referrals, commercial printing, **headquarters floor leasing**, live events and retail commerce. Building rental alone was **$6.7M** of it. The only Wirecutter-specific figure NYT disclosed is **$3.9M of growth across six months**.
2. **NYT attributes the increase to promotion timing, not search.** Its stated cause is higher Wirecutter referral revenues *"which benefited from a shift in the timing of a marketing promotion by one of our partners."*
3. **The Glenn Gabe attribution is unsupported.** His [May 2026 core update analysis](https://www.gsqi.com/marketing-blog/core-roars-back-google-may-2026-core-update-analysis/) does not mention Wirecutter, affiliate revenue, coupons or deals anywhere. ⚠️ Treat the quoted tweet as unverified until someone produces it.

**This does not kill the initiative — it corrects the evidence for it.** The genuinely strong evidence is the *other* half of the story, and it is much better documented: between September 2024 and January 2025 Google systematically dismantled the publisher coupon-directory category, and in August 2026 those sections are still dead (§A1). The opportunity is not "affiliate directories are printing money"; it is **"the incumbent coupon layer was removed from search and nobody compliant replaced it."** Fix the claim in `00-research.md` before it reaches a deck.

### 0.2 And search alone is not the business

The competitive data (§A7) makes an uncomfortable point that belongs at the top rather than buried:

| Site | Monthly visits (Jun 2026) | MoM | Primary channel |
|---|---|---|---|
| Slickdeals | 59.3M | **+3.3%** | Direct 75.8% |
| Capital One Shopping | 61.8M | +0.7% | Affiliate 59.4% |
| **RetailMeNot** | 9.7M | **−27.3%** | **Organic 58%** |

**Every growing site in the category is direct- or affiliate-led. The one declining hardest is the one that was search-led** — RetailMeNot's organic fell 41% month over month, and Ziff Davis deferred 2026 guidance and pivoted it to self-funded cash back.

The right framing is therefore **not** Wirecutter-style "organic visibility is the revenue engine." It is: **daily.dev already has the direct channel — feed, extension, streaks, sidebar — and the growth loops in `02-growth-loops.md` are the engine. Search is the acquisition layer bolted onto an existing audience.** That is both more accurate and more defensible, and it means this document's job is to stop us leaking a channel we can have cheaply, not to promise that channel will carry the business.

One genuinely encouraging data point on the other side: `<brand> promo code` is **transactional and short-tail-branded**, and AI Overviews trigger on only 3.2–4% of e-commerce queries with under 3% of AIOs targeting transactional keywords. **Our highest-value pages sit in the best-insulated query class in search** (§A7).

### 0.3 The eight decisions

1. **Turn indexing on, but gate it.** `/deals` and `/deals/[slug]` ship `noindex, nofollow`, which makes Growth Loop 5 a no-op today.
2. **Server-render the deal.** `[slug].tsx` resolves the slug client-side and ships an empty document with a generic static title. **No AI crawler renders JavaScript** — to ChatGPT, Claude and Perplexity our deal pages are blank.
3. **Give categories and brands real URLs.** Filters are `useState`, and `DealCard` renders no `<a href>` at all — there is no crawl path to any deal page.
4. **Do not chase a coupon rich result. It does not exist for us.** Google's clippable coupons come from a Merchant Center promotions feed, and affiliates are explicitly barred from Shopping feeds except as a CSS.
5. **Source deals directly from merchants.** Google's spam policy names coupons on *both* sides of the site reputation abuse line; direct merchant sourcing is the named exemption.
6. **Freshness is our one genuine GEO asset, and it is currently fake.** `lastVerifiedAgo` is a hardcoded string frozen into an ISR cache.
7. **Ship the agent surface on rails that already exist.** The repo already has `/api/md/*` mirrors, `Accept: text/markdown` negotiation, `llms.txt` headers and an AI-permissive `robots.txt`. Deals are missing from all four.
8. **The agentic-commerce opportunity is real but inverted from what we assumed.** We cannot be a *seller*. But UCP — Google + Shopify's protocol, GA since January 2026 — has **permissionless agent-side onboarding** and a **GA discount-redemption extension**, while **no protocol anywhere standardises how an agent discovers which codes exist**. That gap is exactly the shape of this product (§A5, §F4).

---

# A. Findings

## A1. Google and coupon content: what actually happened

### The policy names coupons on both sides of the line

Google's [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) (doc updated 2026-05-15) define site reputation abuse as *"a tactic where third-party content is published on a host site mainly because of that host's already-established ranking signals."* One of the four canonical examples is:

> "A news site hosting coupons provided by a third-party white-label service where the main reason for publishing the coupons on the news site is to capitalize on the news site's reputation"

And the exemption, in the same policy:

> "Coupons that are sourced directly from merchants and other businesses that serve consumers"

**The same content type is a named violation or a named exemption depending on sourcing.** This converts the BD preference in `00-research.md` into a policy requirement.

### Timeline

| Date | Event | Source |
|---|---|---|
| 5 Mar 2024 | Policy announced with the March 2024 core update | [Search Central](https://developers.google.com/search/blog/2024/03/core-update-spam-policies) |
| 6–7 May 2024 | First manual actions. CNN, USA Today, Fortune, LA Times coupon directories stop ranking | [Search Engine Land](https://searchengineland.com/google-begins-enforcement-of-site-reputation-abuse-policy-with-portions-of-sites-being-delisted-440294) |
| 26 Sep 2024 | Docs define *"close oversight or involvement"* | [SEJ](https://www.searchenginejournal.com/google-updates-their-spam-policy-documentation/528201/) |
| **19 Nov 2024** | **The loophole closes.** Policy applies *"regardless of whether there is first-party involvement or oversight"* | [Search Central](https://developers.google.com/search/blog/2024/11/site-reputation-abuse) |
| 21–22 Nov 2024 | Second wave, days before Black Friday | [Press Gazette](https://pressgazette.co.uk/platforms/google-dealt-blow-to-publisher-shopping-revenue-on-eve-of-black-friday-site-reputation-abuse-update/) |
| 22 Jan – 28 Jan 2025 | Enforcement reaches Italy, Spain, France, Germany. *"All the whitelabel projects are now gone"* | [Search Engine Land](https://searchengineland.com/google-manual-actions-site-reputation-abuse-europe-451046) |
| 13 Nov 2025 | **European Commission opens DMA proceedings** over the policy | [EC](https://digital-markets-act.ec.europa.eu/commission-opens-investigation-potential-digital-markets-act-breach-google-demoting-media-publishers-2025-11-13_en) |
| Aug 2026 | **Enforcement is still manual only** — the algorithmic version never shipped | [SER](https://www.seroundtable.com/google-site-reputation-abuse-policy-not-algorithmic-yet-37443.html) ⚠️ 403s to automated fetch |

The November 2024 change is the decisive one. Google explicitly enumerated *"white label services, licensing agreements, partial ownership agreements"* as arrangements that do **not** exempt you, killing the "but we have editorial oversight" defence.

### The casualties, and their status today

From [Glenn Gabe's "A Nightmare on Affiliate Street"](https://www.gsqi.com/marketing-blog/a-nightmare-on-affiliate-street/) (Ahrefs visibility data): **Forbes Advisor** (25 Sep 2024, entire folders deindexed), **CNN Underscored** (27 Sep), **WSJ Buy Side** (27 Sep), **Fortune Recommends** (11 Oct, ~67% visibility loss), **Time Stamped**, **AP News Buyline**, **MarketWatch Guides**. Plus **USA Today Reviewed**, **US News 360 Reviews**, **Newsweek Vault**, **The Sun Shopping**, **LA Times**, **Men's Journal**.

**Live HTTP status, checked 7 Aug 2026:**

| Property | Status |
|---|---|
| `coupons.cnn.com`, `coupons.latimes.com`, `coupons.wsj.com`, `coupons.fortune.com`, `coupons.si.com`, `coupons.newsweek.com`, `coupons.thesun.co.uk` | **NXDOMAIN** |
| `wired.com/coupons/` | **HTTP 410 Gone** |
| `nypost.com/coupons/`, `pcworld.com/coupons`, `usatoday.com/coupons/`, `cnn.com/coupons`, `newsweek.com/vault` | **404** |
| `discountcode.dailymail.com` | **200, fully crawlable — survived** |

**The US publisher coupon-directory category is extinct.** Wired's choice of 410 rather than noindex matches [Gabe's Feb 2025 case study](https://www.gsqi.com/marketing-blog/how-to-block-content-site-reputation-abuse/): only **noindex** and **removal (404/410)** resolve these manual actions; **robots.txt disallow and rel=canonical do not**.

The white-label operators were **Savings United** (Wired, PCWorld, NY Post) and **Global Savings Group**, typically on 50:50 revenue shares with multi-million minimum guarantees. ⚠️ **Skimlinks was never named in any enforcement I could find** — it is a link-monetisation layer, not a white-label operator. Do not group it with the others.

### The one that survived, and why

`discountcode.dailymail.com` is still fully crawlable. Its own disclosure pages describe: direct brand negotiation over 10+ years; not relying only on offers that affiliate networks send; dedicated **code testing** with terms displayed; *"dedicated editors in the Daily Mail Shopping team"*; top 100 pages updated daily; non-working codes removed immediately and the retailer alerted; site-wide affiliate disclosure plus public *How We Source Content* and *Meet the Team* pages; and per-code `Verified: true/false` flags in the page data.

**That is the compliant posture, and it is almost exactly the product described in `01-product-spec.md`.** Our advantage is that daily.dev is not a host site lending its reputation to someone else's content — deals would be first-party content on our own domain, which is a materially safer position than any of the penalised publishers occupied.

### Thin affiliation

Google **merged** the old "Thin content" and "Affiliate programs" pages into one policy now called **"Thin affiliation."** The violation is descriptions and reviews *"copied directly from the original merchant"* with no added value.

The safe harbour is stated affirmatively and is directly usable as a product spec — Google names **additional price information**, original reviews, **rigorous testing and ratings**, **navigation of products and categories**, and **product comparisons**. Price data and category navigation being explicitly named is more defensible ground for a coupon directory than manufacturing review prose.

**Watch scaled content abuse harder than thin affiliation.** Templated per-merchant pages with substituted names are the literal Lowest-quality example in the [Quality Rater Guidelines](https://static.googleusercontent.com/media/guidelines.raterhub.com/en//searchqualityevaluatorguidelines.pdf) (live version **11 Sep 2025**, 182pp): a page auto-generated from Amazon by substituting product names into a template, rated Lowest **even though it discloses its affiliate links**.

> **Affiliate disclosure does not rescue a thin page. Google says so by example.**

⚠️ **Fabrication warning:** several sites currently rank for "quality rater guidelines 2026" describing a June 2026 update adding a "Synthetic Authority" flag and "Verifiable Real World Experience" section. **No such revision exists.** Ignore any strategy built on it.

### The reviews system stopped being an event

The last announced reviews update was **8 Nov 2023**; Google said it would stop giving periodic notifications, and there have been **zero since** (verified against the [Search Status Dashboard](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history)). Review quality now expresses through **core updates**, which Gabe characterises as operating at **site level** — one weak templated subsection can drag an entire domain.

The evidence requirement (doc moved to [`/specialty/ecommerce/write-high-quality-reviews`](https://developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews); the old path 404s) asks you to *"Provide evidence such as visuals, audio, or other links of your own experience"*, share **quantitative measurements**, cover comparable alternatives, and give first-hand supporting evidence for any "best" claim. **Scope explicitly includes ranked lists and head-to-head comparisons**, so a "best deals on X" roundup is inside its remit.

### Coupon content is mostly not YMYL

QRG §2.3's own non-YMYL example is **shopping**. Ordinary retail and dev-tool coupons are not YMYL. **But deals content crosses into YMYL Financial Security the moment it touches credit cards, BNPL, loans, insurance or crypto.** Segment accordingly.

The asymmetry that matters: **not being YMYL lowers the accuracy bar, not the added-value bar.** The bulldog-wipes page was rated Lowest on purely non-YMYL grounds.

### What genuine "Experience" looks like for a coupon page

You cannot photograph yourself using a discount code. But you can produce first-hand evidence most competitors don't: **code verification with timestamps**, success/failure rates, terms surfaced explicitly, price data and comparisons, and **named editors with a real About page**. Every one of these already exists in `01-product-spec.md`.

## A2. Structured data, 2026

### The Search Gallery shrank hard

Now **25 features**, down from ~35 in 2023. Relevant removals:

| Feature | Status | Date | Source |
|---|---|---|---|
| **FAQPage** | **Fully gone**, incl. the gov/health carve-out | Rich results stopped **7 May 2026**; docs removed **15 June 2026** | [changelog](https://developers.google.com/search/updates), [SEJ](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/) |
| HowTo | Gone | Aug 2023 | [Search Central](https://developers.google.com/search/blog/2023/08/howto-faq-changes) |
| Sitelinks searchbox | Gone | Nov 2024 | [Search Central](https://developers.google.com/search/blog/2024/10/sitelinks-search-box) |
| Book actions, Course info, Claim review, Estimated salary, Learning video, Special announcement, Vehicle listing | Gone (7 types) | Sept 2025 | [Search Central](https://developers.google.com/search/blog/2025/06/simplifying-search-results) |
| Practice problems | Gone | Jan 2026 | [changelog](https://developers.google.com/search/updates) |

**Consequence beyond deals:** `getFaqJsonLd` in `packages/webapp/components/PostSEOSchema.tsx` targets a rich result that no longer exists. Harmless to leave, but do not replicate it for deals. Log as a separate cleanup.

### Merchant listings are categorically closed to us

> "Only pages where a shopper can purchase a product are eligible for merchant listing experiences, not pages with links to other sites that sell the product." — [merchant listing doc](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)

### Product snippets require single-product focus

> "Currently, product rich results only support pages that focus on a single product." — [product snippet doc](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)

A `/deals/[slug]` page qualifies structurally. But our items are mostly SaaS, and the specific supported type is [`SoftwareApplication`](https://developers.google.com/search/docs/appearance/structured-data/software-app) (required: `name`, `offers.price`, and one of `aggregateRating`/`review`).

### There is no coupon rich result reachable from markup

Google's clippable coupons come from the [Merchant Center promotions data source](https://support.google.com/merchants/answer/2906014). On schema.org, `discountCode` is a property of [`Order`](https://schema.org/Order) — not `Offer` — used on <1K domains, and Google does not consume it. The [`DiscountOffer` proposal](https://github.com/schemaorg/schemaorg/issues/1742) never landed in core.

The only discount representation Google reads is inside `Offer.priceSpecification`:

> "The current, active price automatically becomes a sale price when you provide a second price with the original, strikethrough price"

**New, 7 July 2026:** merchant listings now support **sale duration** via `validFrom` + `validThrough`/`priceValidUntil` ([Search Engine Land](https://searchengineland.com/google-merchant-listings-support-sale-duration-and-product-category-481730)) — the most directly relevant new offer guidance, and worth adopting even where the rich result is out of reach.

### ItemList carousels do not help a US audience

The [carousels beta](https://developers.google.com/search/docs/appearance/structured-data/carousels-beta) is the only sanctioned way to put `Product` inside an `ItemList`, and it is *"only available in European Economic Area (EEA) countries, Turkey, and South Africa."* Emit `ItemList` anyway — for comprehension and AI extraction, not for a rich result.

### Risk

From the [structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies):

> "Don't mark up content that is not visible to readers of the page."
> "Don't mark up irrelevant or misleading content, such as fake reviews or content unrelated to the focus of a page."
> "Provide up-to-date information. We won't show a rich result for time-sensitive content that is no longer relevant."

Enforcement is the **"Structured data issue"** manual action. And from the [review snippet doc](https://developers.google.com/search/docs/appearance/structured-data/review-snippet): *"Don't aggregate reviews or ratings from other websites"*, plus a July 2026 addition prohibiting undisclosed reviews incentivised by *"money, discounts, vouchers, or free products."*

> **Rule: `worksRate` measures whether a code redeems, not product quality. Never emit it as `AggregateRating`. That is the textbook misleading-content case.**

## A3. AEO / GEO — what the evidence supports

### Google says schema is not the lever

From [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) (verified live, updated 2025-12-10):

> "You don't need to create new machine readable files, AI text files, or markup to appear in these features."
> "There's also no special schema.org structured data that you need to add."

### The GEO paper's measured results

[Aggarwal et al., KDD 2024](https://arxiv.org/abs/2311.09735), 10K queries across 25 domains:

| Method | Position-adjusted word count | Subjective impression |
|---|---|---|
| **Quotation addition** | **+42.7%** | +28.1% |
| **Statistics addition** | +32.8% | +22.8% |
| Fluency optimisation | +28.7% | +13.5% |
| **Cite sources** | +28.2% | +13.5% |
| Technical terms | +18.5% | +11.1% |
| Authoritative language | +12.2% | +18.7% |
| **Keyword stuffing** | **−8.7%** | +2.6% |

Two under-quoted findings:
- **Cite Sources gave +115.1% visibility to the 5th-ranked site while the top-ranked site lost 30.3%.** GEO is a levelling mechanism that helps the challenger most. That is us.
- **Keyword stuffing is the only technique measured as actively harmful.** Classic coupon-SEO does not transfer.

### The caveats, which are strong

A [July 2026 critical survey of 45 GEO studies](https://arxiv.org/html/2607.14035v1) calls those gains *"valid but narrowly scoped"* — the source is already inside a five-document context, so the study measures conditional effects on already-retrieved content, not discovery, and establishes nothing about clicks. [C-SEO Bench](https://arxiv.org/abs/2506.11097) found only 3 of 54 method–domain combinations significantly positive, none in question answering, describing the dynamic as *"congested and zero-sum."*

Also from the survey:
- **53% of domains cited by Google AI Overviews do not appear in organic top 10; 27% are absent from the top 100.**
- **Position in the retrieved context beats content rewriting** — the primary determinant of first citation across 252,000 trials.
- **Results are unstable** — cross-run Jaccard 0.34–0.42, 9–28% of decisions flip on temperature-zero repeats. Any vendor study without ~8 repetitions is measuring noise.
- **Schema markup: no good evidence either way** for LLM citation.

### Structure that extracts well

From [GEO-SFE](https://arxiv.org/html/2603.29979v1) (⚠️ preprint, automated judges): chunks of **150–300 words** (over 300 showed **31% attention degradation**); **tables and lists had 43% higher extraction accuracy than equivalent prose**; sentence-initial placement carries **2.0× weight**.

### AI crawler policy

| Crawler | Function | Blocking removes you from answers? | Cost |
|---|---|---|---|
| **Googlebot** | Search index **and the sole source for AI Overviews / AI Mode** | Yes | Catastrophic |
| **Google-Extended** | Gemini app training + Vertex grounding only | **No — does not affect AI Overviews** | Near zero |
| **OAI-SearchBot** | ChatGPT search index | **Yes** | High |
| **GPTBot** | Training only | No | Low |
| **ChatGPT-User / Claude-User / Perplexity-User** | Live user-initiated fetch | Blocks on-demand fetches | Moderate |
| **ClaudeBot** | Training | No | Low |
| **Claude-SearchBot** | Search indexing | Yes | High |
| **PerplexityBot** | **Search index only** — *"not used to crawl content for AI foundation models"* | **Yes** | High |
| **Bingbot** | Bing index + Copilot grounding | Yes | High |
| **Applebot-Extended** | Apple Intelligence training only | No | Near zero |

Sources: [OpenAI bots](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518), [Perplexity](https://docs.perplexity.ai/guides/bots), [Google crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers).

**Two nuances people get wrong.** Google states AI *"is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners"* — there is **no AI Overviews opt-out** short of `nosnippet`/`noindex`. And, verbatim from OpenAI:

> "Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links."

### AI crawlers do not render JavaScript

The [Vercel AI crawler study](https://vercel.com/blog/the-rise-of-the-ai-crawler) instrumented AI bot traffic across its network:

> "none of the major AI crawlers currently render JavaScript. This includes: OpenAI (OAI-SearchBot, ChatGPT-User, GPTBot) Anthropic (ClaudeBot)..."

They fetch JS as text but never execute it. Monthly volumes: GPTBot 569M fetches, Claude 370M, PerplexityBot 24.4M. Both ChatGPT and Claude spend roughly **35% of fetches on 404 pages** — a direct argument for a clean, sitemap-backed URL space that does not generate 404s.

⚠️ Published Dec 2024; the most recent systematic study available, nothing since contradicts it.

**This is the strongest technical finding in the document.** `[slug].tsx` resolves its slug from `router.query` after hydration. To every AI crawler, our deal pages are blank.

### Zero-click reality

[Pew](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) (68,879 searches): clicks on a traditional result fell from **15% to 8%** when an AI summary appeared; only **1% of visits** clicked a source inside the summary. [Ahrefs](https://ahrefs.com/blog/ai-overviews-reduce-clicks/) measured a **34.5% position-1 CTR decline**.

Our structural mitigation: **the code and the claim require a visit and an account.** An engine can state the discount exists; it cannot hand over a claimed, account-bound code. Design the extractable answer to be genuinely the top of the funnel.

## A4. llms.txt and markdown mirrors — the evidence

### llms.txt is not consumed by retrieval engines

[Ahrefs' server-log study](https://ahrefs.com/blog/llmstxt-study/) across 137,210 domains, May 2026:

- **97% of llms.txt files received zero traffic in May 2026.**
- Of the 3% that got any request, **96% was bots**, and **AI retrieval bots — the ones that feed AI answers — were 1.1%.** SEO audit tools were the largest single class at 21.7%.
- **Zero AI bots requested llms.txt on domains that don't have one.** 98% of 404s on that path came from humans. **Crawlers do not probe for it.**
- The top individual requesters were **Claude-Code and GPTBot** — coding agents pulling docs, not retrieval crawlers building answers.

John Mueller's assessment ([SEJ](https://www.searchenginejournal.com/google-says-llms-txt-comparable-to-keywords-meta-tag/544804/)):

> "To me, it's comparable to the keywords meta tag – this is what a site-owner claims their site is about"

Adoption grew 8.8× in 12 months (4,088 → 36,120 sites) but much of it is **platform auto-generation** — Mintlify emits `llms.txt`, `llms-full.txt` and `.md` mirrors for every hosted docs site with zero configuration.

⚠️ Counter-signal: Lighthouse 13.3 added an experimental "Agentic Browsing" audit for llms.txt, on the rationale that *"without the file, agents may spend more time crawling the site"* — Mueller's own reconciliation is that this is **agent functionality, not search discovery**.

**Verdict: llms.txt is worth doing only because it is nearly free and daily.dev already ships one.** It is not a citation lever. Do not budget for it as one.

### Markdown mirrors have much better evidence

Verified live, 7 Aug 2026 — **both the `.md` suffix and `Accept: text/markdown` negotiation return `text/markdown; charset=utf-8`** on `docs.anthropic.com`, `docs.stripe.com`, `vercel.com/docs` and `developers.cloudflare.com`. OpenAI's own commerce docs state it inline: *"Markdown versions of documentation pages are available by appending `.md` to the page URL."*

This is production, not aspirational — and **it validates the pattern this repo already implements** for posts, tags, sources and squads.

The mechanical benefit is token cost and fidelity, not ranking. ⚠️ **No published study measures a citation benefit.** Every "AI reads your markdown better" claim I found was vendor marketing. But given AI crawlers do not render JS, a clean markdown twin is the highest-fidelity thing we can hand them, and the cost here is near zero because the machinery exists.

### Competitor precedent

[Join Secret](https://www.joinsecret.com/robots.txt) — the closest comparable — explicitly allowlists `/llms.txt` and `/api/public/`, and disallows sort/layout/pagination query parameters *with limited exceptions for pages 2–3*. Its llms.txt is an **API contract, not a document index**: `GET /api/public/v1/deals`, `/deals/:slug`, `POST /deals/:slug/activations`, `/categories` — with a *"funnel preservation contract"* requiring agents to display `signup_incentive` and `signup_url` whenever showing a deal code. **That last idea is directly stealable** (§F2).

## A5. Agentic commerce — the ground moved twice

Two developments invalidate any pre-2026 framing:

1. **OpenAI retired native Instant Checkout in ChatGPT in March 2026.** *"Instant Checkout is moving to Apps, where purchases happen inside connected services rather than natively in ChatGPT."* Reasons given: users research in ChatGPT but buy elsewhere; sales-tax collection was never built; roughly a dozen Shopify merchants ever went live ([Search Engine Land](https://searchengineland.com/chatgpt-instant-checkout-plan-change-471033), [CNBC](https://www.cnbc.com/2026/03/24/openai-revamps-shopping-experience-in-chatgpt-after-instant-checkout.html)).
2. **UCP (Universal Commerce Protocol) shipped and won.** Announced by Pichai at NRF on **11 January 2026**, co-developed by **Google and Shopify**, Apache 2.0, spec at [ucp.dev](https://ucp.dev/). Launch coalition of 20+ including Etsy, Wayfair, Target, Walmart, Best Buy, Adyen, Amex, Mastercard, Stripe, Visa, plus Amazon, Microsoft, Meta.

### UCP is live production infrastructure, and it is open

Verified live, 7 Aug 2026. Every Shopify store probed returns a full profile at `/.well-known/ucp`; no non-Shopify retailer did.

```
200  https://allbirds.com/.well-known/ucp
200  https://gymshark.com/.well-known/ucp
200  https://brooklinen.com/.well-known/ucp
404  https://etsy.com | target.com | walmart.com | wayfair.com /.well-known/ucp
```

Speaking MCP to `https://weareallbirds.myshopify.com/api/ucp/mcp` **with no authentication** returns 13 tools: `search_catalog`, `lookup_catalog`, `get_product`, plus full cart, checkout and order tools. Calling `search_catalog` without a reachable agent profile returns `{"code":-32001,"message":"UCP discovery failed","data":{"code":"profile_unreachable"}}`.

**That error is the entire business model of participation.** The gate is *publishing your own UCP profile at a fetchable URL* — not being approved by anyone. The spec calls this **"permissionless onboarding — any platform with a discoverable profile."** Businesses may enforce their own access policies, but the default is open, and Shopify has it **on by default** for eligible US stores ([Shopify Help](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/microsoft)).

⚠️ ~8,000 verified UCP stores by mid-June 2026, ~99% Shopify (secondary source).

Microsoft **adopted UCP rather than building its own spec** for Copilot Checkout; PayPal announced UCP support in January 2026; AP2 integrates with it.

### The discount extension is GA — and the discovery gap is total

**UCP has a shipped, GA discount extension.** `dev.ucp.shopping.discount` appears in the live profile of every Shopify store probed, extending both checkout and cart ([spec](https://raw.githubusercontent.com/Universal-Commerce-Protocol/ucp/main/docs/specification/discount.md), [Google's GA implementation guide](https://developers.google.com/merchant/ucp/guides/checkout/promo-codes), updated 15 Jul 2026). ACP has a near-identical Draft extension with eight canonical rejection codes (`discount_code_expired`, `discount_code_invalid`, `discount_code_already_applied`, `discount_code_combination_disallowed`, `discount_code_minimum_not_met`, `discount_code_user_not_logged_in`, `discount_code_user_ineligible`, `discount_code_usage_limit_reached`).

**But:**

> **Neither UCP nor ACP nor AP2 nor OpenAI Plugins has any operation, endpoint or field for an agent to LIST or DISCOVER which discount codes exist.**

Verified against the schema trees directly. UCP's schema directory has `discount.json` (redemption) but no promotions catalogue; its catalog exposes only `price`, `list_price`, `price_range` — promotional pricing surfaces as strikethrough, never as a code. ACP's Promotions API is merchant→OpenAI push with **no code field at all**, and its 2026-04-17 changelog says *"Promotions are deferred to future releases."*

**Every protocol standardised redeeming a code the agent already holds. None standardised finding out which codes exist.** Meanwhile the incumbent corpora — Honey and Capital One Shopping — have **no public API** and Honey is in active litigation over affiliate attribution (*In re PayPal Honey Browser Extension Litigation*, 5:24-cv-09470 N.D. Cal.; amended claims allowed to proceed June 2026 ⚠️ docket not read directly).

**This is the strategic finding of the whole document.** The supply side of agentic coupon commerce is an unstandardised, unowned gap, sitting directly upstream of a GA redemption rail.

### Can a non-merchant participate?

| Rail | Non-merchant? | Evidence |
|---|---|---|
| Google Merchant Center / Shopping feeds | ❌ *"You're not allowed to use Shopping to promote affiliate or pay-per-click links... **except when participating as a Comparison Shopping Service (CSS)**"* | [guidelines](https://support.google.com/merchants/answer/6363310) |
| Google UCP, merchant side | ❌ Merchant Center account + waitlist | [developers.google.com/merchant/ucp](https://developers.google.com/merchant/ucp) |
| **UCP platform/agent side** | ✅ **Yes — permissionless by spec** | [UCP overview](https://raw.githubusercontent.com/Universal-Commerce-Protocol/ucp/main/docs/specification/overview.md) + verified live |
| OpenAI ACP merchant feeds | ❌ Approved partners only; `seller_name` overridden by registered merchant name | [get-started](https://developers.openai.com/commerce/guides/get-started.md) |
| OpenAI Ads API product feeds | ⚠️ **Possibly** — docs require only an eligible ad account and `is_ads_eligible: true`, with **no stated seller requirement**. Unverified in practice | [ads/product-feeds](https://developers.openai.com/ads/product-feeds.md) |
| OpenAI Plugins | ⚠️ Partially — **monetisation approval limited to physical goods; digital goods and subscriptions not permitted** | [monetization docs](https://developers.openai.com/apps-sdk/build/monetization) |
| Microsoft Copilot Merchant | ❌ MMC + UCP feed + one PSP + merchant-of-record | [about.ads.microsoft.com](https://about.ads.microsoft.com/en/solutions/technology/agentic-commerce) |
| Our own MCP server | ✅ Always — but ⚠️ no ratified discovery standard | see below |

Note the Plugins constraint bites us specifically: **most of our catalogue is SaaS subscriptions**, which OpenAI Plugins monetisation does not permit.

### OpenAI's product feed spec is still the best field vocabulary

Even though we cannot submit to it, the [ACP product feed spec](https://developers.openai.com/commerce/specs/feed/) is Google-Merchant-Center-compatible and is the closest thing to a de-facto standard for describing a discounted offer to an agent. Required: `item_id`, `title`, `description`, `url`, `brand`, `image_url`, `price`, `availability`, `seller_name`, `seller_url`, `target_countries`, `store_country`, plus `is_eligible_search` and `is_eligible_checkout`. Directly relevant optional fields: `sale_price`, `sale_price_start_date`, `sale_price_end_date`, `expiration_date`, `pricing_trend` (free-text, e.g. *"Lowest price in 6 months"*), `product_category`, `geo_price`, `geo_availability`, `review_count`, `star_rating`, `q_and_a`.

**Mirror these names in our feed even though we cannot submit it** — it makes our data trivially transformable by anyone who can.

### Google Merchant Center's promotions feed is the most established coupon format that exists

[Spec](https://support.google.com/merchants/answer/2906014): required `promotion_id`, `product_applicability`, `offer_type`, `long_title`, `promotion_effective_dates`, `redemption_channel`, `promotion_destination`; conditionally required **`generic_redemption_code`** (max 20 chars); preconditions `minimum_purchase_amount`, `redemption_restriction`; benefits `percent_off`, `money_off_amount`, `free_shipping`, `free_gift_value`, `cash_back_amount`; limits `limit_quantity`, `max_discount_amount`.

**Only merchants can submit it** — but its field names are the right vocabulary for our own eligibility and benefit modelling.

### MCP status

Current spec **`2026-07-28`** — a large breaking release. **MCP is now stateless**: `Mcp-Session-Id` and the `initialize` handshake are removed; `server/discover` is now a required RPC; `tools/list` and `resources/list` **require `ttlMs` and `cacheScope`** (directly relevant to catalogue exposure); transports reduced to stdio + Streamable HTTP. MCP was **donated to the Agentic AI Foundation (Linux Foundation) on 9 December 2025**.

⚠️ **Discovery is unsettled and widely misreported.** Multiple SEO blogs claim `/.well-known/mcp.json` was "ratified 2025-11-25" — **this is false.** The real work is [PR #2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127), proposing `/.well-known/mcp/server-cards.json`, moved to *in-review* on 7 August 2026. No IANA registration has been filed. The official registry is **preview, v0.1, no SLA**.

🔑 **The working `.well-known` discovery convention for commerce today is UCP's `/.well-known/ucp`, not anything from MCP.**

### The legal position just changed

On **10 March 2026** Amazon won a preliminary injunction against Perplexity's Comet on CFAA grounds. On **4 August 2026 the Ninth Circuit overturned it**, holding that because Comet requires user direction, *"it was the Comet user who was accessing Amazon's 'computers'"* ([Reuters](https://www.reuters.com/business/retail-consumer/amazon-loses-us-court-ban-perplexitys-ai-shopping-tools-2026-08-04/)). **First appellate holding that a user-directed shopping agent is a tool of the user, not an intruder.**

⚠️ Three days old; Amazon's trademark and state-law claims remain live. This is directly relevant to any future extension-side auto-apply strategy (`03-companion-sidecar.md`) and should be re-checked before that work starts.

## A6. Technical SEO for Next.js Pages Router

### Rendering

`fallback: true` serves a loading state, but [Next.js documents](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths) that *"Web crawlers, such as Google, won't be served a fallback and instead the path will behave as in `fallback: 'blocking'`."*

**That protection is User-Agent detection, and GPTBot/ClaudeBot/PerplexityBot are not named anywhere in the Next.js docs.** Combined with the Vercel finding, `fallback: true` risks serving a permanently blank page to exactly the engines we want to be quoted by. Use `'blocking'`.

Vercel ISR facts that shape the plan ([docs](https://vercel.com/docs/incremental-static-regeneration)): the cache is **scoped per deployment**, so every deploy is a cold cache for thousands of pages; concurrent requests to an uncached path **collapse into one invocation**; revalidation failure keeps serving stale with a 30s retry.

### Sitemaps

Google's limits are 50,000 URLs / 50MB, but **Vercel Functions cap responses at 4.5MB** ([limits](https://vercel.com/docs/functions/limitations)) — the binding constraint, landing around 20–25k URLs per file. Google *"ignores `<priority>` and `<changefreq>`"* and uses `lastmod` only *"if it's consistently and verifiably accurate."*

**In this repo sitemaps are backend-generated** — `next.config.ts` rewrites `/api/sitemaps/:path*` to the API. The live [sitemap index](https://daily.dev/api/sitemaps/index.xml) has 16 children (`posts-1/2`, `evergreen`, `collections`, `highlights`, `tags`, `sources`, `squads`, `users`, `archive-*`) and carries **no `lastmod`**. Deals sitemaps are a daily-api change.

### Faceted navigation

[Google's doc](https://developers.google.com/crawling/docs/faceted-navigation) (updated 2025-12-18) is harder-line than older advice:

> "crawling faceted URLs tends to cost sites large amounts of computing resources"
> "Google Search generally doesn't support URL fragments in crawling and indexing"
> "Return an HTTP 404 status code when a filter combination doesn't return results" — and *"Don't redirect to a common 'not found' error page."*

`rel=canonical` and `rel=nofollow` are demoted to *"secondary signals, less effective long-term."*

### Pagination

From [pagination best practices](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) (updated 10 Dec 2025):

> "Don't use the first page of a paginated sequence as the canonical page. Instead, give each page its own canonical URL."
> "Don't use URL fragment identifiers... for page numbers in a collection."

`rel=next`/`prev` — *"Google no longer uses these tags."* And *"Google can only discover your links if they are `<a>` HTML elements with an `href` attribute."*

### Expired content

**404 and 410 are treated identically:**

> "All `4xx` errors, except `429`, are treated the same" — [HTTP status codes doc](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)

The "410 deindexes faster" folklore is contradicted by Google's own docs. ⚠️ Mueller has said *"a couple of days or so"* — a rounding error at our scale. The frequently-cited "410 deindexes 70% faster" figures trace to low-authority blogs with no methodology; **do not repeat them**.

**The crawl-budget doc (relocated July 2026 to [developers.google.com/crawling/docs/crawl-budget](https://developers.google.com/crawling/docs/crawl-budget)) prefers 404/410 over noindex** for permanent removal, because Google still requests a `noindex` page then drops it — wasted crawl.

**But for retail, Google's preference is to keep the page and mark it unavailable:**

> "Don't block the website by returning `403`, `404`, `410` HTTP status codes, or with a `noindex` robots `meta` tag... This will remove the website's URLs from Google Search." — [pause an online business](https://developers.google.com/search/docs/crawling-indexing/pause-online-business)

⚠️ Note the tension: crawl-budget guidance says 404/410 for permanent removal; retail guidance says keep and mark unavailable. The reconciliation is *permanence* — an expired coupon on a merchant page that will have new coupons is not permanently removed content.

**`JobPosting` gives the documented expiry protocol**: `validThrough` in the past, **or** remove the page (404/410), **or** strip the structured data. ⚠️ **`noindex` is explicitly not one of the options.**

**`unavailable_after` is unreliable for our cadence.** Asked in July 2026 about listings expiring in 24–72 hours and whether rolling the date forward is safe, Gary Illyes said he had no idea and would need to check; his gut was that it's fine, **but Google must recrawl to see the new date** ([SEJ, 29 Jul 2026](https://www.searchenginejournal.com/googles-illyes-unsure-on-shifting-unavailable_after-dates/584064/)). Below a weekly cadence it does not work.

**Seasonal URLs are documented, not folklore:** use a **recurring URL**, not a new one per occurrence — `/sale/black-friday`, not `/sale/2026/black-friday` ([Search Central](https://developers.google.com/search/blog/2020/10/best-practices-black-friday)). Mild tension worth knowing: [Google's deal-page post](https://developers.google.com/search/blog/2021/07/deals-best-practices) suggests putting the year in the **title** while the Black Friday post says keep it out of the **URL**. ⚠️ Both render as nav shells to automated fetching; verify exact wording manually.

⚠️ A 301 from an expired deal to a generic category is the documented soft-404 trap ([Gabe](https://www.gsqi.com/marketing-blog/redirects-less-relevant-pages-soft-404s/), [Mueller via SEJ](https://www.searchenginejournal.com/googles-john-mueller-explains-why-expired-product-pages-may-become-soft-404s/293959/)). You lose the equity *and* the URL.

## A7. Competitive teardown

⚠️ Slickdeals' main site, RetailMeNot's HTML, Capital One Shopping's store pages and Product Hunt are all behind Cloudflare (403). `daily.slickdeals.net` is not, which is how the Slickdeals architecture below was captured.

### URL and title templates (observed verbatim)

| Site | Store/deal URL | Title template |
|---|---|---|
| Slickdeals | `/f/{id}-{slug}`, `/promo-codes/{brand}`, `daily.slickdeals.net/stores/{brand}-promo-code/` | `Target Promo Codes: 25% Off in August 2026` |
| Honey | `/shop/{brand}`, `/coupons/{category}` | `4 Best Nike Coupons, Promo Codes + 25% Off - Aug 2026 - Honey` |
| Capital One Shopping | `/s/{domain}/coupon` (domain-keyed), `/sc/{category}/gdp` | `Nike Promo Codes & Coupons for August 2026` |
| Join Secret | `/{product-slug}` (root-level), `/categories/{slug}`, `/compare/{a}-vs-{b}` | `Notion Promo Code: be notified of the best deals for your startup` |
| AppSumo | `/products/{slug}/`, `/{parent}/{child}/`, `/collections/ending-soon/` | `Vocallab AI - AI voiceovers and captions \| AppSumo` |
| Wirecutter | **`/wirecutter/deals/` only** — every deal is a `#deal-{id}` fragment | `The Best Online Deals Today on Wirecutter Picks \| Wirecutter` |

Slickdeals rotates the noun per brand to match query shape (`Promo Codes` / `Coupon Codes` / `Coupons`) and uses **offer-as-heading** H2s (`"Save Up to 25% Sitewide With This Target Promo Code"`) followed by editorial trust blocks and an FAQ. Join Secret's product pages carry **115 links to `/categories/*`** — extremely aggressive lateral interlinking.

### Structured data — the uncontested gap

| Site | Types | Note |
|---|---|---|
| **AppSumo** | `Product` + `Offer`, `AggregateRating`, `BreadcrumbList`, `FAQPage`, `VideoObject`, `Organization` | Richest in the set. `Offer` carries `availabilityStarts`/`availabilityEnds`/`priceValidUntil`. |
| **Wirecutter** | `CollectionPage` → `ItemList` (`numberOfItems: 168`) of `Product` | `dateModified` same-day |
| **Join Secret** | `BreadcrumbList`, `Corporation`, `FAQPage`, `SoftwareApplication`, `WebPage` | **`SoftwareApplication.offers` is an empty array.** Category pages have **no ItemList**. |
| **Honey** | `Store` → `hasOfferCatalog` → **`DiscountOffer`** | `DiscountOffer` is **not standard schema.org**. Describes 1 item, not the 30 shown on-page. |
| **Slickdeals** | Yoast `Article`, `WebPage`, `BreadcrumbList` | **No `Offer`/`Product` at all** — coupon content marked up as an article |
| Capital One Shopping, G2 deals, SaaSHub, GitHub Pack | none / generic | |

> **Nobody marks up the coupon list itself.** Real `ItemList` + `Offer` markup on a deals list is an open, uncontested gap — which is a reason to do §C properly, not a reason to assume it is unnecessary.

### Expired deals — AppSumo is the model

Probed live: evergreen products (TidyCal, SendFox) return `availability: InStock` with a **rolling `availabilityEnds` of request-time + 1 year**, recomputed per request. Ended deals (DepositPhotos, Mailbird) keep a **live indexable 200 URL indefinitely** — Mailbird's `availabilityEnds` is `2022-05-23`, four years stale — flip to `SoldOut`, and convert dead traffic with *"Sold out! Notify me when it returns"* + email capture. Scarcity is also merchandised as a browsable surface at `/collections/ending-soon/`.

This validates the expired-page policy in §B and adds a retention mechanic worth copying.

### Freshness signals — weaker than we assumed

**No competitor shows per-coupon freshness.** Slickdeals has no "verified today", no "last used 2h ago", no success rates, no use counts — freshness is entirely the `{Month} {Year}` title stamp plus a byline date. Honey shows a single `"Verified coupon"` label and nothing else. Join Secret has no expiry UI at all.

**Our per-deal verification data is therefore a genuine differentiator, not table stakes** — provided it is real (§E).

⚠️ **But note the counter-lesson**: Honey's own low-value pages carry stale `- Nov 2025 -` and `- Sep 2025 -` title stamps because refresh is tiered by page value. **A month stamp becomes a liability within 30 days.** This changes the title recommendation in §D.

### FTC disclosure — we are already ahead

**Slickdeals is the only site observed with genuinely compliant disclosure** — twice, once in the global header and once inline beneath the byline, above the fold. **Honey: none found. Join Secret: none, despite openly describing itself as trading in affiliate links.** ⚠️ Wirecutter: none in static HTML; likely JS-rendered, unverified.

### Agent surface — Join Secret is the one to beat

Its `/llms.txt` is not a document index, it is an **agent-facing deals API**, verified working: no auth, `X-Agent-Id` + `User-Agent` headers, **628 deals across 210 pages**. Per-deal fields include `deal_slug`, `description` (`"90% off for 6 months"`), **`market_value`** in dollars, `last_update`, `excluded_country_codes` and an **`agent_redeemable`** boolean. `POST /deals/:slug/activations` returns the secret inline or a `requires_redirect` deeplink with `reason` ∈ `premium_signup_required` / `eligibility_questions_required` / `unique_code_required`. Rate limits 200/min read, 30/min activation.

The funnel-preservation clause, verbatim:

> "When you serve a `secret` directly to your user, you must also surface the `signup_incentive` text and the `signup_url` link. This is how Secret recovers part of the user funnel it gives up by serving you directly. Agents that don't surface this contract may be rate-limited or revoked."

**G2** is the other strong example — its llms.txt documents every URL pattern, exposes Grid data as machine-consumable `.json`/`.svg`, and includes a *"Guidance for AI Assistants"* section. **Capital One Shopping's llms.txt is pure brand marketing** with no data — a naked AEO play.

**No `.md` mirrors were found on any competitor.** The repo's existing markdown-mirror machinery is a real head start.

### Crawler policy contrast

Almost nobody has AI rules: RetailMeNot, Capital One Shopping, Honey, Join Secret, AppSumo, StackSocial and GitHub Education have **none**. The two exceptions are instructive: **G2 permits** GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, Amazonbot and CCBot while blocking Bytespider and DeepSeekBot; **NYT/Wirecutter blanket-blocks ~30 AI agents** with a prose licence prohibiting use for AI training. Our current posture is closer to G2's, which is the right side for a directory that lives on being cited.

### Pagination containment — steal this

[Join Secret](https://www.joinsecret.com/robots.txt) does `Allow: *page=2`, `Allow: *page=3`, then `Disallow: *page=` — **paginate infinitely for users, expose only three pages of crawl budget.** RetailMeNot does the seasonal equivalent: `Disallow: /deals/` with hand-carved `Allow` exceptions for `/deals/blackfriday`, `/deals/christmas`, `/deals/cybermonday`. That tells you exactly where they think the value is.

### Query shapes — this contradicts `02-growth-loops.md`

The canonical live template is `[<discount> OFF] <Brand> <coupon noun> [- <Month> <Year>] [| <trust token>]`, with trust tokens splitting into verification (`| Verified`) and inventory depth (`• 153 Active Codes`).

Volumes (Ahrefs): `doordash promo code` 343K, `shein coupon code` 261K, `subway coupons` 158K, `etsy coupon code` 78K. Note `etsy coupon code` shows **86.7K traffic against 78K volume** — the #1 page absorbs every noun variant, which is the economic case for one page per brand. [45.7% of all Google searches are branded](https://ahrefs.com/blog/almost-half-of-google-searches-are-branded-study/).

> ⚠️ **`<brand> developer discount` is not a real query shape.** Zero observed titles; searches for it return `student discount` / `startup credits` / `free tier` instead. `02-growth-loops.md` states the directory "targets 'X promo code for developers' queries" — **the qualifier does not exist in the query space.**

The real dev-adjacent shapes are `<brand> student discount`, `<tool> for startups`, `startup credits`, `<brand> lifetime deal`, `free tier`, and `open source alternative to X`. B2B pages also frame savings in **absolute dollars, not percentages** — `"$1,000 Notion Coupon Code"`, Join Secret's on-page `"Save up to $3,460"` and its API's `market_value` field. **Our `value.label` leads with `-30%`.** For SaaS deals, lead with dollars.

### The good news on zero-click

Zero-click by intent is **informational 74% / commercial-investigation 46% / transactional 31%**, AI Overviews trigger on only **3.2–4% of e-commerce queries** ([Ahrefs](https://www.omnibound.ai/blog/zero-click-search-statistics)), and [**under 3% of AIOs target transactional keywords**](https://www.semrush.com/blog/ai-overviews-study/).

> **`<brand> promo code` — transactional and short-tail-branded — is among the best-insulated query classes in search.** The exposed shapes are `best <category> deals`, `<brand> alternatives` and `<brand> vs <brand>`.

This meaningfully softens the zero-click risk for our highest-value pages, and argues for weighting brand pages above category pages in build order.

⚠️ Overall zero-click still rose 60.45% (2024) → **68.01% (Jan–Apr 2026)** ([SparkToro](https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/)).

### Seasonality

Up to 70% of Black Friday search volume lands Oct–early Nov, with signal from August; publish 8–12 weeks ahead. ⚠️ Widely quoted, no traceable methodology. AI referral traffic to retail was **+805% YoY on Black Friday 2025**, converting **+38%** that day ([Adobe](https://business.adobe.com/blog/generative-ai-powered-shopping-rises-with-traffic-to-retail-sites)).

### The uncomfortable finding: the category bifurcated by channel

| Site | Monthly visits (Similarweb, Jun 2026) | MoM | Primary channel |
|---|---|---|---|
| Capital One Shopping | 61.8M | +0.7% | Affiliate 59.4% |
| Slickdeals | 59.3M | +3.3% | **Direct 75.8%** |
| Honey | 8.4M | +3.5% | Direct 71.4% |
| **RetailMeNot** | **9.7M** | **−27.3%** | **Organic 58%** |
| G2 / Capterra / Product Hunt | 2.3M / 1.9M / 4.2M | −4.5% / −13.3% / −14.1% | search-dependent |

**Every growing site is direct- or affiliate-led; every declining one is search-led.** RetailMeNot's organic fell **41% MoM** while paid rose 6%; Ziff Davis's Technology & Shopping segment fell 12.9% in Q1 2026 citing *"traffic pressures and reduced affiliate commerce activity"*, **deferred 2026 guidance**, and pivoted RetailMeNot to self-funded cash back — capitulation on the search channel.

> **This is the honest counterweight to the whole document.** Search is necessary but is not, on this evidence, sufficient. daily.dev's advantage is that we already *have* the direct channel — feed, extension, streaks, 
sidebar — and the growth loops in `02-growth-loops.md` are the direct-traffic engine. **Position search as the acquisition layer on top of an existing direct audience, not as the business.** That framing is both more accurate and more defensible than the Wirecutter framing in `00-research.md`.

⚠️ Similarweb figures are single-sourced. The widely-repeated "71% of affiliate sites hit" figure for the Dec 2025 / Mar 2026 core updates traces only to SEO content marketing; primary study never located.

### Our own current state

**daily.dev's [robots.txt](https://daily.dev/robots.txt)** is far more AI-forward than any competitor — and contains a defect (§E). **daily.dev's [llms.txt](https://daily.dev/llms.txt)** already documents a Public API, agent Skills, a Claude Code plugin and markdown mirrors across 7 sections, and **makes no mention of deals**.

---

# B. URL and information architecture

## Route map

| Route | Render | Robots | Purpose |
|---|---|---|---|
| `/deals` | ISR, `revalidate: 900` | `index, follow` | Directory hub |
| `/deals/[slug]` | ISR `fallback: 'blocking'`, `revalidate: 900` + on-demand | `index, follow` unless gate trips | The money page |
| `/deals/brand/[brand]` | ISR, `revalidate: 3600` | `index, follow` if ≥1 live offer | **Build first.** `cursor promo code` — highest intent, best AI-insulated |
| `/deals/category/[category]` | ISR, `revalidate: 3600` | `index, follow` if gate passes | `best AI coding tool deals` — higher volume, more AI-exposed |
| `/deals/ending-soon` | ISR, `revalidate: 900` | `index, follow` | Merchandised scarcity, genuinely distinct content |
| `/deals/claimed` | CSR | `noindex, follow` | The wallet, auth-only |
| `/deals/expired/*` | — | **Do not build** | See the expiry policy |

`/deals/claimed` is a new URL: the wallet is currently a `useState` tab with no address, so it cannot be linked, bookmarked or returned to.

**Seasonal pages get recurring URLs.** `/deals/black-friday`, never `/deals/black-friday-2026` — Google's documented guidance, so accumulated signals carry year over year. The year goes in the `<title>`, not the URL.

## Which filter states get URLs

Two facet dimensions, never combined:

- **`category`** → `/deals/category/ai-tools`
- **`brand`** → `/deals/brand/cursor`

Everything else stays out of the index:

| State | Treatment |
|---|---|
| Free-text search | `?q=` → `noindex, follow`, canonical to `/deals` |
| `Expiring` / `Exclusive` chips | **URL fragment** (`#expiring`) — Google does not crawl fragments, so nothing to block or canonicalise |
| Sort order | Fragment. Same result set, different order, zero incremental search value |
| Multi-select combinations | Not supported in URLs at all |

`DealsFilterBar` currently flattens categories, `Expiring` and `Exclusive` into one `string`. That must split: category is an entity with a slug and a URL; the other two are ephemeral view state.

## Canonical rules

1. Self-referencing canonical on every indexable page, **including page 2+**.
2. `/deals/[slug]?ref=<user>` canonicalises to the bare slug. The share landing becomes the *same page* plus a sharer banner, not a separate document — today `[slug].tsx` renders `DealShareLanding` as the only deal page.
3. Category and brand pages canonicalise to themselves; a deal on several never canonicalises to a category.
4. **Empty facet results return HTTP 404 at the requested URL** (`return { notFound: true }`), never a 200 shell.

## Pagination

`?page=n` on category and brand pages. Self-referencing canonical per page, unique `<title>` with a `— Page N` suffix, real `<a href>` links. Keep `rel=next`/`prev` for Bing only. Out-of-range pages 404.

**Containment, copied from Join Secret:** paginate infinitely for users, expose three pages to crawlers.

```
Allow: /deals/*page=2
Allow: /deals/*page=3
Disallow: /deals/*page=
```

Deep inventory that deserves indexing gets a category or brand page, not page 12 of a list.

## Internal linking — the gap that makes everything else moot

`DealCard` renders no anchor. There is no crawl path from the directory to any deal page.

- Wrap the card title in `<a href="/deals/{slug}">`.
- Keep the modal, but open it via `router.push(url, undefined, { shallow: true })` so the URL exists, back works, and the page is shareable — the pattern the post modal already uses.
- Every deal page links to its category, its brand, and 3–5 sibling deals.

## Breadcrumbs

`Home > Deals > {Category | Brand} > {Deal title}`, reusing `buildBreadcrumbListJsonLd` from `packages/shared/src/lib/archive.ts`. Since January 2025 Google shows domain-only breadcrumbs on mobile, so the payoff is desktop SERP plus entity clarity.

## Expired deals

**Default (95%+ of expiries): keep the page at HTTP 200, marked expired, populated with live alternatives.** This follows Google's retail guidance and it is commercially right — `"cursor promo code"` is searched continuously and should land on today's code.

**Hard rule: an expired page must never be thin.** An "Expired" badge with nothing else *is* a soft 404. If we cannot populate live alternatives from the same merchant or category, 404 it instead.

**Copy AppSumo's two mechanics** (§A7), which are the best expired-deal handling observed anywhere:
- Ended deals keep a live indexable 200 URL indefinitely, flip `availability` to `SoldOut`, and convert dead traffic with **"Notify me when it returns" + email capture**. That turns an expiry into a list-building event and gives the page a reason to exist beyond SEO.
- **Genuinely evergreen offers get a rolling `validThrough`** (request time + 1 year), so `Offer` markup stays valid without manual date maintenance. Apply this **only** where the offer truly has no end date — rolling the date on a time-boxed deal is the "time-sensitive content no longer relevant" violation in §A2.

Also worth copying: an **`/deals/ending-soon`** browsable surface. It merchandises scarcity, matches the `Expiring` filter we already have, and unlike the filter chip it is a legitimate indexable page because its content is genuinely distinct and continuously changing.

**410 only for true dead ends** (merchant gone, category retired). Not for speed — Google's docs say 4xx is 4xx — but because it is self-documenting in our logs, distinguishing a deliberate removal from an application bug. At thousands of expiries per week that is the entire argument.

**301 only to a named successor** (`successorSlug`), never a bulk redirect to a category. If we cannot name the replacement, it is not a redirect candidate.

**Never `noindex` an expired deal.** It is the worst option: months to take effect, still consumes crawl budget, and destroys the recurring-search value.

**Do not use `unavailable_after`** — Illyes could not confirm rolling dates work, and it requires a recrawl to see a new date, which fails below a weekly cadence. Drive expiry from `validThrough` instead.

`[slug].tsx` today returns HTTP 200 with `DealNotFound` for an unknown slug. That is a soft 404 and must become `notFound: true`.

---

# C. Structured data spec

Follow the `PostSEOSchema.tsx` pattern: pure `get*JsonLd(): string` helpers plus a component emitting one `<script type="application/ld+json">` per schema, with a co-located `.spec.ts`.

New file: `packages/webapp/components/DealSEOSchema.tsx` (+ `DealSEOSchema.spec.ts`).

## `/deals/[slug]`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://app.daily.dev/deals/cursor-pro-20-percent#page",
      "url": "https://app.daily.dev/deals/cursor-pro-20-percent",
      "name": "Cursor Pro 20% off for developers (August 2026)",
      "description": "20% off Cursor Pro for the first year. 97% of 1,842 daily.dev members reported it worked. Verified 12 minutes ago.",
      "datePublished": "2026-06-02T09:00:00Z",
      "dateModified": "2026-08-07T16:31:00Z",
      "isPartOf": { "@id": "https://daily.dev/#website" },
      "about": { "@id": "https://app.daily.dev/deals/cursor-pro-20-percent#item" },
      "mainEntity": { "@id": "https://app.daily.dev/deals/cursor-pro-20-percent#offer" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://app.daily.dev/deals/cursor-pro-20-percent#item",
      "name": "Cursor",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "macOS, Windows, Linux",
      "url": "https://cursor.com",
      "sameAs": ["https://www.wikidata.org/wiki/Q123456789", "https://x.com/cursor_ai"],
      "publisher": { "@type": "Organization", "name": "Anysphere, Inc.", "url": "https://cursor.com" }
    },
    {
      "@type": "Offer",
      "@id": "https://app.daily.dev/deals/cursor-pro-20-percent#offer",
      "name": "20% off Cursor Pro, first year",
      "url": "https://app.daily.dev/deals/cursor-pro-20-percent",
      "price": 16.00,
      "priceCurrency": "USD",
      "priceSpecification": [
        { "@type": "UnitPriceSpecification", "price": 16.00, "priceCurrency": "USD" },
        {
          "@type": "UnitPriceSpecification",
          "priceType": "https://schema.org/StrikethroughPrice",
          "price": 20.00,
          "priceCurrency": "USD"
        }
      ],
      "availability": "https://schema.org/InStock",
      "validFrom": "2026-06-02T09:00:00Z",
      "validThrough": "2026-09-30T23:59:59Z",
      "priceValidUntil": "2026-09-30",
      "eligibleCustomerType": "https://schema.org/NewCustomer",
      "eligibleRegion": { "@type": "Country", "name": "US" },
      "seller": { "@type": "Organization", "name": "Anysphere, Inc.", "url": "https://cursor.com" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://app.daily.dev" },
        { "@type": "ListItem", "position": 2, "name": "Deals", "item": "https://app.daily.dev/deals" },
        { "@type": "ListItem", "position": 3, "name": "AI tools", "item": "https://app.daily.dev/deals/category/ai-tools" },
        { "@type": "ListItem", "position": 4, "name": "Cursor Pro 20% off" }
      ]
    }
  ]
}
```

### Deliberate omissions

| Omitted | Reason |
|---|---|
| `AggregateRating` from `worksRate` | Measures code redemption, not product quality. Emitting it is misleading markup. |
| `Offer.discountCode` | An `Order` property, Google ignores it, and publishing the code in markup while gating the reveal is a visible-content mismatch. |
| `FAQPage` | Rich results ended 7 May 2026; no evidence it aids LLM citation. |
| `Offer.url` = affiliate link | `Offer.url` is our page. A tracked redirect there invites cloaking questions. |
| `Product` for SaaS | `SoftwareApplication` is the specific applicable type. Use `Product` only for physical goods. |

## `/deals`, `/deals/category/[category]`

`CollectionPage` + `ItemList` + `BreadcrumbList`, mirroring `pages/tags/[tag].tsx`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://app.daily.dev/deals/category/ai-tools#page",
      "url": "https://app.daily.dev/deals/category/ai-tools",
      "name": "Best AI tool deals for developers (August 2026)",
      "description": "18 verified discounts on AI coding tools, checked by the daily.dev community.",
      "dateModified": "2026-08-07T16:31:00Z",
      "isPartOf": { "@id": "https://daily.dev/#website" }
    },
    {
      "@type": "ItemList",
      "@id": "https://app.daily.dev/deals/category/ai-tools#items",
      "numberOfItems": 18,
      "itemListElement": [
        { "@type": "ListItem", "position": 1,
          "url": "https://app.daily.dev/deals/cursor-pro-20-percent",
          "name": "20% off Cursor Pro, first year" }
      ]
    },
    { "@type": "BreadcrumbList", "itemListElement": [] }
  ]
}
```

## `/deals/brand/[brand]`

Same, plus an `Organization` node carrying `sameAs`. Brand pages are where entity anchoring pays off — `"cursor promo code"` is an entity query, and `sameAs` is how we say which Cursor we mean.

## Fields we are missing

| Property | Blocking field on `Deal` |
|---|---|
| `Offer.price`, `priceCurrency` | no price model — only `value.label: '-30%'` |
| `StrikethroughPrice` | no `listAmount` |
| `Offer.availability` | derivable from `DealState`, no explicit mapping |
| `Offer.validFrom` | absent |
| `Offer.validThrough` | `expiresAt` optional, set on only some mocks |
| `Offer.url` | **`Deal` has no URL field of any kind, and no outbound partner link** |
| `Offer.seller` | `DealBrand` has no `legalName`, `domain` or `homepageUrl` |
| `WebPage.dateModified` | no `updatedAt`; `lastVerifiedAgo` is a display string |
| `sameAs` | absent |
| `eligibleRegion` / `eligibleCustomerType` | absent; eligibility hides in free-text `terms` |

---

# D. Metadata spec

| Route | Title | Description |
|---|---|---|
| `/deals` | `Developer deals, credits and promo codes \| daily.dev` | `{N} verified deals on developer tools, cloud credits and hardware. Checked by the daily.dev community, most recently {relative}.` |
| `/deals/[slug]` | `{brand} {valueLabel}: {shortTitle} ({dateToken}) \| daily.dev` | `{valueLabel} on {brand}. {worksRate}% of {claims} daily.dev members reported it worked. Verified {relative}. {firstTermsClause}` |
| `/deals/category/[c]` | `Best {category} deals for developers ({dateToken}) \| daily.dev` | `{N} verified {category} discounts for developers, ranked by what the community actually redeemed.` |
| `/deals/brand/[brand]` | `{brand} promo codes and discounts for developers \| daily.dev` | `Every live {brand} offer we have verified, with the success rate for each. Updated {relative}.` |
| Paginated | append ` — Page {n}` before the ` \| daily.dev` suffix | unchanged |

Use `getPageSeoTitles(title)` from `packages/webapp/components/layouts/utils.ts` so the suffix and OG title stay consistent.

### The date token rule

Every competitor injects a date. **But Honey's own low-value pages carry stale `- Nov 2025 -` and `- Sep 2025 -` stamps** because refresh is tiered by page value — a month stamp becomes a liability within 30 days. Google also documents keeping the year out of *seasonal URLs* while suggesting it in *titles*.

```
dateToken = updatedAt within 30 days ? "{Month} {YYYY}" : "{YYYY}"
```

**Derive it from a real `updatedAt`, never `new Date()` at render.** A month token that advances while content rots is exactly the "consistently and verifiably accurate" failure that makes Google discard freshness signals wholesale — and it is the same dishonesty as the frozen `lastVerifiedAgo` string.

### Lead with dollars for SaaS

B2B deal pages frame savings in **absolute dollars, not percentages** — `"$1,000 Notion Coupon Code"`, Join Secret's `"Save up to $3,460"`. Our `value.label` leads with `-30%`. For SaaS and credits, `{valueLabel}` should resolve to the dollar figure (`price.savingsUsd`) where one exists, falling back to the percentage. Percentages stay for hardware, where they match the query shape.

### Query-shape correction

`02-growth-loops.md` claims the directory targets `"X promo code for developers"`. **That qualifier does not exist in the query space** (§A7). Titles must target the shapes that do: `{brand} promo code`, `{brand} student discount`, `{tool} for startups`, `startup credits`, `{brand} free tier`, `{brand} lifetime deal`. Do not append "for developers" to brand titles — it dilutes an exact-match head term. It is fine on category pages, where it is a genuine qualifier.

## Open Graph and Twitter

`next-seo.ts` already sets `twitter.cardType: 'summary_large_image'` globally, so only the image needs work. Growth Loop 5 promises a per-offer OG image; add `verified {relative}` to it, since freshness is the differentiating claim in a Slack or X preview. Backend/image-service work — until it lands, fall back to `defaultOpenGraph`.

No hreflang: single locale.

## The noindex decision

Flip both routes to indexable, gated. New `packages/webapp/lib/dealsSeo.ts`, mirroring `shouldNoindexPost`:

```ts
export const shouldNoindexDeal = (deal: Deal): boolean => { /* ... */ };
```

Returns `true` when **any** of:

1. **No destination.** `!deal.partnerUrl` — nothing to deliver.
2. **Thin.** No `whyPick`, no comments, and `description.length < 120`. The thin-affiliation gate, and the most important condition.
3. **Expired with no live alternatives** in the same brand or category.
4. **Sold out with no restock date** and no successor.
5. **Paid placement with no editorial.** `isPromoted && !whyPick`.

Category pages are noindexed below **6 live offers** or without a unique `seoIntro`. Brand pages need ≥1 live offer.

`noindex` here means the page still renders, still serves members, and still appears in the JSON feed. It just does not compete in search until it earns the right to.

**Segment YMYL.** Any deal touching credit cards, BNPL, lending, insurance or crypto gets a stricter bar: editorial review required, no community-only sourcing, and a named author. Dev tools and hardware are not YMYL.

---

# E. AEO / GEO spec

## Content shape for a deal page

Order matters — retrieval chunks top-down, and the H1 does not travel with the chunk.

1. **H1** — `{Value} on {Merchant}: {qualifier}`.
2. **Direct-answer block. First paragraph. Under 45 words. Self-contained.** Names the entity explicitly (never "it"), the discount, the eligibility, the date:
   > "Cursor Pro is 20% off for the first year through daily.dev's developer deals directory, verified 12 minutes ago. The code applies at checkout for new accounts and runs until 30 September 2026."
3. **Freshness stamp with a machine-readable date** — visible "Verified 12 minutes ago" backed by `<time datetime="2026-08-07T16:31:00Z">`.
4. **Facts table.** Discount / What you pay / Who qualifies / Region / Expires / Code needed / Success rate / Last verified. Tables measured **43% higher extraction accuracy than prose**.
5. **Quotable statistic**, standalone: "1,842 daily.dev members claimed this deal and 97% reported it worked." Statistics addition measured **+32.8%**.
6. **"Why we picked it"** (`whyPick`) — first-hand reasoning. Simultaneously the E-E-A-T Experience signal, the thin-affiliation defence, and the Wirecutter rule from `01-product-spec.md`.
7. **Terms verbatim, linked to the merchant's own page.** Citing sources measured **+28.2%**, and **+115.1% for a 5th-ranked site**.
8. **Comparison table** against 2–4 alternatives. This is what gets pulled into "best X" AI Overviews — and it is one of Google's named added-value features for affiliate sites.
9. **Community comments** — real UGC, the thing no coupon site has.
10. **Related deals, category and brand links.**

Each section a self-contained chunk of **150–300 words**; past 300, extraction degrades ~31%.

**Prohibited: keyword stuffing.** The only technique measured as actively harmful (−8.7%).

## The freshness problem we must fix first

`community.lastVerifiedAgo` is a hardcoded string like `'2h ago'`. On an ISR page cached for 15 minutes, a frozen relative string is not merely useless — it is **an inaccurate claim rendered as a trust signal**, which is both the "verifiably accurate" failure and a violation of the trust rule `01-product-spec.md` calls non-negotiable.

Replace with `verification.lastVerifiedAt: string` (ISO) and compute the label at render. This is a prerequisite, not an enhancement.

## robots.txt policy

daily.dev's [live robots.txt](https://daily.dev/robots.txt) already allows every AI crawler, overriding a Cloudflare managed block, and declares `Content-Signal: ai-train=no, search=yes, ai-input=yes`. That posture is right for a deals directory.

**But it contains a defect.** The file has *duplicate user-agent groups* for GPTBot, ClaudeBot, CCBot, Google-Extended, Bytespider, Amazonbot, Applebot-Extended and meta-externalagent — first `Disallow: /` in the Cloudflare block, then `Allow: /` in the daily.dev block. Google's spec merges same-agent records and resolves toward the least restrictive rule, so Google reads `Allow`. **Other parsers commonly take the first matching group and read `Disallow`.** We are relying on undefined behaviour for exactly the crawlers we most want.

> **Recommendation: remove the Cloudflare managed block rather than override it, so each crawler appears in exactly one group.** Marketing repo change.

Secondary inconsistency: we `Allow: /` GPTBot and ClaudeBot (training crawlers) while declaring `ai-train=no`. Pick one. Recommendation: keep both allowed and drop `ai-train=no` — for a public, time-limited, commercially-motivated directory, being in the model's priors beats a reservation we do not intend to enforce.

| Crawler | Recommendation | Trade-off |
|---|---|---|
| Googlebot, Bingbot | Allow | Non-negotiable. Googlebot is the only route into AI Overviews. |
| OAI-SearchBot, Claude-SearchBot, PerplexityBot | **Allow** | Blocking any deletes us from that engine's answers. Highest-value crawlers here. |
| ChatGPT-User, Claude-User, Perplexity-User | **Allow** | These fire at the exact moment a user asks an agent to check our deal. |
| GPTBot, ClaudeBot, CCBot | Allow | Training only. Low value, low cost, consistent with current posture. |
| Google-Extended, Applebot-Extended | Allow | Near zero either way; blocking Google-Extended does **not** remove us from AI Overviews. |
| `/api/md/*`, `?q=`, `#` filters | Crawlable, not indexable | Already `X-Robots-Tag: noindex` on md routes. Keep readable by agents. |

**The trade-off, stated plainly:** allowing everything guarantees zero-click answers. Pew measured clicks falling 15% → 8% with an AI summary, and only 1% clicking a source inside it. Our mitigation is structural: **the code and the claim require a visit and an account.** Design the extractable answer to be genuinely the top of the funnel.

---

# F. Agent-readable surface

Everything here extends machinery the repo already has.

## F1. Markdown mirrors

Register deals in `packages/webapp/lib/markdownRoutes.ts`:

```ts
export const MARKDOWN_ROUTES: Record<string, string> = {
  '/sources': '/api/md/sources',
  '/tags': '/api/md/tags',
  '/squads/discover': '/api/md/squads',
  '/deals': '/api/md/deals',
};

export const DEAL_MARKDOWN_PATH = '/api/md/deals';
```

Add `{ source: '/deals/:slug.md', destination: `${DEAL_MARKDOWN_PATH}/:slug` }` to `getMarkdownRewrites()`, and extend `packages/webapp/middleware.ts` (currently `matcher: '/posts/:id'`) to also match `/deals/:slug`, reusing `acceptsMarkdown()` unchanged.

New handlers follow `pages/api/md/tags.ts` exactly: YAML front matter, the Documentation Index blockquote, `Content-Type: text/markdown; charset=utf-8`, `Link: </llms.txt>; rel="llms-txt"`, `X-Llms-Txt`, `X-Robots-Tag: noindex, nofollow`, 405 on non-GET, `escapeMarkdown()`.

**Cache note:** the tags handler uses `s-maxage=86400`. A day is far too long for deals. Use `s-maxage=300, stale-while-revalidate=3600` — a stale code is a broken promise, not a stale list.

`/deals/cursor-pro-20-percent.md`:

```markdown
---
title: 20% off Cursor Pro, first year
url: https://app.daily.dev/deals/cursor-pro-20-percent
description: 20% off Cursor Pro for the first year, verified by the daily.dev community.
merchant: Cursor
merchant_domain: cursor.com
discount_percent: 20
price: 16.00 USD
list_price: 20.00 USD
valid_through: 2026-09-30T23:59:59Z
last_verified: 2026-08-07T16:31:00Z
availability: in_stock
requires_code: true
regions: worldwide
new_customers_only: true
---

> ## Documentation Index
> Fetch the complete documentation index at: https://daily.dev/llms.txt

# 20% off Cursor Pro, first year

Cursor Pro is 20% off for the first year through daily.dev, verified 12 minutes
ago. The code applies at checkout for new accounts and runs until 30 September 2026.

| | |
|---|---|
| Discount | 20% off, first year |
| You pay | $16.00/mo (normally $20.00) |
| Who qualifies | New Cursor accounts |
| Region | Worldwide |
| Expires | 30 September 2026 |
| Code needed | Yes, revealed on claim |
| Success rate | 97% of 1,842 claims |
| Last verified | 2026-08-07T16:31:00Z |

## Why we picked it

{whyPick}

## Terms

{terms} — [Cursor's own terms](https://cursor.com/pricing)

## How to redeem

1. Open https://app.daily.dev/deals/cursor-pro-20-percent
2. Sign in to daily.dev (free) and claim the deal to reveal the code
3. Apply the code at https://cursor.com checkout

## Alternatives in AI tools

| Deal | Discount | Success rate | Link |
|---|---|---|---|

---

Affiliate disclosure: daily.dev may earn a commission on this offer. It funds the
free stuff for devs. Community picks are chosen on merit and are never paid for.
```

The **"How to redeem"** block is our version of Join Secret's funnel-preservation contract: it tells an agent the truth about the next step rather than letting it invent one.

## F2. Offers feed

`pages/api/deals/feed.json.ts`. Field names deliberately mirror the [OpenAI/ACP product feed spec](https://developers.openai.com/commerce/specs/feed/) — itself Google-Merchant-Center-compatible — so anyone who can consume either can consume ours with no mapping. Benefit and eligibility naming follows the [GMC promotions spec](https://support.google.com/merchants/answer/2906014).

```json
{
  "version": "1.0",
  "generated_at": "2026-08-07T16:35:00Z",
  "publisher": {
    "name": "daily.dev",
    "url": "https://daily.dev",
    "affiliate_disclosure": "daily.dev may earn a commission on some offers. Community picks are chosen on merit and are never paid for."
  },
  "count": 214,
  "offers": [
    {
      "item_id": "d-cursor-pro-20",
      "title": "20% off Cursor Pro, first year",
      "description": "20% off Cursor Pro for the first year for new accounts.",
      "url": "https://app.daily.dev/deals/cursor-pro-20-percent",
      "markdown_url": "https://app.daily.dev/deals/cursor-pro-20-percent.md",
      "brand": "Cursor",
      "seller_name": "Anysphere, Inc.",
      "seller_url": "https://cursor.com",
      "image_url": "https://media.daily.dev/...",
      "price": { "amount": 16.00, "currency": "USD" },
      "list_price": { "amount": 20.00, "currency": "USD" },
      "sale_price": { "amount": 16.00, "currency": "USD" },
      "sale_price_start_date": "2026-06-02T09:00:00Z",
      "sale_price_end_date": "2026-09-30T23:59:59Z",
      "benefit": { "type": "percent_off", "percent_off": 20 },
      "offer_type": "generic_code",
      "availability": "in_stock",
      "product_category": "AI tools > Code assistants",
      "target_countries": ["*"],
      "redemption": {
        "requires_code": true,
        "code_available_to": "authenticated_daily_dev_members",
        "claim_url": "https://app.daily.dev/deals/cursor-pro-20-percent",
        "merchant_checkout_url": "https://cursor.com/pricing",
        "signup_url": "https://app.daily.dev/onboarding",
        "signup_incentive": "Free daily.dev account required to reveal the code."
      },
      "eligibility": {
        "new_customers_only": true,
        "students_only": false,
        "minimum_purchase_amount": null,
        "redemption_restriction": "New Cursor accounts only",
        "excluded_regions": []
      },
      "verification": {
        "last_verified_at": "2026-08-07T16:31:00Z",
        "reports_worked": 1786,
        "reports_failed": 56,
        "success_rate": 0.97
      },
      "market_value": { "amount": 48.00, "currency": "USD" },
      "agent_redeemable": false,
      "is_promoted": false,
      "is_affiliate": true,
      "is_eligible_search": true,
      "is_eligible_checkout": false
    }
  ]
}
```

`is_eligible_checkout` is hard-coded `false` — we are not the seller. `redemption` and `verification` are our extensions and they are the load-bearing parts: **no existing feed format carries either, and they are exactly what an agent needs.**

Two fields borrowed from Join Secret's working API, because they are demonstrably the right shape: **`market_value`** (absolute dollar saving — the framing B2B buyers and agents actually compare on, §A7) and **`agent_redeemable`** (a boolean an agent can branch on before wasting a turn). When `agent_redeemable` is false, `redemption.reason` should carry an enum mirroring theirs: `signup_required` | `eligibility_check_required` | `unique_code_required`.

Serve with `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600` and `X-Robots-Tag: noindex`. Rate-limit reads (Join Secret uses 200/min) and require a `X-Agent-Id` header so we can measure agent demand — which is the gate for Phase 3. Add a per-category variant (`?category=ai-tools`) before adding pagination.

## F3. llms.txt

`/llms.txt` is served from the marketing repo and its 7 sections make no mention of deals. Add:

```markdown
## Deals

Verified discounts, credits and promo codes for developer tools, sourced directly
from merchants and checked by the daily.dev community.

- [Deals directory](https://app.daily.dev/deals): all live offers — markdown at /deals.md
- [Machine-readable offers feed](https://app.daily.dev/api/deals/feed.json): JSON, refreshed every 5 minutes
- Individual offers: https://app.daily.dev/deals/{slug} — markdown mirror at /deals/{slug}.md
- Categories: https://app.daily.dev/deals/category/{category}
- Brands: https://app.daily.dev/deals/brand/{brand}

Codes are revealed to signed-in daily.dev members. Agents should surface the
signup step rather than presenting a code as directly redeemable.
```

**Expectation-setting: this will do almost nothing for citation.** 97% of llms.txt files got zero requests in May 2026 and AI retrieval bots were 1.1% of the traffic on the 3% that got any. Do it because it is nearly free, because daily.dev already ships one, and because the one measurable consumer class — **coding agents** — is precisely our audience. Do not budget for it as an SEO lever.

## F4. Agentic commerce readiness

### Where we actually fit

We cannot be a seller. ACP merchant feeds are approved-partners-only with `seller_name` overridden by the registered merchant. Google Shopping feeds explicitly bar affiliates except as a CSS. Microsoft requires merchant-of-record status. OpenAI Plugins monetisation is limited to **physical goods**, which excludes most of our SaaS catalogue.

**But UCP's agent side is permissionless by specification**, and there is a structural gap nobody has filled:

> Every agentic-commerce protocol standardised **redeeming** a code the agent already holds. **None standardised discovering which codes exist.** The incumbents holding that data (Honey, Capital One Shopping) publish no API and are in litigation over affiliate attribution.

That gap sits directly upstream of a GA redemption rail and is the exact shape of this product. It is the strongest strategic argument for building the feed properly rather than treating it as a nice-to-have.

### The six questions an agent asks

| Agent question | Our field |
|---|---|
| What is the offer? | `title`, `description`, `benefit` |
| What will it cost? | `price`, `list_price`, `sale_price` |
| Do I qualify? | `eligibility`, `target_countries` |
| Is it still valid? | `sale_price_end_date`, `availability`, `verification.last_verified_at` |
| How confident should I be? | `verification.success_rate`, `reports_worked/failed` |
| How do I actually redeem it? | `redemption` |

The last two rows are what no existing format carries.

### Sequencing

1. **Ship the JSON feed and the markdown mirrors.** Everything else is a wrapper over these.
2. **Then an MCP server** — `search_deals(query, category, max_price)`, `get_deal(slug)`, `check_eligibility(slug, country, is_new_customer)`. Note MCP `2026-07-28` is **stateless** (no `initialize` handshake, no session id) and `tools/list` now **requires `ttlMs` and `cacheScope`** — build against the current spec, not tutorials. ⚠️ Discovery is unsettled: `/.well-known/mcp/server-cards.json` is an **open draft PR**, not ratified, and the official registry is preview with no SLA. Claims that `/.well-known/mcp.json` was ratified in Nov 2025 are **false**.
3. **Then evaluate publishing our own UCP agent profile** at `/.well-known/ucp`, which would let us act as a *platform* against any UCP business — including calling `search_catalog` and the GA discount extension on ~8,000 Shopify stores. This is a genuine product option, not just plumbing, and it is the one path where being a non-merchant is not disqualifying. Scope it separately.

⚠️ Before committing roadmap time: confirm whether Shopify merchants allowlist UCP platforms in practice (we tested only the unauthenticated read path), and whether OpenAI Ads accepts non-merchant feeds (their docs are silent, which is not permission).

---

# G. Data model additions

All in `packages/shared/src/features/deals/types.ts`. **Another agent is actively editing this file — coordinate before applying.**

```ts
export interface DealPrice {
  currency: string;                 // ISO 4217
  listAmount?: number;              // pre-discount, drives StrikethroughPrice
  dealAmount?: number;              // post-discount; 0 for free tiers
  percentOff?: number;              // integer 0-100
  amountOff?: number;               // exclusive with percentOff
  savingsUsd?: number;              // moves here from DealValue
  recurrence?: 'one_time' | 'monthly' | 'annual';
}

export interface DealMerchant {
  id: string;
  name: string;
  legalName?: string;
  domain: string;                   // 'cursor.com' — the entity key for AI engines
  homepageUrl: string;
  logoUrl: string | null;
  accent?: string;
  sameAs?: string[];                // wikidata / crunchbase / x, for disambiguation
}

export interface DealVerification {
  lastVerifiedAt: string;           // ISO. replaces community.lastVerifiedAgo
  verifiedBy?: 'community' | 'editorial' | 'merchant';
  reportsWorked: number;
  reportsFailed: number;
}

export interface DealEligibility {
  newCustomersOnly?: boolean;
  studentsOnly?: boolean;
  requiresAccount?: boolean;
  minimumPurchaseAmount?: number;
  regions?: string[];               // ISO 3166-1 alpha-2; empty = worldwide
  excludedRegions?: string[];
}

export enum DealAvailability {
  InStock = 'in_stock',
  LimitedAvailability = 'limited_availability',
  SoldOut = 'sold_out',
  Discontinued = 'discontinued',
}
```

Added to `Deal`:

| Field | Type | Why |
|---|---|---|
| `partnerUrl` | `string` | **The single most important addition.** There is currently no outbound destination on a `Deal` at all. Blocks the CTA, `Offer`, the feed and any agent. |
| `partnerUrlIsAffiliate` | `boolean` | Drives the FTC disclosure. Today disclosure keys off `DealType.Affiliate`, which is wrong — a `PromoCode` deal can carry a commission. |
| `merchant` | `DealMerchant` | Replaces `brand`. |
| `price` | `DealPrice` | Replaces free-text `value.label` (keep the label for display). |
| `validFrom` | `string` | ISO. |
| `validThrough` | `string \| undefined` | ISO. Replaces `expiresAt`; required on every time-boxed deal. |
| `availability` | `DealAvailability` | Explicit, not inferred from `DealState`. |
| `eligibility` | `DealEligibility` | Today eligibility hides inside free-text `terms`. |
| `createdAt` / `updatedAt` | `string` | `updatedAt` drives `dateModified`, the `(Month YYYY)` title token and sitemap `lastmod`. |
| `verification` | `DealVerification` | Replaces `community.lastVerifiedAgo`. |
| `categorySlugs` | `string[]` | Replaces free-text `categories`. |
| `successorSlug` | `string \| undefined` | The named replacement that makes a 301 legitimate. |
| `termsUrl` | `string \| undefined` | The merchant's own terms page — the "cite sources" GEO lever. |
| `isYmyl` | `boolean` | Finance/credit/insurance/crypto offers take the stricter editorial bar. |

## Categories must become entities

New `packages/shared/src/features/deals/dealCategories.ts`:

```ts
export interface DealCategory {
  slug: string;        // 'ai-tools'
  name: string;        // 'AI tools'
  description: string; // meta description
  seoIntro: string;    // unique on-page copy, 80-150 words
}
```

Without `seoIntro`, category pages are near-duplicates distinguished only by a card grid — the definition of a doorway page, and the scaled-content-abuse pattern. **No intro, no index.**

---

# H. Anti-patterns and risk register

| # | Risk | Trigger | Mitigation |
|---|---|---|---|
| 1 | **Site reputation abuse** | A partner or white-label operator running `/deals`, or rendering a syndicated coupon feed as our editorial | Merchant-direct or community-sourced only. Google explicitly exempts *"coupons sourced directly from merchants."* Note the Nov 2024 change: **first-party oversight is no longer a defence** for third-party content, so this is about *sourcing*, not supervision. |
| 2 | **Scaled content abuse** | Templated per-merchant pages with substituted names | The literal QRG Lowest example. Every indexed page needs `whyPick`. |
| 3 | **Thin affiliation** | Deal pages restating merchant copy | `whyPick` required for indexing; Google's named added-value features (price data, comparisons, category navigation, testing) are all in the content shape in §E |
| 4 | **Doorway category pages** | `/deals/category/*` with 3 deals and no copy | ≥6 live offers + `seoIntro` |
| 5 | **Misleading structured data** | `worksRate` as `AggregateRating`; unverifiable `Offer.price`; `validThrough` in the future on a dead offer | Mark up only what is visible and verified; drive expiry from `validThrough` |
| 6 | **Soft-404 farm** | 200 responses for empty facets and unknown slugs (**both are current behaviour**) | `notFound: true` everywhere; expired pages must carry live alternatives |
| 7 | **Expired-deal spam** | Thousands of thin expired pages farming brand queries | Expired pages must be genuinely useful or 410 |
| 8 | **Cloaking** | Affiliate redirect in `Offer.url`; different content by user agent | `Offer.url` is our page. ISR serves identical HTML to everyone — explicitly not cloaking. |
| 9 | **Fake freshness** | `lastVerifiedAgo: '2h ago'` frozen in an ISR cache — **current behaviour** | Real `lastVerifiedAt`, relative label computed at render |
| 10 | **Self-serving / incentivised reviews** | Rating tools we earn commission on | Never rate our own products; never present redemption rate as product quality; disclose any incentive |
| 11 | **YMYL creep** | Adding credit-card, BNPL or crypto offers under the same editorial bar | `isYmyl` flag + stricter gate |
| 12 | **Crawl budget waste** | Indexable multi-facet combinations | Two facet dimensions, never combined; the rest on fragments |
| 13 | **Regulatory whiplash** | The EC's DMA proceedings could change the policy under us | Enforcement is still **manual only** as of Aug 2026 and the DMA case is unresolved. Build to the compliant posture regardless — it is also the better product. |
| 14 | **FTC non-compliance** | Disclosure missing or buried | See below |

## FTC disclosure

Current state: the disclosure appears only when `deal.type === DealType.Affiliate`, in `DealCard.tsx` and `DealDetailModal.tsx`. It is **absent from `DealShareLanding`** — the logged-out acquisition front door and most likely first contact.

Required:
1. Key off **`partnerUrlIsAffiliate`**, not `DealType`. A `PromoCode` or `Credit` deal can carry a commission.
2. Render **above or adjacent to the CTA**, not in a footer.
3. Present on **every surface**: card, modal, deal page, share landing, markdown mirror, JSON feed (`publisher.affiliate_disclosure`).
4. Pair with the `01-product-spec.md` trust rule wherever picks are shown.

The visible disclosure is the legal requirement; the feed field is what stops an agent stripping it when it relays our offer. And per the QRG bulldog-wipes example, **disclosure alone does not rescue a thin page** — it is necessary, not sufficient.

---

# I. Implementation plan

## Phase 0 — mock-safe, buildable now (no backend)

| # | File | Change |
|---|---|---|
| 1 | `packages/shared/src/features/deals/types.ts` | §G fields. **Coordinate — another agent holds this file.** |
| 2 | `packages/shared/src/features/deals/dealCategories.ts` | New. Category entities with `seoIntro`. |
| 3 | `packages/shared/src/features/deals/mockDeals.ts` | Populate `partnerUrl`, `price`, `merchant`, real ISO dates, `verification`. |
| 4 | `.../components/DealCard.tsx` | Wrap title in `<a href="/deals/{slug}">`. Disclosure keys off `partnerUrlIsAffiliate`. |
| 5 | `.../components/DealsFilterBar.tsx` | Split category (URL) from `Expiring`/`Exclusive` (fragment state). |
| 6 | `.../components/DealsDirectoryPage.tsx` | Accept category from props; sync search to `?q=`. |
| 7 | `.../components/DealShareLanding.tsx` | Add the affiliate disclosure. |
| 8 | `packages/webapp/lib/dealsSeo.ts` | New. `shouldNoindexDeal`, title/description builders, canonical helpers. |
| 9 | `packages/webapp/components/DealSEOSchema.tsx` + `.spec.ts` | New. §C graph, following `PostSEOSchema.tsx`. |
| 10 | `packages/webapp/pages/deals/[slug].tsx` | `getStaticProps` + `getStaticPaths` `fallback: 'blocking'`, `revalidate: 900`; real per-deal SEO; `notFound: true` on miss; canonical strips `?ref`; directory-framed page with an optional sharer banner. Remove `noindex`. |
| 11 | `packages/webapp/pages/deals/index.tsx` | Remove `noindex`; ISR; `ItemList` schema; move the wallet tab to its own route. |
| 12 | `packages/webapp/pages/deals/brand/[brand].tsx` | New. **Highest priority page type.** Model on `pages/sources/[source].tsx`. |
| 13 | `packages/webapp/pages/deals/category/[category].tsx` | New. Model on `pages/tags/[tag].tsx`. |
| 14 | `packages/webapp/pages/deals/ending-soon.tsx` | New. Indexable scarcity surface. |
| 15 | `packages/webapp/pages/deals/claimed.tsx` | New. `noindex, follow`. |
| 16 | `packages/webapp/lib/markdownRoutes.ts` | Register `/deals` and `/deals/:slug.md`. |
| 17 | `packages/webapp/middleware.ts` | Extend matcher to `/deals/:slug`. |
| 18 | `packages/webapp/pages/api/md/deals.ts`, `.../deals/[slug].ts` | New. House style per `api/md/tags.ts`, 5-minute cache. |
| 19 | `packages/webapp/pages/api/deals/feed.json.ts` | New. §F2. |

**Verification:** `node ./scripts/typecheck-strict-changed.js`; `pnpm --filter webapp test` **and** `pnpm --filter shared test` (shared components change, so both); lint on both packages. Validate emitted JSON-LD against the Rich Results Test and Schema Markup Validator before merge.

## Phase 1 — backend-dependent

| Item | Owner |
|---|---|
| `deals.xml`, `deals-categories.xml`, `deals-brands.xml` added to the API sitemap index (16 children today, no `lastmod` — add accurate `lastmod` for deals) | daily-api |
| On-demand `res.revalidate('/deals/{slug}')` webhook on price/availability/verification change, plus an IndexNow ping from the same event | daily-api + webapp |
| Real `lastVerifiedAt` from the verification pipeline | daily-api |
| Per-offer OG image service | infra |
| `merchant.sameAs` entity IDs | content ops |
| Merchant-direct sourcing agreements (the §A1 compliance requirement) | BD |

## Phase 2 — cross-repo (marketing site, `recruiter-landing`)

| Item | Note |
|---|---|
| Add the `## Deals` section to `/llms.txt` | §F3 |
| **Fix the duplicate user-agent groups in `/robots.txt`** | Correctness fix, not a policy change |
| Resolve `Content-Signal: ai-train=no` vs `Allow: /` for GPTBot/ClaudeBot | Recommendation: drop `ai-train=no` |

## Phase 3 — agentic

| Item | Gate |
|---|---|
| `daily-dev-deals` MCP server against spec `2026-07-28` (stateless; `ttlMs`/`cacheScope` on `tools/list`) | Ship only after the JSON feed shows real agent traffic |
| Publish a UCP agent profile at `/.well-known/ucp` to act as a platform against UCP businesses | Separate product scoping. This is the one rail where being a non-merchant is not disqualifying. |
| Re-check the Perplexity/Amazon appellate ruling before any extension-side auto-apply work | Ruling is 3 days old; claims still live |

## Deliberately out of scope

- Merchant Center promotions feed and coupon rich results — requires being the merchant; affiliates are barred except as a CSS.
- FAQPage markup — rich results ended May 2026.
- `AggregateRating` on deals — until we collect genuine product ratings.
- OpenAI Instant Checkout — retired from ChatGPT in March 2026, and seller-side regardless.
- OpenAI Plugins monetisation — limited to physical goods; excludes most of our SaaS catalogue.
- `unavailable_after` — unreliable below a weekly cadence.

---

## Open questions

1. **Fix two claims in the existing plan docs before they reach a deck:**
   - `00-research.md`'s Wirecutter/$75.5M framing is wrong (§0.1). Replace it with the coupon-category extinction, which is well documented, and with the channel-mix reality in §0.2.
   - `02-growth-loops.md` says the directory targets `"X promo code for developers"` queries. **That qualifier does not exist in the query space** (§A7). Loop 5 needs rewriting around `{brand} promo code`, `{brand} student discount`, `{tool} for startups` and `startup credits`.
2. **Which origin do deal pages live on** — `app.daily.dev` or `daily.dev`? Examples assume `getAppOrigin()`. This determines canonicals and which sitemap index the deals shards join.
3. **Do we have merchant `sameAs` identifiers?** Entity anchoring on brand pages is the highest-leverage schema work available and needs a content-ops input we do not have.
4. **Does daily-api model deals at all yet?** All of Phase 1 assumes a `deals` table with change events.
5. **Do we want the brand-page URL keyed on slug or domain?** Capital One Shopping keys on domain (`/s/nike.com/coupon`), which is unambiguous for entity resolution and avoids slug collisions between similarly-named tools. Worth deciding before URLs ship, because it is expensive to change later.
6. ⚠️ **Single-sourced and worth re-verifying before external use:** the Similarweb channel-mix figures in §0.2/§A7, the Black Friday 70%-of-volume seasonality claim, and the "71% of affiliate sites hit" figure circulating about the Dec 2025 / Mar 2026 core updates (primary study never located).
